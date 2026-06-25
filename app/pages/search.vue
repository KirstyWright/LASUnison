<script setup lang="ts">
// Site-wide search results — the linkable, SSR-rendered counterpart to the
// header search overlay. Reads ?q= from the URL, fetches /api/search, and shows
// grouped results (pages, news, documents, links). Sharing one URL shares the
// exact search.
import {
  EMPTY_RESULTS, highlightParts, searchHostLabel,
  type SearchResponse,
} from '~/utils/search'

const route = useRoute()
const router = useRouter()

const q = ref((route.query.q as string) || '')

const { data: results, pending } = await useAsyncData<SearchResponse>(
  'site-search',
  () => {
    const query = ((route.query.q as string) || '').trim()
    if (!query) return Promise.resolve(EMPTY_RESULTS)
    return $fetch<SearchResponse>('/api/search', { query: { q: query } })
  },
  { watch: [() => route.query.q], default: () => EMPTY_RESULTS },
)

const queryText = computed(() => ((route.query.q as string) || '').trim())
const searching = computed(() => queryText.value.length > 0)

function isExternal(url: string): boolean {
  return /^https?:\/\//.test(url)
}
function newsDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Keep the field in sync with back/forward navigation.
watch(() => route.query.q, (v) => { q.value = (v as string) || '' })

// Debounced URL sync as the user types (replace, so we don't spam history).
let debounce: ReturnType<typeof setTimeout> | null = null
function onInput() {
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(() => {
    const next = q.value.trim()
    if (next === queryText.value) return
    router.replace({ query: next ? { q: next } : {} })
  }, 250)
}
function onSubmit() {
  if (debounce) clearTimeout(debounce)
  router.push({ query: q.value.trim() ? { q: q.value.trim() } : {} })
}
function clear() {
  q.value = ''
  router.replace({ query: {} })
}

useHead({ title: () => (searching.value ? `“${queryText.value}” — Search` : 'Search') + ' — LAS UNISON' })
useSeoMeta({ robots: 'noindex', description: 'Search every page, news post, document and link on the LAS UNISON site.' })
</script>

<template>
  <div>
    <SiteHeader />

    <main id="main-content">
      <!-- Masthead -->
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
            <span class="text-white font-semibold" aria-current="page">Search</span>
          </nav>
          <div class="mb-[18px]">
            <UiEyebrow color="var(--brand-highlight)">Search</UiEyebrow>
          </div>
          <h1
            class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-5xl)] leading-[1.02] tracking-[-0.02em] m-0 text-white"
          >
            Search the site
          </h1>
          <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)] mt-5 mb-8 max-w-[560px]">
            Every page, news post, document and link — search all of it in one place.
          </p>

          <form role="search" class="relative w-full max-w-[640px]" @submit.prevent="onSubmit">
            <label for="site-search-page" class="sr-only">Search the site</label>
            <span
              class="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] pointer-events-none"
              aria-hidden="true"
            >
              <UiIcon name="search" :size="22" :stroke="2" />
            </span>
            <input
              id="site-search-page"
              v-model="q"
              type="search"
              enterkeyhint="search"
              autocomplete="off"
              placeholder="Search pages, news, documents and links…"
              class="w-full h-[58px] pl-[3.25rem] pr-[3.25rem] bg-[var(--surface-card)] text-[var(--text-strong)] text-[length:var(--text-md)] rounded-[var(--radius-pill)] border-2 border-transparent shadow-[var(--shadow-lg)] placeholder:text-[var(--text-subtle)] focus:outline-none focus-visible:border-[var(--border-focus)] [&::-webkit-search-cancel-button]:appearance-none"
              @input="onInput"
            >
            <button
              v-show="q"
              type="button"
              aria-label="Clear search"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center rounded-full border-none bg-[var(--surface-sunken)] text-[var(--text-muted)] cursor-pointer hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
              @click="clear"
            >
              <UiIcon name="x" :size="18" :stroke="2.2" />
            </button>
          </form>
        </div>
      </section>

      <!-- Results -->
      <section class="las-section">
        <div class="las-container">
          <!-- Idle -->
          <div v-if="!searching" class="text-[var(--text-muted)] max-w-[520px]">
            <p class="m-0">Type above to search the whole site. You can also press
              <kbd class="font-[family-name:var(--font-mono)] text-[0.8125rem] px-1.5 py-0.5 rounded border border-[var(--border-default)] bg-[var(--surface-sunken)]">⌘K</kbd>
              anywhere to open quick search.
            </p>
          </div>

          <template v-else>
            <div class="flex items-baseline justify-between gap-4 flex-wrap mb-8">
              <h2 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-2xl)] text-[var(--text-strong)] m-0">
                {{ results.total }} result{{ results.total === 1 ? '' : 's' }}
                <span class="text-[var(--text-muted)] font-bold">for “{{ queryText }}”</span>
              </h2>
              <span v-if="pending" class="text-[0.875rem] text-[var(--text-muted)]">Searching…</span>
            </div>

            <!-- Nothing matched -->
            <div
              v-if="!pending && results.total === 0"
              class="text-center border border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] py-16 px-6"
            >
              <p class="font-[family-name:var(--font-display)] font-extrabold text-[1.5rem] text-[var(--text-strong)] m-0 mb-2">
                No matches
              </p>
              <p class="text-[var(--text-muted)] m-0 max-w-[420px] mx-auto">
                Nothing matched “{{ queryText }}”. Try fewer words or different terms.
              </p>
            </div>

            <div v-else class="flex flex-col gap-12">
              <!-- Pages -->
              <div v-if="results.pages.length">
                <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] m-0 mb-4">
                  Pages
                  <span class="font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-subtle)] font-medium ml-1">{{ results.counts.pages }}</span>
                </h3>
                <ul class="list-none p-0 m-0 grid gap-2">
                  <li v-for="p in results.pages" :key="p.path">
                    <NuxtLink :to="p.path" class="group block px-4 py-3.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] no-underline bg-[var(--surface-card)] transition-[border-color,box-shadow] duration-150 hover:border-[var(--border-default)] hover:shadow-[var(--shadow-sm)]">
                      <span class="block font-semibold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">
                        <template v-for="(part, i) in highlightParts(p.title || p.path, queryText)" :key="i"><mark v-if="part.hit" class="bg-[var(--brand-highlight-soft)] rounded-[2px] px-0.5">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                      </span>
                      <span v-if="p.snippet" class="block text-[0.875rem] text-[var(--text-muted)] mt-1 leading-snug">
                        <template v-for="(part, i) in highlightParts(p.snippet, queryText)" :key="i"><mark v-if="part.hit" class="bg-transparent text-[var(--text-body)] font-semibold">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                      </span>
                      <span class="block font-[family-name:var(--font-mono)] text-[0.75rem] text-[var(--text-subtle)] mt-1">{{ p.path }}</span>
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <!-- News -->
              <div v-if="results.news.length">
                <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] m-0 mb-4">
                  News
                  <span class="font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-subtle)] font-medium ml-1">{{ results.counts.news }}</span>
                </h3>
                <ul class="list-none p-0 m-0 grid gap-2">
                  <li v-for="n in results.news" :key="n.path">
                    <NuxtLink :to="n.path" class="group block px-4 py-3.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] no-underline bg-[var(--surface-card)] transition-[border-color,box-shadow] duration-150 hover:border-[var(--border-default)] hover:shadow-[var(--shadow-sm)]">
                      <span class="flex items-center gap-2 mb-1 text-[0.75rem] font-bold uppercase tracking-[0.05em] text-[var(--text-subtle)]">
                        <span v-if="n.category">{{ n.category }}</span>
                        <span v-if="n.category && n.date" aria-hidden="true">·</span>
                        <span v-if="n.date" class="font-medium normal-case tracking-normal">{{ newsDate(n.date) }}</span>
                      </span>
                      <span class="block font-semibold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">
                        <template v-for="(part, i) in highlightParts(n.title, queryText)" :key="i"><mark v-if="part.hit" class="bg-[var(--brand-highlight-soft)] rounded-[2px] px-0.5">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                      </span>
                      <span v-if="n.snippet" class="block text-[0.875rem] text-[var(--text-muted)] mt-1 leading-snug">
                        <template v-for="(part, i) in highlightParts(n.snippet, queryText)" :key="i"><mark v-if="part.hit" class="bg-transparent text-[var(--text-body)] font-semibold">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                      </span>
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <!-- Documents -->
              <div v-if="results.documents.length">
                <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] m-0 mb-4">
                  Documents
                  <span class="font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-subtle)] font-medium ml-1">{{ results.counts.documents }}</span>
                </h3>
                <ul class="list-none p-0 m-0 grid gap-1.5">
                  <li v-for="d in results.documents" :key="d.url">
                    <a
                      :href="d.url"
                      :target="isExternal(d.url) ? '_blank' : undefined"
                      :rel="isExternal(d.url) ? 'noopener' : undefined"
                      class="group flex items-center gap-3.5 px-4 py-3 rounded-[var(--radius-lg)] border border-transparent no-underline hover:bg-[var(--surface-card)] hover:border-[var(--border-subtle)] hover:shadow-[var(--shadow-sm)] transition-[background-color,border-color] duration-150"
                    >
                      <span class="flex-none inline-flex items-center justify-center w-11 h-11 rounded-[var(--radius-md)] bg-[var(--brand-accent-soft)] text-[var(--blue-700)]" aria-hidden="true">
                        <UiIcon name="download" :size="20" :stroke="2" />
                      </span>
                      <span class="flex-1 min-w-0">
                        <span class="block font-semibold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)] truncate">
                          <template v-for="(part, i) in highlightParts(d.title, queryText)" :key="i"><mark v-if="part.hit" class="bg-[var(--brand-highlight-soft)] rounded-[2px] px-0.5">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                        </span>
                        <span class="block text-[0.8125rem] text-[var(--text-muted)] mt-0.5">{{ [d.type, d.topic].filter(Boolean).join(' · ') }}</span>
                      </span>
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Links -->
              <div v-if="results.links.length">
                <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] m-0 mb-4">
                  Links
                  <span class="font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-subtle)] font-medium ml-1">{{ results.counts.links }}</span>
                </h3>
                <ul class="list-none p-0 m-0 grid gap-1.5 sm:grid-cols-2">
                  <li v-for="l in results.links" :key="l.url">
                    <a
                      :href="l.url"
                      target="_blank"
                      rel="noopener"
                      class="group flex items-center gap-3.5 px-4 py-3 rounded-[var(--radius-lg)] border border-transparent no-underline hover:bg-[var(--surface-card)] hover:border-[var(--border-subtle)] hover:shadow-[var(--shadow-sm)] transition-[background-color,border-color] duration-150"
                    >
                      <span class="flex-none inline-flex items-center justify-center w-11 h-11 rounded-[var(--radius-md)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary-strong)]" aria-hidden="true">
                        <UiIcon name="arrowUpRight" :size="20" :stroke="2" />
                      </span>
                      <span class="flex-1 min-w-0">
                        <span class="block font-semibold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)] truncate">
                          <template v-for="(part, i) in highlightParts(l.label, queryText)" :key="i"><mark v-if="part.hit" class="bg-[var(--brand-highlight-soft)] rounded-[2px] px-0.5">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                        </span>
                        <span class="block text-[0.8125rem] text-[var(--text-muted)] mt-0.5 truncate">{{ [l.note, searchHostLabel(l.url)].filter(Boolean).join(' · ') }}</span>
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- Help first, fast -->
      <div class="las-container pb-[var(--section-y)]">
        <UiEmergencyBar />
      </div>

      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>
