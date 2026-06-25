<script setup lang="ts">
// Branch news archive. Content comes from the `news` collection
// (content/news/*.md); structure, filtering and pagination live here.
//
// We load metadata for every post (no body AST — `.select()` keeps it light) so
// the category counts and the total are exact, then slice the current page out
// client-side. The page lives in the URL (?page=N) so every page of results is
// a real, server-rendered, shareable URL — paginated posts stay crawlable, and
// site-wide search (server/api/search.get.ts) already indexes all posts
// directly, independent of how this page is paged.
const { data: posts } = await useAsyncData('news-index', () =>
  queryCollection('news')
    .order('date', 'DESC')
    .select('path', 'title', 'date', 'category', 'topic', 'excerpt', 'readTime', 'urgent', 'image')
    .all(),
)

const route = useRoute()
const router = useRouter()

const PER_PAGE = 12
const CATEGORY_ORDER = ['Statement', 'Negotiations', 'Report', 'Campaign', 'News']

const presentCategories = computed(() => new Set((posts.value ?? []).map(p => p.category)))

// Category lives in the URL (?category=Negotiations) so filtered views are
// linkable and crawlable. Unknown / typo'd values fall back to the full archive.
const activeCategory = computed(() => {
  const c = (route.query.category as string) || ''
  return c && presentCategories.value.has(c) ? c : 'All'
})

const categories = computed(() => {
  const counts: Record<string, number> = {}
  for (const p of posts.value ?? []) counts[p.category] = (counts[p.category] ?? 0) + 1
  const present = Object.keys(counts).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  )
  return [
    { label: 'All', count: posts.value?.length ?? 0 },
    ...present.map(label => ({ label, count: counts[label]! })),
  ]
})

// Switching category navigates (so it's shareable) and restarts paging at 1.
function setCategory(label: string) {
  const query: Record<string, string> = {}
  if (label !== 'All') query.category = label
  router.push({ path: route.path, query })
}

// Build a /news URL for a given page, preserving the active category.
function pageHref(page: number): string {
  const params = new URLSearchParams()
  if (activeCategory.value !== 'All') params.set('category', activeCategory.value)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/news?${qs}` : '/news'
}

const filtered = computed(() => {
  const all = (posts.value ?? []) as NewsItem[]
  return activeCategory.value === 'All'
    ? all
    : all.filter(p => p.category === activeCategory.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))

// Page number from the URL, clamped into range (junk / out-of-range → nearest valid).
const currentPage = computed(() => {
  const raw = Number.parseInt((route.query.page as string) || '1', 10)
  const n = Number.isFinite(raw) ? raw : 1
  return Math.min(Math.max(1, n), totalPages.value)
})

// The lead story is only the very latest post, shown on page 1 of the unfiltered view.
const showFeatured = computed(
  () => activeCategory.value === 'All' && currentPage.value === 1 && !!filtered.value[0],
)
const featured = computed(() => filtered.value[0])

const pageItems = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE
  return filtered.value.slice(start, start + PER_PAGE)
})

// On page 1 of "All" the first item is the featured lead, so drop it from the grid.
const gridPosts = computed(() =>
  showFeatured.value ? pageItems.value.slice(1) : pageItems.value,
)

const rangeStart = computed(() =>
  filtered.value.length ? (currentPage.value - 1) * PER_PAGE + 1 : 0,
)
const rangeEnd = computed(() =>
  Math.min(currentPage.value * PER_PAGE, filtered.value.length),
)

const countLabel = computed(() => {
  const total = filtered.value.length
  const noun = total === 1 ? 'article' : 'articles'
  const scope = activeCategory.value === 'All' ? '' : ` in ${activeCategory.value}`
  if (!total) return `0 articles${scope}`
  if (totalPages.value === 1) return `${total} ${noun}${scope}`
  return `${rangeStart.value}–${rangeEnd.value} of ${total} ${noun}${scope}`
})

// Scroll back up to the controls when paging on the client, so a new page
// doesn't leave the reader stranded at the previous page's tail.
const listTop = ref<HTMLElement | null>(null)
watch(currentPage, () => {
  if (!import.meta.client) return
  const header = document.querySelector('header')
  const offset = (header?.getBoundingClientRect().height ?? 96) + 16
  const top = (listTop.value?.getBoundingClientRect().top ?? 0) + window.scrollY - offset
  window.scrollTo({ top: Math.max(0, top) })
})

useHead({
  title: () => {
    const cat = activeCategory.value !== 'All' ? ` · ${activeCategory.value}` : ''
    const pg = currentPage.value > 1 ? ` (page ${currentPage.value})` : ''
    return `News & updates${cat}${pg} — LAS UNISON`
  },
  // Help crawlers walk the (optionally filtered) archive in order.
  link: () => [
    ...(currentPage.value > 1 ? [{ rel: 'prev', href: pageHref(currentPage.value - 1) }] : []),
    ...(currentPage.value < totalPages.value ? [{ rel: 'next', href: pageHref(currentPage.value + 1) }] : []),
  ],
})
useSeoMeta({
  description:
    'Statements, negotiations, reports and campaigns from LAS UNISON — the UK’s biggest ambulance branch.',
})
</script>

<template>
  <div>
    <SiteHeader />

    <main>
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
            <span class="text-white font-semibold" aria-current="page">News</span>
          </nav>
          <div class="mb-[18px]">
            <UiEyebrow color="var(--brand-highlight)">Latest from the branch</UiEyebrow>
          </div>
          <h1
            class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-5xl)] leading-[1.02] tracking-[-0.02em] m-0 text-white"
          >
            News &amp; updates
          </h1>
          <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)] mt-5 mb-0 max-w-[560px]">
            Statements, negotiations, reports and campaigns from the people who represent, protect and
            stand up for London's ambulance staff.
          </p>
        </div>
      </section>

      <section class="las-section">
        <div class="las-container">
          <!-- Lead story -->
          <NewsCard v-if="showFeatured" :post="(featured as NewsItem)" featured class="mb-12 las-reveal" />

          <!-- Controls -->
          <div ref="listTop" class="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center lg:justify-between scroll-mt-28">
            <NewsFilters :model-value="activeCategory" :categories="categories" @update:model-value="setCategory" />
            <p
              class="font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-muted)] m-0 flex-none"
              aria-live="polite"
            >
              {{ countLabel }}
            </p>
          </div>

          <!-- Grid -->
          <div
            v-if="gridPosts.length"
            class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <NewsCard v-for="p in gridPosts" :key="p.path" :post="(p as NewsItem)" class="las-reveal" />
          </div>

          <!-- Empty state -->
          <div
            v-else-if="!showFeatured"
            class="text-center border border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] py-16 px-6"
          >
            <p class="font-[family-name:var(--font-display)] font-extrabold text-[1.5rem] text-[var(--text-strong)] m-0 mb-2">
              Nothing here yet
            </p>
            <p class="text-[var(--text-muted)] m-0 mb-6">
              There are no articles in “{{ activeCategory }}” at the moment.
            </p>
            <UiButton variant="outline" @click="setCategory('All')">View all news</UiButton>
          </div>

          <!-- Pagination -->
          <UiPagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            label="News archive pages"
            class="mt-12"
          />
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
