<script setup lang="ts">
// Catch-all for migrated WordPress pages in the `content` collection (about, branch
// rules, health & safety, pay, …). News, legal, reps and committee have their own
// routes; the homepage is index.vue. Everything else lands here and gets the standard
// content-page chrome: site header/footer, a purple hero, a readable prose column, a
// "last updated" line, and an "In this section" block that cross-links the page's
// siblings (from app/data/nav.ts). Title-only stubs show a placeholder, not a blank.
import { navGroups, navGroupForPath, siblingsForPath } from '~/data/nav'
import type { SiteLink } from '~/data/links'

const route = useRoute()

const { data: page } = await useAsyncData('page-' + route.path, () => {
  return queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = computed(() => page.value?.title || 'Page')
const isStub = computed(() => page.value?.stub === true)

const deslug = (seg: string) => seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// A human label for a path from the nav (hub or item), else a de-slugged segment.
function labelForPath(p: string): string | undefined {
  for (const g of navGroups) {
    if (g.hub === p) return g.label
    const it = g.items.find((i) => i.path === p)
    if (it) return it.label
  }
  return undefined
}

// Breadcrumb: Home / [section] / [url parents] / Title. The section crumb comes
// from the page's nav group (so /welfare reads Home / Support / Welfare); deeper
// URL segments keep their place, labelled from the nav where one matches.
const crumbs = computed(() => {
  const segs = route.path.replace(/\/+$/, '').split('/').filter(Boolean)
  const list: { label: string; to: string }[] = []

  let acc = ''
  for (const seg of segs.slice(0, -1)) {
    acc += '/' + seg
    list.push({ label: labelForPath(acc) ?? deslug(seg), to: acc })
  }

  const group = navGroupForPath(route.path)
  if (group && group.hub !== route.path && !list.some((c) => c.to === group.hub)) {
    list.unshift({ label: group.label, to: group.hub })
  }
  return list
})

// Other pages in this section, as link cards.
const siblings = computed<SiteLink[]>(() =>
  siblingsForPath(route.path).map((i) => ({ label: i.label, url: i.path, note: i.note, icon: i.icon })),
)

useHead({ title: () => `${title.value} — LAS UNISON` })
useSeoMeta({
  description: () => page.value?.description ?? undefined,
  ogTitle: () => `${title.value} — LAS UNISON`,
  ogDescription: () => page.value?.description ?? undefined,
})
</script>

<template>
  <div>
    <SiteHeader />

    <main id="main-content">
      <!-- Page hero -->
      <section class="bg-[var(--surface-brand)] text-white">
        <div class="las-container py-12 md:py-16">
          <nav
            aria-label="Breadcrumb"
            class="mb-5 text-[0.875rem] text-[var(--purple-200)] flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <NuxtLink to="/" class="text-[var(--purple-200)] no-underline hover:text-white">Home</NuxtLink>
            <template v-for="c in crumbs" :key="c.to">
              <span class="opacity-50" aria-hidden="true">/</span>
              <NuxtLink :to="c.to" class="text-[var(--purple-200)] no-underline hover:text-white">{{ c.label }}</NuxtLink>
            </template>
            <span class="opacity-50" aria-hidden="true">/</span>
            <span class="text-white font-semibold" aria-current="page">{{ title }}</span>
          </nav>
          <h1
            class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-5xl)] leading-[1.02] tracking-[-0.02em] m-0 text-white"
          >
            {{ title }}
          </h1>
        </div>
      </section>

      <!-- Body -->
      <div class="las-container py-12 md:py-16">
        <!-- Stub: a placeholder rather than an empty page -->
        <div
          v-if="isStub"
          class="max-w-[60ch] mx-auto text-center border border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] py-16 px-6"
        >
          <p class="font-[family-name:var(--font-display)] font-extrabold text-[1.5rem] text-[var(--text-strong)] m-0 mb-2">
            This page is on its way
          </p>
          <p class="text-[var(--text-muted)] m-0 mb-7 mx-auto">
            We're still moving this content over from the old site. In the meantime, branch
            documents, forms and links all live in one place.
          </p>
          <div class="flex flex-wrap gap-3 justify-center">
            <UiButton href="/resources" icon-left="arrowRight">Browse resources</UiButton>
            <UiButton href="/" variant="ghost">Back home</UiButton>
          </div>
        </div>

        <!-- Real content -->
        <template v-else>
          <div class="max-w-[72ch]">
            <ContentRenderer v-if="page" :value="page" class="las-prose" />
            <p
              v-if="page?.date"
              class="mt-12 pt-5 border-t border-[var(--border-subtle)] text-[length:var(--text-sm)] text-[var(--text-subtle)] m-0"
            >
              Last updated {{ formatNewsDate(page.date) }}
            </p>
          </div>

          <!-- In this section -->
          <section v-if="siblings.length" class="mt-14 pt-10 border-t border-[var(--border-subtle)]">
            <h2 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-2xl)] tracking-[-0.015em] text-[var(--text-strong)] m-0">
              In this section
            </h2>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
              <ResourcesQuickLink v-for="l in siblings" :key="l.url" :link="l" />
            </div>
          </section>
        </template>
      </div>

      <!-- Help first, fast -->
      <div class="las-container pb-[var(--section-y)]">
        <UiEmergencyBar />
      </div>

      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>
