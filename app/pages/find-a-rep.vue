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
      s.name.toLowerCase().includes(q) ||
      sectorName.toLowerCase().includes(q) ||
      (s.aliases ?? []).some((a: string) => a.toLowerCase().includes(q))
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
    const sharedArea =
      group.length > 1 && group.every((s) => s.area && s.area === first.area)
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
      <section class="bg-[var(--surface-brand)] text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          class="absolute inset-0 opacity-50"
          :style="{
            backgroundImage: 'url(/pattern-pulse.svg)',
            backgroundSize: '320px auto',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'left bottom',
          }"
        />
        <div class="las-container relative py-14 md:py-[4.5rem]">
          <nav aria-label="Breadcrumb" class="mb-5 text-[0.875rem] text-[var(--purple-200)]">
            <NuxtLink to="/" class="text-[var(--purple-200)] no-underline hover:text-white">Home</NuxtLink>
            <span class="mx-2 opacity-50" aria-hidden="true">/</span>
            <span class="text-white font-semibold" aria-current="page">Find a rep</span>
          </nav>
          <div class="mb-[18px]">
            <UiEyebrow color="var(--brand-highlight)">Your branch at every station</UiEyebrow>
          </div>
          <h1
            class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-5xl)] leading-[1.02] tracking-[-0.02em] m-0 text-white text-wrap-balance"
          >
            Find your rep
          </h1>
          <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)] mt-5 mb-0 max-w-[560px]">
            Most LAS workplaces have a UNISON rep, and every sector has a senior rep.
            Search for your station to see who represents you.
          </p>
        </div>
      </section>

      <!-- ── Search + view toggle ───────────────────────────────────────── -->
      <div ref="searchBar" :style="{ top: headerH + 'px' }" class="bg-[var(--surface-card)] border-b border-[var(--border-subtle)] sticky z-[100] shadow-[var(--shadow-xs)]">
        <div class="las-container py-3 flex items-center gap-3">
          <!-- Search input -->
          <div class="relative flex-1">
            <UiIcon
              name="search"
              :size="18"
              :stroke="2"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] pointer-events-none"
            />
            <input
              v-model="search"
              type="search"
              placeholder="Search by station or workplace…"
              class="w-full h-11 pl-10 pr-4 bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-body)] text-[1rem] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-transparent focus:ring-[3px] focus:ring-[var(--border-focus)] transition-shadow duration-150"
              aria-label="Search stations and workplaces"
              autocomplete="off"
            />
          </div>

          <!-- Mobile list/map toggle -->
          <div
            class="lg:hidden flex rounded-[var(--radius-md)] border border-[var(--border-default)] overflow-hidden flex-none"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              class="px-4 h-11 text-[0.875rem] font-bold transition-colors duration-150 border-none cursor-pointer"
              :class="mobileView === 'list'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-[var(--surface-card)] text-[var(--text-body)] hover:bg-[var(--surface-sunken)]'"
              @click="mobileView = 'list'"
            >
              List
            </button>
            <button
              type="button"
              class="px-4 h-11 text-[0.875rem] font-bold transition-colors duration-150 border-none border-l border-[var(--border-default)] cursor-pointer"
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
      <div ref="results" :style="{ '--reps-row-scroll-mt': rowScrollMt + 'px' }" class="las-container py-8 lg:py-10">
        <!-- Result count -->
        <p
          class="font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-muted)] mb-4"
          aria-live="polite"
        >
          {{ resultLabel }}
        </p>

        <!-- How to reach a rep. Cards show a rep's email where we hold one; this is the
             route for the rest (and a safety net if a member isn't sure who to ask). -->
        <div class="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-4 py-3 mb-6 text-[0.8125rem] text-[var(--text-muted)]">
          <UiIcon name="mail" :size="16" :stroke="2" class="text-[var(--text-subtle)] flex-none mt-0.5" />
          <p class="m-0 leading-[1.5]">
            Not sure who to ask, or can’t see a rep’s contact details? Email the branch at
            <a
              href="mailto:branch@lasunison.com"
              class="font-semibold text-[var(--brand-primary)] no-underline hover:underline"
            >branch@lasunison.com</a>
            and we’ll point you to the right person.
          </p>
        </div>

        <div class="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8 xl:gap-10">
          <!-- ── Left: sector panels ─────────────────────────────────────── -->
          <div class="min-w-0">
            <!-- Mobile map view -->
            <div v-if="mobileView === 'map'" class="lg:hidden h-[320px] mb-6 rounded-[var(--radius-xl)] overflow-hidden">
              <ClientOnly>
                <RepsMap
                  :stations="mappableStations"
                  :active-station="activeStation"
                  class="h-full"
                  @station-select="handleStationSelect"
                />
                <template #fallback>
                  <div class="h-full bg-[var(--surface-sunken)] flex items-center justify-center rounded-[var(--radius-xl)]">
                    <p class="text-[var(--text-muted)] text-[0.875rem]">Loading map…</p>
                  </div>
                </template>
              </ClientOnly>
            </div>

            <!-- Sector list (always shown on desktop, list mode on mobile) -->
            <div v-show="mobileView === 'list'" class="flex flex-col gap-5 lg:block lg:space-y-5">
              <!-- Empty state -->
              <div
                v-if="filteredSectors.length === 0"
                class="text-center border border-dashed border-[var(--border-default)] rounded-[var(--radius-xl)] py-16 px-6"
              >
                <UiIcon name="mapPin" :size="32" :stroke="1.5" class="text-[var(--text-subtle)] mx-auto mb-4" />
                <p class="font-[family-name:var(--font-display)] font-extrabold text-[1.5rem] text-[var(--text-strong)] m-0 mb-2">
                  No workplaces found
                </p>
                <p class="text-[var(--text-muted)] m-0 mb-6">
                  No workplaces match "{{ search }}". Try a different name.
                </p>
                <UiButton variant="outline" @click="search = ''">Clear search</UiButton>
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
              :style="{ top: mapTop + 'px', height: `calc(100vh - ${mapTop + 18}px)` }"
              class="sticky max-h-[640px] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-md)] border border-[var(--border-subtle)]"
            >
              <ClientOnly>
                <RepsMap
                  :stations="mappableStations"
                  :active-station="activeStation"
                  class="h-full"
                  @station-select="handleStationSelect"
                />
                <template #fallback>
                  <div class="h-full bg-[var(--surface-sunken)] flex flex-col items-center justify-center gap-3">
                    <UiIcon name="mapPin" :size="28" :stroke="1.5" class="text-[var(--text-subtle)]" />
                    <p class="text-[var(--text-muted)] text-[0.875rem]">Loading map…</p>
                  </div>
                </template>
              </ClientOnly>
            </div>
            <p class="text-[0.75rem] text-[var(--text-subtle)] text-center mt-2">
              Click a pin to jump to that station
            </p>
          </aside>
        </div>
      </div>

      <!-- ── Footer CTAs ────────────────────────────────────────────────── -->
      <div class="las-container pb-[var(--section-y)]">
        <UiEmergencyBar />
      </div>
      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>
