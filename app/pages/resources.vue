<script setup lang="ts">
// Resources hub — the home for the operational staff tools that used to live
// in the old site header (GRS, The Pulse, ESR …), the branch document library
// (searchable), and the reference links to sister branches and NHS bodies.
// Browse by default; one search box filters documents + links + pages at once.
import type { SiteDocument } from '~/utils/resources'
import { benefits, staffTools, quickLinks, relatedLinks } from '~/data/links'

// Documents come from the `documents` Content collection (content/documents/*.yml),
// editable in Nuxt Studio. Newest first.
const { data: documentsData } = await useAsyncData('resource-documents', () =>
  queryCollection('documents').order('date', 'DESC').all(),
)
const documents = computed(() => (documentsData.value ?? []) as SiteDocument[])

const query = ref('')
const searching = computed(() => query.value.trim().length > 0)
const results = computed(() => searchResources(query.value, documents.value))

const docCount = computed(() => documents.value.length)
const oldestYear = computed(() =>
  documents.value.reduce((min, d) => Math.min(min, docYear(d.date)), 9999),
)

// Document results can be large for a common term — cap the rendered list.
const DOC_CAP = 60
const cappedDocs = computed(() => results.value.documents.slice(0, DOC_CAP))
const docsOverflow = computed(() => Math.max(0, results.value.documents.length - DOC_CAP))

const JUMPS = [
  { label: 'Benefits', href: '#benefits' },
  { label: 'Staff tools', href: '#tools' },
  { label: 'Documents', href: '#documents' },
  { label: 'Links', href: '#links' },
]

useHead({ title: 'Resources — LAS UNISON' })
useSeoMeta({
  description:
    'Every staff tool, link and document in one place — GRS, The Pulse, ESR, the branch document library, and the organisations we work with.',
})
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
            >Resources</span>
          </nav>
          <div class="mb-[18px]">
            <UiEyebrow color="var(--brand-highlight)">
              Links &amp; documents
            </UiEyebrow>
          </div>
          <h1
            class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.02] font-black tracking-[-0.02em] text-white"
          >
            Resources
          </h1>
          <p class="mt-5 mb-8 max-w-[560px] text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)]">
            Every tool, link and document in one place — the systems you use on shift, our
            document library, and the organisations we work alongside.
          </p>

          <ResourcesHubSearch v-model="query" />

          <!-- Jump links (browse only) -->
          <nav
            v-if="!searching"
            aria-label="Jump to section"
            class="mt-5 flex flex-wrap gap-2"
          >
            <a
              v-for="j in JUMPS"
              :key="j.href"
              :href="j.href"
              class="inline-flex h-11 items-center rounded-full bg-white/10 px-4 text-[0.8125rem] font-bold text-[var(--purple-100)] no-underline transition-colors duration-150 hover:bg-white/20 hover:text-white"
            >{{ j.label }}</a>
          </nav>
        </div>
      </section>

      <!-- ===================== SEARCH RESULTS ===================== -->
      <section
        v-if="searching"
        class="las-section"
      >
        <div class="las-container">
          <div class="mb-8 flex flex-wrap items-baseline justify-between gap-4">
            <h2 class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] font-extrabold text-[var(--text-strong)]">
              {{ results.total }} result{{ results.total === 1 ? '' : 's' }}
              <span class="font-bold text-[var(--text-muted)]">for “{{ query.trim() }}”</span>
            </h2>
            <UiButton
              variant="ghost"
              size="sm"
              icon-left="x"
              @click="query = ''"
            >
              Clear search
            </UiButton>
          </div>

          <!-- Nothing matched -->
          <div
            v-if="results.total === 0"
            class="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] px-6 py-16 text-center"
          >
            <p class="m-0 mb-2 font-[family-name:var(--font-display)] text-[1.5rem] font-extrabold text-[var(--text-strong)]">
              No matches
            </p>
            <p class="m-0 mx-auto max-w-[420px] text-[var(--text-muted)]">
              Nothing matched “{{ query.trim() }}”. Try fewer words, or check the document
              library and links below by clearing the search.
            </p>
          </div>

          <div
            v-else
            class="flex flex-col gap-12"
          >
            <!-- Tools & links -->
            <div v-if="results.links.length">
              <h3 class="m-0 mb-4 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-[var(--text-strong)]">
                Tools &amp; links
                <span class="ml-1 font-[family-name:var(--font-mono)] text-[0.8125rem] font-medium text-[var(--text-subtle)]">{{ results.links.length }}</span>
              </h3>
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <ResourcesQuickLink
                  v-for="l in results.links"
                  :key="l.url"
                  :link="l"
                />
              </div>
            </div>

            <!-- On-site pages -->
            <div v-if="results.pages.length">
              <h3 class="m-0 mb-4 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-[var(--text-strong)]">
                Pages on this site
                <span class="ml-1 font-[family-name:var(--font-mono)] text-[0.8125rem] font-medium text-[var(--text-subtle)]">{{ results.pages.length }}</span>
              </h3>
              <ul class="m-0 grid list-none gap-1.5 p-0 sm:grid-cols-2">
                <li
                  v-for="p in results.pages"
                  :key="p.path"
                >
                  <NuxtLink
                    :to="p.path"
                    class="group flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-transparent p-3 no-underline transition-[background-color,border-color] duration-150 hover:border-[var(--border-subtle)] hover:bg-[var(--surface-card)] hover:shadow-[var(--shadow-sm)] sm:px-4"
                  >
                    <span
                      class="inline-flex size-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary-strong)]"
                      aria-hidden="true"
                    >
                      <UiIcon
                        name="arrowRight"
                        :size="20"
                        :stroke="2"
                      />
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block font-semibold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">{{ p.label }}</span>
                      <span
                        v-if="p.note"
                        class="mt-0.5 block text-[0.8125rem] text-[var(--text-muted)]"
                      >{{ p.note }}</span>
                    </span>
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- Documents -->
            <div v-if="results.documents.length">
              <h3 class="m-0 mb-4 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-[var(--text-strong)]">
                Documents
                <span class="ml-1 font-[family-name:var(--font-mono)] text-[0.8125rem] font-medium text-[var(--text-subtle)]">{{ results.documents.length }}</span>
              </h3>
              <ul class="m-0 grid list-none gap-1.5 p-0 sm:gap-2">
                <li
                  v-for="d in cappedDocs"
                  :key="d.file"
                >
                  <ResourcesDocRow :doc="d" />
                </li>
              </ul>
              <p
                v-if="docsOverflow"
                class="mt-4 text-[0.875rem] text-[var(--text-muted)]"
              >
                Showing the first {{ DOC_CAP }} — add another word to narrow it down.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ===================== BROWSE ===================== -->
      <template v-else>
        <!-- Member benefits — the old "Benefits"/"Financial" menu -->
        <section
          id="benefits"
          class="las-section"
        >
          <div class="las-container">
            <UiSectionHead
              eyebrow="Benefits"
              :title="benefits.title"
              :intro="benefits.intro"
            />
            <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ResourcesQuickLink
                v-for="l in benefits.links"
                :key="l.url"
                :link="l"
                featured
                class="las-reveal"
              />
            </div>
          </div>
        </section>

        <!-- Staff tools -->
        <section
          id="tools"
          class="las-section"
        >
          <div class="las-container">
            <UiSectionHead
              eyebrow="Quick links"
              title="Staff tools"
              :intro="staffTools.intro"
            />
            <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ResourcesQuickLink
                v-for="l in staffTools.links"
                :key="l.url"
                :link="l"
                featured
                class="las-reveal"
              />
            </div>
          </div>
        </section>

        <!-- More quick links — tinted band for rhythm -->
        <section class="border-y border-[var(--border-subtle)] bg-[var(--surface-sunken)] py-[var(--section-y-tight)]">
          <div class="las-container grid gap-x-10 gap-y-8 md:grid-cols-2">
            <div
              v-for="g in quickLinks"
              :key="g.id"
            >
              <h3 class="m-0 mb-4 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-[var(--text-strong)]">
                {{ g.title }}
              </h3>
              <div class="grid gap-3 sm:grid-cols-2">
                <ResourcesQuickLink
                  v-for="l in g.links"
                  :key="l.url"
                  :link="l"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Document library -->
        <section
          id="documents"
          class="las-section"
        >
          <div class="las-container">
            <UiSectionHead
              eyebrow="Search &amp; browse"
              title="Document library"
              :intro="`Branch briefings, forms, posters and newsletters — ${docCount} documents going back to ${oldestYear}. Open any to download.`"
            />
            <div class="mt-8">
              <ResourcesDocLibrary :docs="documents" />
            </div>
          </div>
        </section>

        <!-- Related organisations -->
        <section
          id="links"
          class="border-y border-[var(--border-subtle)] bg-[var(--surface-sunken)] py-[var(--section-y)]"
        >
          <div class="las-container">
            <UiSectionHead
              eyebrow="Links"
              title="Related organisations"
              intro="Sister UNISON ambulance branches, the wider movement, NHS bodies and the ambulance services."
            />
            <div class="mt-8 grid gap-10 md:grid-cols-2">
              <div
                v-for="g in relatedLinks"
                :key="g.id"
              >
                <h3 class="m-0 mb-1 font-[family-name:var(--font-display)] text-[length:var(--text-md)] font-extrabold text-[var(--text-strong)]">
                  {{ g.title }}
                </h3>
                <p
                  v-if="g.intro"
                  class="m-0 mb-3 text-[0.875rem] text-[var(--text-muted)]"
                >
                  {{ g.intro }}
                </p>
                <div class="mt-1">
                  <ResourcesLinkRow
                    v-for="l in g.links"
                    :key="l.url"
                    :link="l"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- More on this site -->
        <section class="las-section">
          <div class="las-container">
            <h2 class="m-0 mb-6 font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] font-extrabold text-[var(--text-strong)]">
              More on this site
            </h2>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NuxtLink
                v-for="card in [
                  { label: 'Forms', note: 'Commonly used UNISON forms', path: '/forms', icon: 'file' },
                  { label: 'Pay rates', note: 'Ambulance pay & Agenda for Change', path: '/pay', icon: 'banknote' },
                  { label: 'NHS pensions', note: 'Scheme guidance & calculators', path: '/nhs-pension-scheme', icon: 'shield' },
                ]"
                :key="card.path"
                :to="card.path"
                class="group flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:translate-y-[-3px] hover:border-[var(--border-default)] hover:shadow-[var(--shadow-lg)]"
              >
                <span
                  class="mb-4 inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-secondary-soft)] text-[var(--green-700)]"
                  aria-hidden="true"
                >
                  <UiIcon
                    :name="card.icon"
                    :size="22"
                    :stroke="1.9"
                  />
                </span>
                <span class="font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">{{ card.label }}</span>
                <span class="mt-1 mb-4 text-[length:var(--text-sm)] leading-snug text-[var(--text-muted)]">{{ card.note }}</span>
                <span class="mt-auto inline-flex items-center gap-1.5 text-[0.875rem] font-bold text-[var(--brand-primary)]">
                  Open
                  <UiIcon
                    name="arrowRight"
                    :size="16"
                    :stroke="2"
                    class="transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </span>
              </NuxtLink>
            </div>
          </div>
        </section>
      </template>

      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>
