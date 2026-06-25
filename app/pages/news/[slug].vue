<script setup lang="ts">
const route = useRoute()

const { data: article } = await useAsyncData(`news-${route.path}`, () =>
  queryCollection('news').path(route.path).first(),
)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

const { data: all } = await useAsyncData('news-all', () =>
  queryCollection('news').order('date', 'DESC').all(),
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

useHead({ title: () => `${article.value?.title} — LAS UNISON` })
useSeoMeta({
  description: () => article.value?.excerpt ?? '',
  ogTitle: () => article.value?.title ?? '',
  ogDescription: () => article.value?.excerpt ?? '',
  ogType: 'article',
})
</script>

<template>
  <div>
    <SiteHeader />

    <main v-if="article">
      <article>
        <!-- Masthead -->
        <header class="border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div class="las-container py-10 md:py-14">
            <div class="max-w-[760px]">
              <nav aria-label="Breadcrumb" class="mb-6 text-[0.875rem] text-[var(--text-muted)]">
                <NuxtLink to="/" class="text-[var(--text-muted)] no-underline hover:text-[var(--brand-primary)]">Home</NuxtLink>
                <span class="mx-2 text-[var(--border-strong)]" aria-hidden="true">/</span>
                <NuxtLink to="/news" class="text-[var(--text-muted)] no-underline hover:text-[var(--brand-primary)]">News</NuxtLink>
              </nav>

              <div class="flex items-center gap-3 mb-4">
                <span
                  class="font-[family-name:var(--font-sans)] text-[0.875rem] font-bold tracking-[0.08em] uppercase leading-none"
                  :style="{ color: meta.accent }"
                >{{ article.category }}</span>
                <span
                  v-if="article.urgent"
                  class="inline-flex items-center gap-1.5 font-[family-name:var(--font-sans)] font-bold text-[0.75rem] tracking-[0.04em] uppercase leading-none px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--emergency)] text-white"
                >
                  <UiIcon name="alert" :size="13" :stroke="2.4" /> Action needed
                </span>
              </div>

              <h1
                class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-4xl)] leading-[1.08] tracking-[-0.02em] text-[var(--text-strong)] m-0"
              >
                {{ article.title }}
              </h1>

              <div
                class="flex items-center gap-x-3 gap-y-1 flex-wrap mt-5 font-[family-name:var(--font-mono)] text-[0.875rem] text-[var(--text-muted)]"
              >
                <time :datetime="isoDate(article.date)">{{ dateText }}</time>
                <template v-if="readText">
                  <span class="text-[var(--border-strong)]" aria-hidden="true">·</span>
                  <span>{{ readText }}</span>
                </template>
                <template v-if="article.author">
                  <span class="text-[var(--border-strong)]" aria-hidden="true">·</span>
                  <span class="text-[var(--text-body)]">{{ article.author }}</span>
                </template>
              </div>
            </div>
          </div>
        </header>

        <!-- Hero image (only when the article has a real featured image) -->
        <figure
          v-if="article.image"
          class="border-b border-[var(--border-subtle)] bg-[var(--surface-sunken)] m-0"
        >
          <div class="las-container py-8 md:py-10">
            <img
              :src="article.image"
              :alt="article.title"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              class="block w-full max-h-[460px] object-cover rounded-[var(--radius-card)] shadow-[var(--shadow-sm)]"
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
              class="flex gap-3 items-start bg-[var(--danger-soft)] rounded-[var(--radius-lg)] p-5 mb-8"
            >
              <span class="flex-none text-[var(--red-700)] mt-px" aria-hidden="true">
                <UiIcon name="alert" :size="22" :stroke="2" />
              </span>
              <div>
                <p class="font-[family-name:var(--font-display)] font-bold text-[1.0625rem] text-[var(--red-700)] m-0 mb-0.5">
                  Action needed
                </p>
                <p class="text-[0.9375rem] leading-[1.55] text-[var(--text-body)] m-0">
                  If you think you may be affected, check your payslips and contact your local UNISON rep —
                  the sector contacts are listed below.
                </p>
              </div>
            </div>

            <div class="article-prose">
              <ContentRenderer :value="article" />
            </div>

            <!-- Off-site source -->
            <a
              v-if="article.source"
              :href="article.source"
              target="_blank"
              rel="noopener"
              class="group flex items-center gap-4 mt-10 p-5 rounded-[var(--radius-lg)] bg-[var(--surface-brand-soft)] border border-[var(--border-subtle)] no-underline transition-colors duration-150 hover:border-[var(--brand-primary)]"
            >
              <span class="flex-none w-11 h-11 rounded-full bg-[var(--brand-primary)] text-white inline-flex items-center justify-center">
                <UiIcon name="arrowUpRight" :size="20" />
              </span>
              <span class="min-w-0">
                <span class="block font-[family-name:var(--font-display)] font-bold text-[1.0625rem] text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">
                  {{ article.sourceLabel ?? 'Read more' }}
                </span>
                <span class="block text-[0.875rem] text-[var(--text-muted)] truncate">{{ article.source }}</span>
              </span>
            </a>

            <!-- Back link -->
            <div class="mt-12 pt-8 border-t border-[var(--border-subtle)]">
              <UiButton variant="ghost" href="/news" icon-left="arrowLeft">All news</UiButton>
            </div>
          </div>
        </div>
      </article>

      <!-- Related -->
      <section v-if="related.length" class="bg-[var(--surface-card)] border-t border-[var(--border-subtle)]">
        <div class="las-container py-[var(--section-y)]">
          <h2 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-2xl)] text-[var(--text-strong)] mt-0 mb-7">
            More from the branch
          </h2>
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <NewsCard v-for="p in related" :key="p.path" :post="p" class="las-reveal" />
          </div>
        </div>
      </section>

      <!-- Help first, fast -->
      <div class="las-container py-[var(--section-y)]">
        <UiEmergencyBar />
      </div>

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
