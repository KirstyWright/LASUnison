<script setup lang="ts">
const route = useRoute()

const { data: article } = await useAsyncData(`news-${route.path}`, () =>
  queryCollection('news').path(route.path).first(),
)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

// Only the scalar fields the related-articles cards (NewsCard) read — never the
// body AST, which would bloat every article's static payload by ~MBs each.
const { data: all } = await useAsyncData('news-all', () =>
  queryCollection('news')
    .order('date', 'DESC')
    .select('path', 'title', 'date', 'category', 'topic', 'description', 'image', 'readTime', 'urgent')
    .all(),
)

// Related: same topic first, then most recent, never the current article.
const related = computed(() => {
  const others = ((all.value ?? []) as NewsItem[]).filter(p => p.path !== route.path)
  const topic = article.value?.topic
  const sameTopic = topic ? others.filter(p => p.topic === topic) : []
  const rest = others.filter(p => !sameTopic.includes(p))
  return [...sameTopic, ...rest].slice(0, 3)
})

const meta = computed(() => newsCategoryMeta(article.value!.category, article.value!.urgent))
const dateText = computed(() => formatNewsDate(article.value!.date))
const readText = computed(() => readTimeLabel(article.value!.readTime))

const site = useSiteConfig()
const absImage = computed(() =>
  article.value?.image ? new URL(article.value.image, site.url).toString() : undefined,
)

useContentSeo({
  title: () => article.value?.title,
  description: () => article.value?.description,
  seo: () => article.value?.seo,
  image: () => article.value?.image,
  type: 'article',
})

// Article publication metadata for social/news crawlers.
useSeoMeta({
  articlePublishedTime: () => article.value?.date,
  articleAuthor: () => (article.value?.author ? [article.value.author] : undefined),
})

// NewsArticle + breadcrumb structured data. Wrapped in a function so the schema-org
// defines receive resolved values (they don't resolve getter functions per-field).
useSchemaOrg(() => [
  defineArticle({
    '@type': 'NewsArticle',
    'headline': article.value?.title,
    'description': article.value?.seo?.description || article.value?.description,
    'datePublished': article.value?.date,
    'image': absImage.value,
    'author': article.value?.author ? { name: article.value.author } : { name: 'LAS UNISON' },
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'News', item: '/news' },
      { name: article.value?.title },
    ],
  }),
])
</script>

<template>
  <div>
    <SiteHeader />

    <main
      v-if="article"
      id="main-content"
    >
      <article>
        <!-- Masthead -->
        <header class="border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div class="las-container py-10 md:py-14">
            <div class="max-w-[760px]">
              <nav
                aria-label="Breadcrumb"
                class="mb-6 text-[0.875rem] text-[var(--text-muted)]"
              >
                <NuxtLink
                  to="/"
                  class="text-[var(--text-muted)] no-underline hover:text-[var(--brand-primary)]"
                >Home</NuxtLink>
                <span
                  class="mx-2 text-[var(--border-strong)]"
                  aria-hidden="true"
                >/</span>
                <NuxtLink
                  to="/news"
                  class="text-[var(--text-muted)] no-underline hover:text-[var(--brand-primary)]"
                >News</NuxtLink>
              </nav>

              <div class="mb-4 flex items-center gap-3">
                <span
                  class="font-[family-name:var(--font-sans)] text-[0.875rem] leading-none font-bold tracking-[0.08em] uppercase"
                  :style="{ color: meta.accent }"
                >{{ article.category }}</span>
                <span
                  v-if="article.urgent"
                  class="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--emergency)] px-2.5 py-1.5 font-[family-name:var(--font-sans)] text-[0.75rem] leading-none font-bold tracking-[0.04em] text-white uppercase"
                >
                  <UiIcon
                    name="alert"
                    :size="13"
                    :stroke="2.4"
                  /> Action needed
                </span>
              </div>

              <h1
                class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-4xl)] leading-[1.08] font-black tracking-[-0.02em] text-[var(--text-strong)]"
              >
                {{ article.title }}
              </h1>

              <div
                class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-[family-name:var(--font-mono)] text-[0.875rem] text-[var(--text-muted)]"
              >
                <time :datetime="isoDate(article.date)">{{ dateText }}</time>
                <template v-if="readText">
                  <span
                    class="text-[var(--border-strong)]"
                    aria-hidden="true"
                  >·</span>
                  <span>{{ readText }}</span>
                </template>
                <template v-if="article.author">
                  <span
                    class="text-[var(--border-strong)]"
                    aria-hidden="true"
                  >·</span>
                  <span class="text-[var(--text-body)]">{{ article.author }}</span>
                </template>
              </div>
            </div>
          </div>
        </header>

        <!-- Hero image (only when the article has a real featured image) -->
        <figure
          v-if="article.image"
          class="m-0 border-b border-[var(--border-subtle)] bg-[var(--surface-sunken)]"
        >
          <div class="las-container py-8 md:py-10">
            <img
              :src="article.image"
              alt=""
              loading="eager"
              fetchpriority="high"
              decoding="async"
              class="block max-h-[460px] w-full rounded-[var(--radius-card)] object-cover shadow-[var(--shadow-sm)]"
            >
          </div>
        </figure>

        <!-- Body -->
        <div class="las-container py-12">
          <div class="max-w-[680px]">
            <!-- Action callout for urgent items -->
            <div
              v-if="article.urgent"
              role="alert"
              class="mb-8 flex items-start gap-3 rounded-[var(--radius-lg)] bg-[var(--danger-soft)] p-5"
            >
              <span
                class="mt-px flex-none text-[var(--red-700)]"
                aria-hidden="true"
              >
                <UiIcon
                  name="alert"
                  :size="22"
                  :stroke="2"
                />
              </span>
              <div>
                <p class="m-0 mb-0.5 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold text-[var(--red-700)]">
                  Action needed
                </p>
                <p class="m-0 text-[0.9375rem] leading-[1.55] text-[var(--text-body)]">
                  If this affects you, contact your local UNISON rep or UNISON Direct without delay.
                </p>
              </div>
            </div>

            <UiLightbox>
              <div class="article-prose">
                <ContentRenderer :value="article" />
              </div>
            </UiLightbox>

            <!-- Off-site source -->
            <a
              v-if="article.source"
              :href="article.source"
              target="_blank"
              rel="noopener"
              class="group mt-10 flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-brand-soft)] p-5 no-underline transition-colors duration-150 hover:border-[var(--brand-primary)]"
            >
              <span class="inline-flex size-11 flex-none items-center justify-center rounded-full bg-[var(--brand-primary)] text-white">
                <UiIcon
                  name="arrowUpRight"
                  :size="20"
                />
              </span>
              <span class="min-w-0">
                <span class="block font-[family-name:var(--font-display)] text-[1.0625rem] font-bold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">
                  {{ article.sourceLabel ?? 'Read more' }}
                </span>
                <span class="block truncate text-[0.875rem] text-[var(--text-muted)]">{{ article.source }}</span>
              </span>
            </a>

            <!-- Back link -->
            <div class="mt-12 border-t border-[var(--border-subtle)] pt-8">
              <UiButton
                variant="ghost"
                href="/news"
                icon-left="arrowLeft"
              >
                All news
              </UiButton>
            </div>
          </div>
        </div>
      </article>

      <!-- Related -->
      <section
        v-if="related.length"
        class="border-t border-[var(--border-subtle)] bg-[var(--surface-card)]"
      >
        <div class="las-container py-[var(--section-y)]">
          <h2 class="mt-0 mb-7 font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] font-extrabold text-[var(--text-strong)]">
            More from the branch
          </h2>
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <NewsCard
              v-for="p in related"
              :key="p.path"
              :post="p"
              class="las-reveal"
            />
          </div>
        </div>
      </section>

      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.article-prose {
  font-family: var(--font-sans);
  color: var(--text-body);
  font-size: 1.0625rem;
  line-height: 1.75;
}

.article-prose :deep(p) {
  margin: 0 0 1.25em;
}

/* Standfirst — first paragraph reads a touch larger. */
.article-prose :deep(> p:first-of-type) {
  font-size: 1.1875rem;
  line-height: 1.6;
  color: var(--text-strong);
}

.article-prose :deep(h2) {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-2xl);
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: var(--text-strong);
  margin: 2em 0 0.6em;
}

.article-prose :deep(h3) {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-xl);
  line-height: 1.25;
  color: var(--text-strong);
  margin: 1.6em 0 0.5em;
}

.article-prose :deep(strong) {
  font-weight: 700;
  color: var(--text-strong);
}

.article-prose :deep(a) {
  color: var(--text-link);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
  font-weight: 600;
}
.article-prose :deep(a:hover) {
  color: var(--text-link-hover);
}

/* Heading deep-link anchors (added by @nuxt/content) must not inherit the link
   colour/underline/weight — section heads stay Archivo-bold and ink-strong. */
.article-prose :deep(:is(h2, h3) a) {
  color: inherit;
  text-decoration: none;
  font-weight: inherit;
}

.article-prose :deep(ul),
.article-prose :deep(ol) {
  margin: 0 0 1.25em;
  padding-left: 1.4em;
}
.article-prose :deep(li) {
  margin: 0.4em 0;
  padding-left: 0.3em;
}
.article-prose :deep(ul li)::marker {
  color: var(--brand-primary);
}
.article-prose :deep(ol li)::marker {
  color: var(--brand-primary);
  font-family: var(--font-mono);
  font-weight: 600;
}

/* Quoted letters and pull quotes — soft purple panel, never a side stripe. */
.article-prose :deep(blockquote) {
  background: var(--surface-brand-soft);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  margin: 1.75rem 0;
  color: var(--text-body);
}
.article-prose :deep(blockquote p) {
  margin: 0 0 0.85em;
}
.article-prose :deep(blockquote p:last-child) {
  margin-bottom: 0;
}
.article-prose :deep(blockquote ol),
.article-prose :deep(blockquote ul) {
  margin: 0.5em 0;
}

.article-prose :deep(hr) {
  border: 0;
  border-top: 1px solid var(--border-subtle);
  margin: 2em 0;
}
</style>
