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
      <section class="bg-[var(--surface-brand)] text-white relative overflow-hidden">
        <!-- Pulse, refined — live cardiac-monitor edge motif -->
        <div
          aria-hidden="true"
          class="absolute inset-x-0 bottom-0 text-[var(--brand-highlight)] pointer-events-none"
        >
          <MotifPulse />
        </div>
        <div class="las-container relative py-14 md:py-[4.5rem]">
          <nav aria-label="Breadcrumb" class="mb-5 text-[0.875rem] text-[var(--purple-200)]">
            <NuxtLink to="/" class="text-[var(--purple-200)] no-underline hover:text-white">Home</NuxtLink>
            <span class="mx-2 opacity-50" aria-hidden="true">/</span>
            <span class="text-white font-semibold" aria-current="page">Resources</span>
          </nav>
          <div class="mb-[18px]">
            <UiEyebrow color="var(--brand-highlight)">Links &amp; documents</UiEyebrow>
          </div>
          <h1
            class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-5xl)] leading-[1.02] tracking-[-0.02em] m-0 text-white"
          >
            Resources
          </h1>
          <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)] mt-5 mb-8 max-w-[560px]">
            Every tool, link and document in one place — the systems you use on shift, our
            document library, and the organisations we work alongside.
          </p>

          <ResourcesHubSearch v-model="query" />

          <!-- Jump links (browse only) -->
          <nav
            v-if="!searching"
            aria-label="Jump to section"
            class="flex flex-wrap gap-2 mt-5"
          >
            <a
              v-for="j in JUMPS"
              :key="j.href"
              :href="j.href"
              class="inline-flex items-center px-4 h-11 rounded-full text-[0.8125rem] font-bold no-underline bg-white/10 text-[var(--purple-100)] hover:bg-white/20 hover:text-white transition-colors duration-150"
            >{{ j.label }}</a>
          </nav>
        </div>
      </section>

      <!-- ===================== SEARCH RESULTS ===================== -->
      <section v-if="searching" class="las-section">
        <div class="las-container">
          <div class="flex items-baseline justify-between gap-4 flex-wrap mb-8">
            <h2 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-2xl)] text-[var(--text-strong)] m-0">
              {{ results.total }} result{{ results.total === 1 ? '' : 's' }}
              <span class="text-[var(--text-muted)] font-bold">for “{{ query.trim() }}”</span>
            </h2>
            <UiButton variant="ghost" size="sm" icon-left="x" @click="query = ''">Clear search</UiButton>
          </div>

          <!-- Nothing matched -->
          <div
            v-if="results.total === 0"
            class="text-center border border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] py-16 px-6"
          >
            <p class="font-[family-name:var(--font-display)] font-extrabold text-[1.5rem] text-[var(--text-strong)] m-0 mb-2">
              No matches
            </p>
            <p class="text-[var(--text-muted)] m-0 max-w-[420px] mx-auto">
              Nothing matched “{{ query.trim() }}”. Try fewer words, or check the document
              library and links below by clearing the search.
            </p>
          </div>

          <div v-else class="flex flex-col gap-12">
            <!-- Tools & links -->
            <div v-if="results.links.length">
              <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] m-0 mb-4">
                Tools &amp; links
                <span class="font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-subtle)] font-medium ml-1">{{ results.links.length }}</span>
              </h3>
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <ResourcesQuickLink v-for="l in results.links" :key="l.url" :link="l" />
              </div>
            </div>

            <!-- On-site pages -->
            <div v-if="results.pages.length">
              <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] m-0 mb-4">
                Pages on this site
                <span class="font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-subtle)] font-medium ml-1">{{ results.pages.length }}</span>
              </h3>
              <ul class="list-none p-0 m-0 grid gap-1.5 sm:grid-cols-2">
                <li v-for="p in results.pages" :key="p.path">
                  <NuxtLink
                    :to="p.path"
                    class="group flex items-center gap-3.5 px-3 py-3 sm:px-4 rounded-[var(--radius-lg)] border border-transparent no-underline transition-[background-color,border-color] duration-150 hover:bg-[var(--surface-card)] hover:border-[var(--border-subtle)] hover:shadow-[var(--shadow-sm)]"
                  >
                    <span class="flex-none inline-flex items-center justify-center w-11 h-11 rounded-[var(--radius-md)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary-strong)]" aria-hidden="true">
                      <UiIcon name="arrowRight" :size="20" :stroke="2" />
                    </span>
                    <span class="flex-1 min-w-0">
                      <span class="block font-semibold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">{{ p.label }}</span>
                      <span v-if="p.note" class="block text-[0.8125rem] text-[var(--text-muted)] mt-0.5">{{ p.note }}</span>
                    </span>
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- Documents -->
            <div v-if="results.documents.length">
              <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] m-0 mb-4">
                Documents
                <span class="font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-subtle)] font-medium ml-1">{{ results.documents.length }}</span>
              </h3>
              <ul class="list-none p-0 m-0 grid gap-1.5 sm:gap-2">
                <li v-for="d in cappedDocs" :key="d.file">
                  <ResourcesDocRow :doc="d" />
                </li>
              </ul>
              <p v-if="docsOverflow" class="text-[0.875rem] text-[var(--text-muted)] mt-4">
                Showing the first {{ DOC_CAP }} — add another word to narrow it down.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ===================== BROWSE ===================== -->
      <template v-else>
        <!-- Member benefits — the old "Benefits"/"Financial" menu -->
        <section id="benefits" class="las-section">
          <div class="las-container">
            <UiSectionHead
              eyebrow="Benefits"
              :title="benefits.title"
              :intro="benefits.intro"
            />
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
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
        <section id="tools" class="las-section">
          <div class="las-container">
            <UiSectionHead
              eyebrow="Quick links"
              title="Staff tools"
              :intro="staffTools.intro"
            />
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
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
        <section class="bg-[var(--surface-sunken)] py-[var(--section-y-tight)] border-y border-[var(--border-subtle)]">
          <div class="las-container grid gap-x-10 gap-y-8 md:grid-cols-2">
            <div v-for="g in quickLinks" :key="g.id">
              <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] m-0 mb-4">
                {{ g.title }}
              </h3>
              <div class="grid gap-3 sm:grid-cols-2">
                <ResourcesQuickLink v-for="l in g.links" :key="l.url" :link="l" />
              </div>
            </div>
          </div>
        </section>

        <!-- Document library -->
        <section id="documents" class="las-section">
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
        <section id="links" class="bg-[var(--surface-sunken)] py-[var(--section-y)] border-y border-[var(--border-subtle)]">
          <div class="las-container">
            <UiSectionHead
              eyebrow="Links"
              title="Related organisations"
              intro="Sister UNISON ambulance branches, the wider movement, NHS bodies and the ambulance services."
            />
            <div class="grid gap-x-10 gap-y-10 md:grid-cols-2 mt-8">
              <div v-for="g in relatedLinks" :key="g.id">
                <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-md)] text-[var(--text-strong)] m-0 mb-1">
                  {{ g.title }}
                </h3>
                <p v-if="g.intro" class="text-[0.875rem] text-[var(--text-muted)] m-0 mb-3">{{ g.intro }}</p>
                <div class="mt-1">
                  <ResourcesLinkRow v-for="l in g.links" :key="l.url" :link="l" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- More on this site -->
        <section class="las-section">
          <div class="las-container">
            <h2 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-2xl)] text-[var(--text-strong)] m-0 mb-6">
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
                class="group flex flex-col h-full bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] no-underline transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[var(--shadow-lg)] hover:border-[var(--border-default)]"
              >
                <span class="inline-flex items-center justify-center w-11 h-11 rounded-[var(--radius-md)] bg-[var(--brand-secondary-soft)] text-[var(--green-700)] mb-4" aria-hidden="true">
                  <UiIcon :name="card.icon" :size="22" :stroke="1.9" />
                </span>
                <span class="font-[family-name:var(--font-display)] font-extrabold text-[1.125rem] text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">{{ card.label }}</span>
                <span class="text-[length:var(--text-sm)] text-[var(--text-muted)] mt-1 mb-4 leading-snug">{{ card.note }}</span>
                <span class="mt-auto inline-flex items-center gap-1.5 text-[0.875rem] font-bold text-[var(--brand-primary)]">
                  Open
                  <UiIcon name="arrowRight" :size="16" :stroke="2" class="transition-transform duration-150 group-hover:translate-x-0.5" />
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
