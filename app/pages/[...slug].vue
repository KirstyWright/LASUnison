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

const { data: page } = await useAsyncData(`page-${route.path}`, () => {
  return queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

// Branch officer pages credit the officer responsible for the area as the page's
// "author" via an `officer: <committee-slug>` frontmatter key (e.g. paul-ray).
// Resolve it from the editable committee collection; an author card renders at
// the foot of the article. Matches on the file slug, with a name fallback so a
// mistyped "Paul Ray" still resolves.
const { data: officer } = await useAsyncData(`officer-${route.path}`, async () => {
  const ref = page.value?.officer
  if (!ref) return null
  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const members = await queryCollection('committee').all()
  return (
    members.find((m: any) => {
      const stemSlug = String(m.stem ?? m.id ?? '').split('/').pop()?.replace(/\.yml$/, '')
      return stemSlug === ref || slugify(m.name) === slugify(ref)
    }) ?? null
  )
})

const title = computed(() => page.value?.title || 'Page')
const isStub = computed(() => page.value?.stub === true)

const deslug = (seg: string) => seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

// A human label for a path from the nav (hub or item), else a de-slugged segment.
function labelForPath(p: string): string | undefined {
  for (const g of navGroups) {
    if (g.hub === p) return g.label
    const it = g.items.find(i => i.path === p)
    if (it) return it.label
  }
  return undefined
}

// Breadcrumb: Home / [section] / [url parents] / Title. The section crumb comes
// from the page's nav group (so /welfare reads Home / Support / Welfare); deeper
// URL segments keep their place, labelled from the nav where one matches.
const crumbs = computed(() => {
  const segs = route.path.replace(/\/+$/, '').split('/').filter(Boolean)
  const list: { label: string, to: string }[] = []

  let acc = ''
  for (const seg of segs.slice(0, -1)) {
    acc += `/${seg}`
    list.push({ label: labelForPath(acc) ?? deslug(seg), to: acc })
  }

  const group = navGroupForPath(route.path)
  if (group && group.hub !== route.path && !list.some(c => c.to === group.hub)) {
    list.unshift({ label: group.label, to: group.hub })
  }
  return list
})

// Other pages in this section, as link cards.
const siblings = computed<SiteLink[]>(() =>
  siblingsForPath(route.path).map(i => ({ label: i.label, url: i.path, note: i.note, icon: i.icon })),
)

useContentSeo({
  title: () => title.value,
  description: () => page.value?.description,
  seo: () => page.value?.seo,
})

// Breadcrumb structured data: Home / [crumbs] / Title.
useSchemaOrg(() => [
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      ...crumbs.value.map(c => ({ name: c.label, item: c.to })),
      { name: title.value },
    ],
  }),
])
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
            class="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-[var(--purple-200)]"
          >
            <NuxtLink
              to="/"
              class="text-[var(--purple-200)] no-underline hover:text-white"
            >Home</NuxtLink>
            <template
              v-for="c in crumbs"
              :key="c.to"
            >
              <span
                class="opacity-50"
                aria-hidden="true"
              >/</span>
              <NuxtLink
                :to="c.to"
                class="text-[var(--purple-200)] no-underline hover:text-white"
              >{{ c.label }}</NuxtLink>
            </template>
            <span
              class="opacity-50"
              aria-hidden="true"
            >/</span>
            <span
              class="font-semibold text-white"
              aria-current="page"
            >{{ title }}</span>
          </nav>
          <h1
            class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.02] font-black tracking-[-0.02em] text-white"
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
          class="mx-auto max-w-[60ch] rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] px-6 py-16 text-center"
        >
          <p class="m-0 mb-2 font-[family-name:var(--font-display)] text-[1.5rem] font-extrabold text-[var(--text-strong)]">
            This page is on its way
          </p>
          <p class="m-0 mx-auto mb-7 text-[var(--text-muted)]">
            We're still moving this content over from the old site. In the meantime, branch
            documents, forms and links all live in one place.
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <UiButton
              href="/resources"
              icon-left="arrowRight"
            >
              Browse resources
            </UiButton>
            <UiButton
              href="/"
              variant="ghost"
            >
              Back home
            </UiButton>
          </div>
        </div>

        <!-- Real content -->
        <template v-else>
          <div class="max-w-[72ch]">
            <UiLightbox>
              <ContentRenderer
                v-if="page"
                :value="page"
                class="las-prose"
              />
            </UiLightbox>
            <p
              v-if="page?.date"
              class="m-0 mt-12 border-t border-[var(--border-subtle)] pt-5 text-[length:var(--text-sm)] text-[var(--text-subtle)]"
            >
              Last updated {{ formatNewsDate(page.date) }}
            </p>

            <!-- Branch officer for this area, credited as the page's author -->
            <CommitteeAuthorCard
              v-if="officer"
              :name="officer.name"
              :role="officer.role"
              :workplace="officer.workplace"
              :phone="officer.phone"
              :email="officer.email"
              :photo="officer.photo"
              class="mt-10"
            />
          </div>

          <!-- In this section -->
          <section
            v-if="siblings.length"
            class="mt-14 border-t border-[var(--border-subtle)] pt-10"
          >
            <h2 class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] font-extrabold tracking-[-0.015em] text-[var(--text-strong)]">
              In this section
            </h2>
            <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ResourcesQuickLink
                v-for="l in siblings"
                :key="l.url"
                :link="l"
              />
            </div>
          </section>
        </template>
      </div>

      <!-- Trailing join CTA — suppressed on pages that carry their own (e.g. /membership). -->
      <HomeJoin v-if="!page?.hideJoinCta" />
    </main>

    <SiteFooter />
  </div>
</template>
