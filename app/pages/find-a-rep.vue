<script setup lang="ts">
const { data: repsData } = await useAsyncData('reps', () =>
  queryCollection('reps').all(),
)

// Split the reps collection into station records and sector records.
const allStations = computed(() =>
  (repsData.value ?? [])
    .filter((r: any) => r.kind === 'station')
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
)

// Sectors — their name, blurb and panel order — come from
// content/reps/sectors/*.yml (editable in Studio), ordered by `order`.
const sectors = computed(() =>
  (repsData.value ?? [])
    .filter((r: any) => r.kind === 'sector')
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    .map((r: any) => ({ slug: r.sector, name: r.name, description: r.description })),
)

const seniorRepsBySector = computed(() => {
  const map: Record<string, any[]> = {}
  for (const r of repsData.value ?? []) {
    if (r.kind === 'sector') map[r.sector] = r.seniorReps ?? []
  }
  return map
})

const search = ref('')
const activeStation = ref<string | null>(null)
const mobileView = ref<'list' | 'map'>('list')

// Refs for keeping results in view when the filter changes (see watcher below).
const searchBar = ref<HTMLElement | null>(null)
const results = ref<HTMLElement | null>(null)

// Sticky-offset wiring. The search bar pins below the site header; the desktop
// map pins below header + search bar; a scrolled-to station row must clear both.
// Rather than hard-code pixel offsets (which silently drift if the header height
// ever changes — e.g. a notice banner returns), measure the real elements and
// re-measure on resize. SSR falls back to the --header-h-based defaults below.
const siteHeader = ref<{ $el?: HTMLElement } | null>(null)
const headerH = ref(118) // = --header-h
const mapTop = ref(187) // header + search bar
const rowScrollMt = ref(195) // mapTop + a little breathing room

let stickyObserver: ResizeObserver | null = null
function measureSticky() {
  const h = siteHeader.value?.$el?.offsetHeight ?? headerH.value
  const bar = searchBar.value?.offsetHeight ?? 0
  headerH.value = h
  mapTop.value = h + bar
  rowScrollMt.value = h + bar + 8
}

onMounted(() => {
  measureSticky()
  stickyObserver = new ResizeObserver(measureSticky)
  if (siteHeader.value?.$el) stickyObserver.observe(siteHeader.value.$el)
  if (searchBar.value) stickyObserver.observe(searchBar.value)
})
onBeforeUnmount(() => stickyObserver?.disconnect())

// Filtering shrinks the results list but leaves its top in place, so a viewport
// scrolled down into the old (longer) list can end up below the new content.
// On each search change, snap back to the top of the results (just under the
// pinned header + sticky search bar) — but only when already scrolled past it,
// so typing from the top of the page never causes a jump.
//
// The target must be scroll-independent: deriving it from the bar's live rect
// breaks once the bar un-sticks near the top (its bottom then moves with the
// scroll, nudging the page up another notch on every keystroke). So use the
// results' absolute document offset and the bar's sticky offset + layout height.
watch(search, () => {
  const bar = searchBar.value
  const list = results.value
  if (!bar || !list) return
  const listTop = list.getBoundingClientRect().top + window.scrollY
  const stickyTop = parseFloat(getComputedStyle(bar).top) || 0
  const target = listTop - stickyTop - bar.offsetHeight - 8
  if (window.scrollY > target) {
    window.scrollTo({ top: Math.max(0, target), behavior: 'instant' })
  }
})

// Filter stations by search query (workplace name or sector name)
const filteredStations = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return allStations.value
  return allStations.value.filter((s: any) => {
    const sectorName = sectors.value.find(sec => sec.slug === s.sector)?.name ?? ''
    return (
      s.name.toLowerCase().includes(q)
      || sectorName.toLowerCase().includes(q)
      || (s.aliases ?? []).some((a: string) => a.toLowerCase().includes(q))
    )
  })
})

// Group filtered stations by sector, attach each sector's senior rep(s)
const filteredSectors = computed(() =>
  sectors.value
    .map(sector => ({
      ...sector,
      stations: filteredStations.value.filter((s: any) => s.sector === sector.slug),
      seniorReps: seniorRepsBySector.value[sector.slug] ?? [],
    }))
    .filter(s => s.stations.length > 0),
)

// Only stations with coordinates get a map pin (non-geographic workplaces are
// list-only). Workplaces that share an exact location — e.g. the EOC HQ watches,
// all at Waterloo — collapse to a single pin, labelled by their shared sub-area
// so it reads "EOC HQ" rather than one watch. The pin links to the first of the
// group, which sits inside that group in the list.
const mappableStations = computed(() => {
  const byLocation = new Map<string, any[]>()
  for (const s of filteredStations.value as any[]) {
    if (s.lat == null || s.lng == null) continue
    const key = `${s.lat},${s.lng}`
    if (!byLocation.has(key)) byLocation.set(key, [])
    byLocation.get(key)!.push(s)
  }
  return [...byLocation.values()].map((group) => {
    const first = group[0]
    const sharedArea
      = group.length > 1 && group.every(s => s.area && s.area === first.area)
        ? first.area
        : null
    return { slug: first.slug, name: sharedArea ?? first.name, lat: first.lat, lng: first.lng }
  })
})

const resultLabel = computed(() => {
  const n = filteredStations.value.length
  if (!search.value.trim()) return `${allStations.value.length} workplaces across London`
  return n === 0
    ? 'No workplaces match your search'
    : `${n} workplace${n === 1 ? '' : 's'} matching "${search.value.trim()}"`
})

function handleStationSelect(slug: string) {
  activeStation.value = slug
  mobileView.value = 'list'
  nextTick(() => {
    const el = document.getElementById(`station-${slug}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

useHead({ title: 'Find your rep — LAS UNISON' })
useSeoMeta({
  description:
    'Find out who represents you at your London Ambulance Service station — your UNISON workplace rep, health & safety rep and sector senior rep — and how to get in touch.',
})
</script>

<template>
  <div>
    <SiteHeader ref="siteHeader" />

    <main id="main-content">
      <!-- ── Masthead ─────────────────────────────────────────────────────── -->
      <section class="relative overflow-hidden bg-[var(--surface-brand)] text-white">
        <!-- Pulse, refined — live cardiac-monitor edge motif -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-x-0 bottom-0 text-[var(--brand-highlight)]"
        >
          <MotifPulse />
        </div>
        <div class="las-container relative py-14 md:py-[4.5rem]">
          <nav
            aria-label="Breadcrumb"
            class="mb-5 text-[0.875rem] text-[var(--purple-200)]"
          >
            <NuxtLink
              to="/"
              class="text-[var(--purple-200)] no-underline hover:text-white"
            >Home</NuxtLink>
            <span
              class="mx-2 opacity-50"
              aria-hidden="true"
            >/</span>
            <span
              class="font-semibold text-white"
              aria-current="page"
            >Find a rep</span>
          </nav>
          <div class="mb-[18px]">
            <UiEyebrow color="var(--brand-highlight)">
              Your branch at every station
            </UiEyebrow>
          </div>
          <h1
            class="text-wrap-balance m-0 font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.02] font-black tracking-[-0.02em] text-white"
          >
            Find your rep
          </h1>
          <p class="mt-5 mb-0 max-w-[560px] text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)]">
            Most LAS workplaces have a UNISON rep, and every sector has a senior rep.
            Search for your station to see who represents you.
          </p>
        </div>
      </section>

      <!-- ── Search + view toggle ───────────────────────────────────────── -->
      <div
        ref="searchBar"
        :style="{ top: `${headerH}px` }"
        class="sticky z-[100] border-b border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-xs)]"
      >
        <div class="las-container flex items-center gap-3 py-3">
          <!-- Search input -->
          <div class="relative flex-1">
            <UiIcon
              name="search"
              :size="18"
              :stroke="2"
              class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--text-subtle)]"
            />
            <input
              v-model="search"
              type="search"
              placeholder="Search by station or workplace…"
              class="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] pr-4 pl-10 text-[1rem] text-[var(--text-body)] transition-shadow duration-150 placeholder:text-[var(--text-subtle)] focus:border-transparent focus:ring-[3px] focus:ring-[var(--border-focus)] focus-visible:outline-none"
              aria-label="Search stations and workplaces"
              autocomplete="off"
            >
          </div>

          <!-- Mobile list/map toggle -->
          <div
            class="flex flex-none overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] lg:hidden"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              :aria-pressed="mobileView === 'list'"
              class="h-11 cursor-pointer border-none px-4 text-[0.875rem] font-bold transition-colors duration-150"
              :class="mobileView === 'list'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-[var(--surface-card)] text-[var(--text-body)] hover:bg-[var(--surface-sunken)]'"
              @click="mobileView = 'list'"
            >
              List
            </button>
            <button
              type="button"
              :aria-pressed="mobileView === 'map'"
              class="h-11 cursor-pointer border-l border-none border-[var(--border-default)] px-4 text-[0.875rem] font-bold transition-colors duration-150"
              :class="mobileView === 'map'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-[var(--surface-card)] text-[var(--text-body)] hover:bg-[var(--surface-sunken)]'"
              @click="mobileView = 'map'"
            >
              Map
            </button>
          </div>
        </div>
      </div>

      <!-- ── Main content ───────────────────────────────────────────────── -->
      <div
        ref="results"
        :style="{ '--reps-row-scroll-mt': `${rowScrollMt}px` }"
        class="las-container py-8 lg:py-10"
      >
        <!-- Result count -->
        <p
          class="mb-4 font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-muted)]"
          aria-live="polite"
        >
          {{ resultLabel }}
        </p>

        <div class="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8 xl:gap-10">
          <!-- ── Left: sector panels ─────────────────────────────────────── -->
          <div class="min-w-0">
            <!-- Mobile map view -->
            <div
              v-if="mobileView === 'map'"
              class="mb-6 h-[320px] overflow-hidden rounded-[var(--radius-xl)] lg:hidden"
            >
              <ClientOnly>
                <RepsMap
                  :stations="mappableStations"
                  :active-station="activeStation"
                  class="h-full"
                  @station-select="handleStationSelect"
                />
                <template #fallback>
                  <div class="flex h-full items-center justify-center rounded-[var(--radius-xl)] bg-[var(--surface-sunken)]">
                    <p class="text-[0.875rem] text-[var(--text-muted)]">
                      Loading map…
                    </p>
                  </div>
                </template>
              </ClientOnly>
            </div>

            <!-- Sector list (always shown on desktop, list mode on mobile) -->
            <div
              v-show="mobileView === 'list'"
              class="flex flex-col gap-5 lg:block lg:space-y-5"
            >
              <!-- Empty state -->
              <div
                v-if="filteredSectors.length === 0"
                class="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-default)] px-6 py-16 text-center"
              >
                <UiIcon
                  name="mapPin"
                  :size="32"
                  :stroke="1.5"
                  class="mx-auto mb-4 text-[var(--text-subtle)]"
                />
                <p class="m-0 mb-2 font-[family-name:var(--font-display)] text-[1.5rem] font-extrabold text-[var(--text-strong)]">
                  No workplaces found
                </p>
                <p class="m-0 mb-6 text-[var(--text-muted)]">
                  No workplaces match "{{ search }}". Try a different name.
                </p>
                <UiButton
                  variant="outline"
                  @click="search = ''"
                >
                  Clear search
                </UiButton>
              </div>

              <RepsSectorPanel
                v-for="sector in filteredSectors"
                :key="sector.slug"
                :sector="sector"
                :stations="sector.stations"
                :senior-reps="sector.seniorReps"
                :highlighted-station="activeStation"
                class="las-reveal"
              />
            </div>
          </div>

          <!-- ── Right: sticky map (desktop only) ──────────────────────── -->
          <aside class="hidden lg:block">
            <div
              :style="{ top: `${mapTop}px`, height: `calc(100vh - ${mapTop + 18}px)` }"
              class="sticky max-h-[640px] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] shadow-[var(--shadow-md)]"
            >
              <ClientOnly>
                <RepsMap
                  :stations="mappableStations"
                  :active-station="activeStation"
                  class="h-full"
                  @station-select="handleStationSelect"
                />
                <template #fallback>
                  <div class="flex h-full flex-col items-center justify-center gap-3 bg-[var(--surface-sunken)]">
                    <UiIcon
                      name="mapPin"
                      :size="28"
                      :stroke="1.5"
                      class="text-[var(--text-subtle)]"
                    />
                    <p class="text-[0.875rem] text-[var(--text-muted)]">
                      Loading map…
                    </p>
                  </div>
                </template>
              </ClientOnly>
            </div>
            <p class="mt-2 text-center text-[0.75rem] text-[var(--text-subtle)]">
              Click a pin to jump to that station
            </p>
            <p class="mt-2 text-center text-[length:var(--text-sm)] text-[var(--text-muted)]">
              Map pins aren't keyboard-accessible — use the search and list to find your station.
            </p>
          </aside>
        </div>
      </div>

      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>
