<script setup lang="ts">
// Site-wide search results — the linkable counterpart to the header search
// overlay. Reads ?q= from the URL and shows grouped results (pages, news,
// documents, links). Sharing one URL shares the exact search.
import {
  EMPTY_RESULTS, highlightParts, searchHostLabel,
  type SearchResponse,
} from '~/utils/search'

const route = useRoute()
const router = useRouter()
const { search: searchSite } = useSiteSearchEngine()

const q = ref((route.query.q as string) || '')

// Search runs in the browser against @nuxt/content's WASM SQLite DB (server: false),
// so a Node-less static host serves results — and a direct /search?q=… load works,
// since it executes on the client with the real query rather than the empty
// prerendered payload.
const { data: results, pending } = await useAsyncData<SearchResponse>(
  'site-search',
  () => {
    const query = ((route.query.q as string) || '').trim()
    if (!query) return Promise.resolve(EMPTY_RESULTS)
    return searchSite(query)
  },
  { watch: [() => route.query.q], default: () => EMPTY_RESULTS, server: false },
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

useHead({ title: () => `${searching.value ? `“${queryText.value}” — Search` : 'Search'} — LAS UNISON` })
useSeoMeta({ robots: 'noindex', description: 'Search every page, news post, document and link on the LAS UNISON site.' })
</script>

<template>
  <div>
    <SiteHeader />

    <main id="main-content">
      <!-- Masthead -->
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
            >Search</span>
          </nav>
          <div class="mb-[18px]">
            <UiEyebrow color="var(--brand-highlight)">
              Search
            </UiEyebrow>
          </div>
          <h1
            class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.02] font-black tracking-[-0.02em] text-white"
          >
            Search the site
          </h1>
          <p class="mt-5 mb-8 max-w-[560px] text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)]">
            Every page, news post, document and link — search all of it in one place.
          </p>

          <form
            role="search"
            class="relative w-full max-w-[640px]"
            @submit.prevent="onSubmit"
          >
            <label
              for="site-search-page"
              class="sr-only"
            >Search the site</label>
            <span
              class="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-[var(--text-subtle)]"
              aria-hidden="true"
            >
              <UiIcon
                name="search"
                :size="22"
                :stroke="2"
              />
            </span>
            <input
              id="site-search-page"
              v-model="q"
              type="search"
              enterkeyhint="search"
              autocomplete="off"
              placeholder="Search pages, news, documents and links…"
              class="h-[58px] w-full rounded-[var(--radius-pill)] bg-[var(--surface-card)] px-[3.25rem] text-[length:var(--text-md)] text-[var(--text-strong)] shadow-[var(--shadow-lg)] placeholder:text-[var(--text-subtle)] [&::-webkit-search-cancel-button]:appearance-none"
              @input="onInput"
            >
            <button
              v-show="q"
              type="button"
              aria-label="Clear search"
              class="absolute top-1/2 right-3 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--surface-sunken)] text-[var(--text-muted)] hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
              @click="clear"
            >
              <UiIcon
                name="x"
                :size="18"
                :stroke="2.2"
              />
            </button>
          </form>
        </div>
      </section>

      <!-- Results -->
      <section class="las-section">
        <div class="las-container">
          <!-- Idle -->
          <div
            v-if="!searching"
            class="max-w-[520px] text-[var(--text-muted)]"
          >
            <p class="m-0">
              Type above to search the whole site. You can also press
              <kbd class="rounded border border-[var(--border-default)] bg-[var(--surface-sunken)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[0.8125rem]">⌘K</kbd>
              anywhere to open quick search.
            </p>
          </div>

          <!-- Search runs in the browser only (server: false), so there are no
               results to render on the server. Gate the results on <ClientOnly>
               to avoid a server/client hydration mismatch (the server would
               otherwise render the empty state, the client the real results). -->
          <ClientOnly v-else>
            <template #fallback>
              <p class="m-0 text-[0.875rem] text-[var(--text-muted)]">
                Searching…
              </p>
            </template>

            <div class="mb-8 flex flex-wrap items-baseline justify-between gap-4">
              <h2 class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] font-extrabold text-[var(--text-strong)]">
                {{ results.total }} result{{ results.total === 1 ? '' : 's' }}
                <span class="font-bold text-[var(--text-muted)]">for “{{ queryText }}”</span>
              </h2>
              <span
                v-if="pending"
                class="text-[0.875rem] text-[var(--text-muted)]"
              >Searching…</span>
            </div>

            <!-- Nothing matched -->
            <div
              v-if="!pending && results.total === 0"
              class="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] px-6 py-16 text-center"
            >
              <p class="m-0 mb-2 font-[family-name:var(--font-display)] text-[1.5rem] font-extrabold text-[var(--text-strong)]">
                No matches
              </p>
              <p class="m-0 mx-auto max-w-[420px] text-[var(--text-muted)]">
                Nothing matched “{{ queryText }}”. Try fewer words or different terms.
              </p>
            </div>

            <div
              v-else
              class="flex flex-col gap-12"
            >
              <!-- Pages -->
              <div v-if="results.pages.length">
                <h3 class="m-0 mb-4 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-[var(--text-strong)]">
                  Pages
                  <span class="ml-1 font-[family-name:var(--font-mono)] text-[0.8125rem] font-medium text-[var(--text-subtle)]">{{ results.counts.pages }}</span>
                </h3>
                <ul class="m-0 grid list-none gap-2 p-0">
                  <li
                    v-for="p in results.pages"
                    :key="p.path"
                  >
                    <NuxtLink
                      :to="p.path"
                      class="group block rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3.5 no-underline transition-[border-color,box-shadow] duration-150 hover:border-[var(--border-default)] hover:shadow-[var(--shadow-sm)]"
                    >
                      <span class="block font-semibold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">
                        <template
                          v-for="(part, i) in highlightParts(p.title || p.path, queryText)"
                          :key="i"
                        ><mark
                          v-if="part.hit"
                          class="rounded-[2px] bg-[var(--brand-highlight-soft)] px-0.5"
                        >{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                      </span>
                      <span
                        v-if="p.snippet"
                        class="mt-1 block text-[0.875rem] leading-snug text-[var(--text-muted)]"
                      >
                        <template
                          v-for="(part, i) in highlightParts(p.snippet, queryText)"
                          :key="i"
                        ><mark
                          v-if="part.hit"
                          class="bg-transparent font-semibold text-[var(--text-body)]"
                        >{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                      </span>
                      <span class="mt-1 block font-[family-name:var(--font-mono)] text-[0.75rem] text-[var(--text-subtle)]">{{ p.path }}</span>
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <!-- News -->
              <div v-if="results.news.length">
                <h3 class="m-0 mb-4 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-[var(--text-strong)]">
                  News
                  <span class="ml-1 font-[family-name:var(--font-mono)] text-[0.8125rem] font-medium text-[var(--text-subtle)]">{{ results.counts.news }}</span>
                </h3>
                <ul class="m-0 grid list-none gap-2 p-0">
                  <li
                    v-for="n in results.news"
                    :key="n.path"
                  >
                    <NuxtLink
                      :to="n.path"
                      class="group block rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3.5 no-underline transition-[border-color,box-shadow] duration-150 hover:border-[var(--border-default)] hover:shadow-[var(--shadow-sm)]"
                    >
                      <span class="mb-1 flex items-center gap-2 text-[0.75rem] font-bold tracking-[0.05em] text-[var(--text-subtle)] uppercase">
                        <span v-if="n.category">{{ n.category }}</span>
                        <span
                          v-if="n.category && n.date"
                          aria-hidden="true"
                        >·</span>
                        <span
                          v-if="n.date"
                          class="font-medium tracking-normal normal-case"
                        >{{ newsDate(n.date) }}</span>
                      </span>
                      <span class="block font-semibold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">
                        <template
                          v-for="(part, i) in highlightParts(n.title, queryText)"
                          :key="i"
                        ><mark
                          v-if="part.hit"
                          class="rounded-[2px] bg-[var(--brand-highlight-soft)] px-0.5"
                        >{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                      </span>
                      <span
                        v-if="n.snippet"
                        class="mt-1 block text-[0.875rem] leading-snug text-[var(--text-muted)]"
                      >
                        <template
                          v-for="(part, i) in highlightParts(n.snippet, queryText)"
                          :key="i"
                        ><mark
                          v-if="part.hit"
                          class="bg-transparent font-semibold text-[var(--text-body)]"
                        >{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                      </span>
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <!-- Documents -->
              <div v-if="results.documents.length">
                <h3 class="m-0 mb-4 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-[var(--text-strong)]">
                  Documents
                  <span class="ml-1 font-[family-name:var(--font-mono)] text-[0.8125rem] font-medium text-[var(--text-subtle)]">{{ results.counts.documents }}</span>
                </h3>
                <ul class="m-0 grid list-none gap-1.5 p-0">
                  <li
                    v-for="d in results.documents"
                    :key="d.url"
                  >
                    <a
                      :href="d.url"
                      :target="isExternal(d.url) ? '_blank' : undefined"
                      :rel="isExternal(d.url) ? 'noopener' : undefined"
                      class="group flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-transparent px-4 py-3 no-underline transition-[background-color,border-color] duration-150 hover:border-[var(--border-subtle)] hover:bg-[var(--surface-card)] hover:shadow-[var(--shadow-sm)]"
                    >
                      <span
                        class="inline-flex size-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-accent-soft)] text-[var(--blue-700)]"
                        aria-hidden="true"
                      >
                        <UiIcon
                          name="download"
                          :size="20"
                          :stroke="2"
                        />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block truncate font-semibold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">
                          <template
                            v-for="(part, i) in highlightParts(d.title, queryText)"
                            :key="i"
                          ><mark
                            v-if="part.hit"
                            class="rounded-[2px] bg-[var(--brand-highlight-soft)] px-0.5"
                          >{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                        </span>
                        <span class="mt-0.5 block text-[0.8125rem] text-[var(--text-muted)]">{{ [d.type, d.topic].filter(Boolean).join(' · ') }}</span>
                      </span>
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Links -->
              <div v-if="results.links.length">
                <h3 class="m-0 mb-4 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-[var(--text-strong)]">
                  Links
                  <span class="ml-1 font-[family-name:var(--font-mono)] text-[0.8125rem] font-medium text-[var(--text-subtle)]">{{ results.counts.links }}</span>
                </h3>
                <ul class="m-0 grid list-none gap-1.5 p-0 sm:grid-cols-2">
                  <li
                    v-for="l in results.links"
                    :key="l.url"
                  >
                    <a
                      :href="l.url"
                      target="_blank"
                      rel="noopener"
                      class="group flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-transparent px-4 py-3 no-underline transition-[background-color,border-color] duration-150 hover:border-[var(--border-subtle)] hover:bg-[var(--surface-card)] hover:shadow-[var(--shadow-sm)]"
                    >
                      <span
                        class="inline-flex size-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary-strong)]"
                        aria-hidden="true"
                      >
                        <UiIcon
                          name="arrowUpRight"
                          :size="20"
                          :stroke="2"
                        />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block truncate font-semibold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">
                          <template
                            v-for="(part, i) in highlightParts(l.label, queryText)"
                            :key="i"
                          ><mark
                            v-if="part.hit"
                            class="rounded-[2px] bg-[var(--brand-highlight-soft)] px-0.5"
                          >{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                        </span>
                        <span class="mt-0.5 block truncate text-[0.8125rem] text-[var(--text-muted)]">{{ [l.note, searchHostLabel(l.url)].filter(Boolean).join(' · ') }}</span>
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </ClientOnly>
        </div>
      </section>

      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>
