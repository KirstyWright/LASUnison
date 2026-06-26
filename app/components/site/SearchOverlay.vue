<script setup lang="ts">
/**
 * SiteSearchOverlay — the site-wide search, command-palette style. Opened from
 * the header search button or Cmd/Ctrl+K, it searches every published page
 * (content, news, legal) plus documents and links via /api/search, showing
 * live grouped results as you type. Mounted once in app.vue.
 *
 * Keyboard: ↑/↓ move the highlight, Enter opens it, Esc closes. Clicking a
 * result, the scrim, or navigating also closes it.
 */
import {
  EMPTY_RESULTS, highlightParts, searchHostLabel,
  type SearchResponse,
} from '~/utils/search'

const { isOpen, open, close } = useSiteSearch()
const { search: searchSite, ensureLoaded } = useSiteSearchEngine()
const router = useRouter()

// Resolve the real component — binding :is to the string 'NuxtLink' renders an
// (inert) <nuxtlink> element that never navigates, so result rows only worked
// via the keyboard (which calls navigateTo directly).
const NuxtLink = resolveComponent('NuxtLink')

const query = ref('')
const results = ref<SearchResponse>(EMPTY_RESULTS)
const loading = ref(false)
const activeIndex = ref(-1)
const mounted = ref(false)

const inputEl = ref<HTMLInputElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const listEl = ref<HTMLElement | null>(null)

const SUGGESTIONS = ['Pay', 'Pensions', 'Health & safety', 'Find a rep', 'Bulletins']

// How many of each group to surface in the overlay (the /search page shows all).
const CAPS = { pages: 5, news: 5, documents: 4, links: 4 } as const
const GROUPS = [
  { key: 'pages', label: 'Pages', icon: 'file' },
  { key: 'news', label: 'News', icon: 'megaphone' },
  { key: 'documents', label: 'Documents', icon: 'download' },
  { key: 'links', label: 'Links', icon: 'arrowUpRight' },
] as const

const trimmed = computed(() => query.value.trim())
const hasQuery = computed(() => trimmed.value.length > 0)

function isExternal(url: string): boolean {
  return /^https?:\/\//.test(url)
}

interface FlatItem {
  index: number
  group: string
  to?: string
  href?: string
  external: boolean
  title: string
  snippet?: string
  meta?: string
}

/** Ordered, capped, index-stamped list of every visible result row. */
const items = computed<FlatItem[]>(() => {
  const r = results.value
  const out: Omit<FlatItem, 'index'>[] = []

  for (const p of r.pages.slice(0, CAPS.pages)) {
    out.push({ group: 'pages', to: p.path, external: false, title: p.title || p.path, snippet: p.snippet })
  }
  for (const n of r.news.slice(0, CAPS.news)) {
    const date = n.date ? new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
    out.push({ group: 'news', to: n.path, external: false, title: n.title, snippet: n.snippet, meta: [n.category, date].filter(Boolean).join(' · ') })
  }
  for (const d of r.documents.slice(0, CAPS.documents)) {
    out.push({ group: 'documents', href: d.url, external: isExternal(d.url), title: d.title, meta: [d.type, d.topic].filter(Boolean).join(' · ') })
  }
  for (const l of r.links.slice(0, CAPS.links)) {
    out.push({ group: 'links', href: l.url, external: true, title: l.label, meta: [l.note, searchHostLabel(l.url)].filter(Boolean).join(' · ') })
  }

  return out.map((it, index) => ({ ...it, index }))
})

function groupItems(key: string): FlatItem[] {
  return items.value.filter(i => i.group === key)
}

const showSeeAll = computed(() => results.value.total > items.value.length)

/* ----------------------------------------------------- debounced fetching */
let debounce: ReturnType<typeof setTimeout> | null = null
let token = 0

watch(query, () => {
  activeIndex.value = -1
  if (debounce) clearTimeout(debounce)
  const q = trimmed.value
  if (!q) {
    results.value = EMPTY_RESULTS
    loading.value = false
    return
  }
  loading.value = true
  debounce = setTimeout(() => runSearch(q), 180)
})

async function runSearch(q: string) {
  const mine = ++token
  try {
    const data = await searchSite(q)
    if (mine !== token) return // a newer keystroke won
    results.value = data
  }
  catch {
    if (mine === token) results.value = EMPTY_RESULTS
  }
  finally {
    if (mine === token) loading.value = false
  }
}

/* --------------------------------------------------------- navigation */
function go(item: FlatItem | undefined) {
  if (!item) {
    if (hasQuery.value) seeAll()
    return
  }
  close()
  if (item.to) {
    navigateTo(item.to)
  }
  else if (item.href) {
    if (item.external) window.open(item.href, '_blank', 'noopener')
    else navigateTo(item.href, { external: true })
  }
}

function seeAll() {
  if (!hasQuery.value) return
  close()
  navigateTo({ path: '/search', query: { q: trimmed.value } })
}

function pick(term: string) {
  query.value = term
  nextTick(() => inputEl.value?.focus())
}

/* --------------------------------------------------------- keyboard */
function onInputKeydown(e: KeyboardEvent) {
  const n = items.value.length
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!n) return
    activeIndex.value = activeIndex.value < n - 1 ? activeIndex.value + 1 : 0
    scrollActiveIntoView()
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (!n) return
    activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : n - 1
    scrollActiveIntoView()
  }
  else if (e.key === 'Enter') {
    e.preventDefault()
    go(activeIndex.value >= 0 ? items.value[activeIndex.value] : items.value[0])
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    listEl.value?.querySelector<HTMLElement>(`[data-idx="${activeIndex.value}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  })
}

/* Keep focus inside the panel while open (lightweight Tab trap). */
function onPanelKeydown(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !panelEl.value) return
  const focusable = panelEl.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
  )
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const act = document.activeElement
  if (e.shiftKey && act === first) {
    e.preventDefault()
    last.focus()
  }
  else if (!e.shiftKey && act === last) {
    e.preventDefault()
    first.focus()
  }
}

/* --------------------------------------------------------- open/close side-effects */
watch(isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    // Warm the in-browser index now so the first keystroke ranks instantly.
    ensureLoaded()
    nextTick(() => {
      inputEl.value?.focus()
      inputEl.value?.select()
    })
  }
  else {
    document.body.style.overflow = ''
  }
})

function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    if (isOpen.value) close()
    else open()
  }
  else if (e.key === 'Escape' && isOpen.value) {
    e.preventDefault()
    close()
  }
}

let removeAfterEach: (() => void) | null = null

onMounted(() => {
  mounted.value = true
  window.addEventListener('keydown', onGlobalKeydown)
  // Close on every confirmed navigation (covers result selection by click or
  // keyboard, and any other route change). afterEach is more reliable here than
  // watching the route while the overlay teleports + transitions.
  removeAfterEach = router.afterEach(() => { if (isOpen.value) close() })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  removeAfterEach?.()
  document.body.style.overflow = ''
})
</script>

<template>
  <ClientOnly>
    <Teleport
      v-if="mounted"
      to="body"
    >
      <!-- No Vue <Transition> here on purpose: a teleported transition can be
           orphaned (left visible) when navigateTo re-renders the app mid-leave.
           Presence is driven by v-if (instant, reliable close); the enter is a
           pure CSS animation on the scrim + panel. -->
      <div
        v-if="isOpen"
        class="search-overlay fixed inset-0 z-[1000] flex items-start justify-center px-4 pt-[12vh] sm:pt-[14vh]"
        @keydown="onPanelKeydown"
      >
        <!-- Scrim -->
        <div
          class="search-scrim absolute inset-0 bg-[var(--purple-950)]/55 backdrop-blur-[2px]"
          aria-hidden="true"
          @click="close"
        />

        <!-- Panel -->
        <div
          ref="panelEl"
          role="dialog"
          aria-modal="true"
          aria-label="Search the site"
          class="search-panel relative w-full max-w-[640px] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--surface-card)] font-[family-name:var(--font-sans)] shadow-[var(--shadow-xl)] ring-1 ring-[var(--border-subtle)]"
        >
          <!-- Search field -->
          <div class="flex h-[64px] items-center gap-3 border-b border-[var(--border-subtle)] px-5">
            <span
              class="flex-none text-[var(--text-subtle)]"
              aria-hidden="true"
            >
              <UiIcon
                name="search"
                :size="22"
                :stroke="2"
              />
            </span>
            <input
              ref="inputEl"
              v-model="query"
              type="text"
              role="combobox"
              :aria-expanded="items.length > 0 ? 'true' : 'false'"
              aria-controls="site-search-list"
              :aria-activedescendant="activeIndex >= 0 ? `site-search-opt-${activeIndex}` : undefined"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              enterkeyhint="search"
              placeholder="Search pages, news, documents…"
              aria-label="Search the site"
              class="h-full min-w-0 flex-1 border-none bg-transparent text-[length:var(--text-md)] text-[var(--text-strong)] outline-none placeholder:text-[var(--text-subtle)]"
              @keydown="onInputKeydown"
            >
            <span
              v-if="loading"
              class="size-4 flex-none animate-spin rounded-full border-2 border-[var(--border-default)] border-t-[var(--brand-primary)]"
              aria-hidden="true"
            />
            <button
              type="button"
              aria-label="Close search"
              class="inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-none bg-[var(--surface-sunken)] text-[var(--text-muted)] hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
              @click="close"
            >
              <UiIcon
                name="x"
                :size="18"
                :stroke="2.2"
              />
            </button>
          </div>

          <!-- Body -->
          <div
            id="site-search-list"
            ref="listEl"
            role="listbox"
            aria-label="Search results"
            class="max-h-[min(60vh,520px)] overflow-y-auto overscroll-contain"
          >
            <!-- Idle: suggestions -->
            <div
              v-if="!hasQuery"
              class="p-5"
            >
              <p class="m-0 mb-3 text-[0.8125rem] font-bold tracking-[0.06em] text-[var(--text-subtle)] uppercase">
                Try searching for
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="s in SUGGESTIONS"
                  :key="s"
                  type="button"
                  class="inline-flex h-9 cursor-pointer items-center rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-card)] px-3.5 text-[0.875rem] font-semibold text-[var(--text-body)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
                  @click="pick(s)"
                >
                  {{ s }}
                </button>
              </div>
              <p class="m-0 mt-5 flex items-center gap-1.5 text-[0.8125rem] text-[var(--text-subtle)]">
                <kbd class="rounded border border-[var(--border-default)] bg-[var(--surface-sunken)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[0.75rem]">↑↓</kbd>
                to navigate
                <kbd class="rounded border border-[var(--border-default)] bg-[var(--surface-sunken)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[0.75rem]">↵</kbd>
                to open
                <kbd class="rounded border border-[var(--border-default)] bg-[var(--surface-sunken)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[0.75rem]">esc</kbd>
                to close
              </p>
            </div>

            <!-- Empty -->
            <div
              v-else-if="!loading && results.total === 0"
              class="px-5 py-12 text-center"
            >
              <p class="m-0 mb-1 font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold text-[var(--text-strong)]">
                No matches
              </p>
              <p class="m-0 text-[0.875rem] text-[var(--text-muted)]">
                Nothing matched “{{ trimmed }}”. Try fewer or different words.
              </p>
            </div>

            <!-- Results -->
            <div
              v-else
              class="py-2"
            >
              <template
                v-for="g in GROUPS"
                :key="g.key"
              >
                <section
                  v-if="groupItems(g.key).length"
                  :aria-label="g.label"
                >
                  <h2 class="m-0 flex items-center gap-2 px-5 pt-3 pb-1.5 text-[0.75rem] font-bold tracking-[0.07em] text-[var(--text-subtle)] uppercase">
                    <UiIcon
                      :name="g.icon"
                      :size="14"
                      :stroke="2"
                    />
                    {{ g.label }}
                    <span class="font-[family-name:var(--font-mono)] font-medium text-[var(--text-subtle)]/80">{{ results.counts[g.key as keyof typeof results.counts] }}</span>
                  </h2>

                  <component
                    :is="item.to ? NuxtLink : 'a'"
                    v-for="item in groupItems(g.key)"
                    :id="`site-search-opt-${item.index}`"
                    :key="item.to || item.href"
                    :data-idx="item.index"
                    role="option"
                    :aria-selected="activeIndex === item.index"
                    v-bind="item.to ? { to: item.to } : { href: item.href, target: item.external ? '_blank' : undefined, rel: item.external ? 'noopener' : undefined }"
                    class="group/row flex cursor-pointer scroll-mt-2 items-start gap-3 px-5 py-2.5 no-underline"
                    :class="activeIndex === item.index ? 'bg-[var(--brand-primary-soft)]' : 'hover:bg-[var(--surface-sunken)]'"
                    @click="close"
                    @mousemove="activeIndex = item.index"
                  >
                    <span
                      class="mt-0.5 inline-flex size-8 flex-none items-center justify-center rounded-[var(--radius-md)]"
                      :class="activeIndex === item.index ? 'bg-white text-[var(--brand-primary)]' : 'bg-[var(--surface-sunken)] text-[var(--text-muted)]'"
                      aria-hidden="true"
                    >
                      <UiIcon
                        :name="g.icon"
                        :size="16"
                        :stroke="2"
                      />
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="flex items-center gap-1.5">
                        <span
                          class="block truncate font-semibold text-[var(--text-strong)] group-hover/row:text-[var(--brand-primary)]"
                          :class="activeIndex === item.index ? 'text-[var(--brand-primary)]' : ''"
                        >
                          <template
                            v-for="(part, i) in highlightParts(item.title, query)"
                            :key="i"
                          ><mark
                            v-if="part.hit"
                            class="rounded-[2px] bg-[var(--brand-highlight-soft)] px-0.5 text-inherit"
                          >{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                        </span>
                        <UiIcon
                          v-if="item.external"
                          name="arrowUpRight"
                          :size="13"
                          :stroke="2"
                          class="flex-none text-[var(--text-subtle)]"
                        />
                      </span>
                      <span
                        v-if="item.snippet"
                        class="mt-0.5 block truncate text-[0.8125rem] text-[var(--text-muted)]"
                      >
                        <template
                          v-for="(part, i) in highlightParts(item.snippet, query)"
                          :key="i"
                        ><mark
                          v-if="part.hit"
                          class="bg-transparent font-semibold text-[var(--text-body)]"
                        >{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                      </span>
                      <span
                        v-else-if="item.meta"
                        class="mt-0.5 block truncate text-[0.8125rem] text-[var(--text-muted)]"
                      >{{ item.meta }}</span>
                    </span>
                  </component>
                </section>
              </template>

              <!-- See all -->
              <div
                v-if="showSeeAll"
                class="px-5 pt-2 pb-1"
              >
                <button
                  type="button"
                  class="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] text-[0.875rem] font-bold text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
                  @click="seeAll"
                >
                  See all {{ results.total }} results
                  <UiIcon
                    name="arrowRight"
                    :size="16"
                    :stroke="2"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
/* Entrance animations play once when the overlay mounts (v-if). There is
   deliberately no leave animation — closing removes the node instantly, which
   avoids a teleported transition being stranded when navigation re-renders. */
.search-scrim {
  animation: search-scrim-in 150ms ease-out;
}
.search-panel {
  animation: search-panel-in 200ms ease-out;
}
@keyframes search-scrim-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes search-panel-in {
  from { opacity: 0; transform: translateY(-8px) scale(0.98); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .search-scrim, .search-panel { animation: none; }
}
</style>
