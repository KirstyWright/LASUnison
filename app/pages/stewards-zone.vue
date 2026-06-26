<script setup lang="ts">
// /stewards-zone — the branch's working space for reps: who the zone is for,
// training, bargaining tools, claim forms, downloadable resources (from the
// document library) and the free software list. Replaces the old sparse
// markdown page and folds in its two former sub-pages (free-software and
// stewards-hs-rep-resources), which now 301 here.
import type { SiteDocument } from '~/utils/resources'
import { repRoles, bargainingLinks, claimForms, freeSoftware, relatedLinks } from '~/data/stewards'

// Documents: same source as the Resources hub, scoped to the rep set. The topic
// string uses a curly apostrophe (U+2019), matching TOPIC_MAP in utils/resources.
const STEWARDS_TOPIC = 'Stewards’ resources'
// The H&S-rep A5 contact card lives under the Health & safety topic; pull it in
// too so the steward contact-card set on this page stays complete.
const HS_REP_CARD = '/docs/2022/12/your-health-and-safety-rep.pdf'

const { data: documentsData } = await useAsyncData('stewards-documents', () =>
  queryCollection('documents').order('date', 'DESC').all(),
)
const stewardDocs = computed<SiteDocument[]>(() =>
  ((documentsData.value ?? []) as SiteDocument[]).filter(
    (d) => d.topic === STEWARDS_TOPIC || d.file === HS_REP_CARD,
  ),
)

const description =
  'Tools and resources for LAS UNISON stewards, Health & Safety reps and learning reps: training, bargaining guides, claim forms and downloads to help you do the job.'

useHead({ title: "Stewards' zone — LAS UNISON" })
useSeoMeta({
  description,
  ogTitle: "Stewards' zone — LAS UNISON",
  ogDescription: description,
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
            <span class="opacity-50" aria-hidden="true">/</span>
            <NuxtLink to="/get-involved" class="text-[var(--purple-200)] no-underline hover:text-white">Get Involved</NuxtLink>
            <span class="opacity-50" aria-hidden="true">/</span>
            <span class="text-white font-semibold" aria-current="page">Stewards' zone</span>
          </nav>
          <h1
            class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-5xl)] leading-[1.02] tracking-[-0.02em] m-0 text-white"
          >
            Stewards' zone
          </h1>
          <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)] mt-5 mb-0 max-w-[640px]">
            Tools, templates and guidance for every station rep, Health &amp; Safety rep and learning rep.
            Everything you need to do the job and stand up for colleagues.
          </p>
          <div class="flex flex-wrap gap-3 mt-7">
            <UiButton href="#downloads" variant="highlight" icon-right="download">Resources &amp; downloads</UiButton>
            <UiButton href="/education" variant="outline-invert" icon-right="arrowRight">
              Get trained
            </UiButton>
          </div>
        </div>
      </section>

      <!-- Who the zone is for -->
      <section class="las-section">
        <div class="las-container">
          <UiEyebrow color="var(--brand-primary)">The reps</UiEyebrow>
          <h2 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-2xl)] tracking-[-0.015em] text-[var(--text-strong)] m-0">
            Who this zone is for
          </h2>
          <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--text-muted)] mt-3 mb-0 max-w-[60ch]">
            Reps are volunteers, elected by the workforce. They do the work of recruiting members, keeping
            people safe and organising the branch. Whatever your role, this is where your tools live.
          </p>

          <div class="grid gap-4 sm:grid-cols-2 mt-7">
            <StewardsRoleCard v-for="r in repRoles" :key="r.url" :role="r" />
          </div>

          <!-- New to the role? Training callout -->
          <div
            class="mt-8 bg-[var(--surface-brand-soft)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 flex flex-wrap items-center justify-between gap-4"
          >
            <div class="max-w-[56ch]">
              <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] m-0">
                New to the role?
              </h3>
              <p class="text-[0.9375rem] leading-[1.55] text-[var(--text-muted)] m-0 mt-1.5">
                Stewards, health &amp; safety reps and union learning reps have the right to paid time off for
                training in their union duties. The branch Education Officer co-ordinates it all.
              </p>
            </div>
            <UiButton href="/education" variant="primary" icon-right="arrowRight">Education &amp; training</UiButton>
          </div>
        </div>
      </section>

      <!-- Guides, tools & forms -->
      <section class="las-section bg-[var(--surface-sunken)]">
        <div class="las-container">
          <UiEyebrow color="var(--brand-primary)">Tools</UiEyebrow>
          <h2 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-2xl)] tracking-[-0.015em] text-[var(--text-strong)] m-0">
            Negotiating &amp; bargaining
          </h2>
          <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--text-muted)] mt-3 mb-0 max-w-[62ch]">
            Most branch officers, stewards and safety reps negotiate with employers at some point. It's how you
            protect members and win fairness at work. These UNISON guides and courses give you what you need.
          </p>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-7">
            <ResourcesQuickLink v-for="l in bargainingLinks" :key="l.url" :link="l" />
          </div>

          <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] tracking-[-0.01em] text-[var(--text-strong)] m-0 mt-12">
            Claim forms
          </h3>
          <p class="text-[0.9375rem] leading-[1.55] text-[var(--text-muted)] mt-2 mb-0 max-w-[62ch]">
            Use the current online forms below. The old PDF versions are no longer accepted.
          </p>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            <ResourcesQuickLink v-for="l in claimForms" :key="l.url" :link="l" />
          </div>
        </div>
      </section>

      <!-- Steward resources & downloads -->
      <section id="downloads" class="las-section">
        <div class="las-container">
          <UiEyebrow color="var(--brand-primary)">Downloads</UiEyebrow>
          <h2 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-2xl)] tracking-[-0.015em] text-[var(--text-strong)] m-0">
            Steward resources &amp; downloads
          </h2>
          <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--text-muted)] mt-3 mb-5 max-w-[62ch]">
            The documents you'll need as a UNISON activist: contact cards, pocket guides, expenses templates
            and more. There's a wider range in the UNISON online catalogue too.
          </p>
          <UiButton
            href="https://shop.unison.site/product-category/application-forms/"
            variant="outline"
            size="sm"
            icon-right="arrowUpRight"
            class="mb-8"
          >
            UNISON online catalogue
          </UiButton>

          <ResourcesDocLibrary v-if="stewardDocs.length" :docs="stewardDocs" />
          <p v-else class="text-[var(--text-muted)]">
            No steward resources in the library yet.
            <NuxtLink to="/resources#documents" class="text-[var(--text-link)] underline">Browse all documents</NuxtLink>.
          </p>
        </div>
      </section>

      <!-- Free office software -->
      <section id="software" class="las-section bg-[var(--surface-sunken)]">
        <div class="las-container">
          <UiEyebrow color="var(--brand-primary)">Software</UiEyebrow>
          <h2 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-2xl)] tracking-[-0.015em] text-[var(--text-strong)] m-0">
            Free office software
          </h2>
          <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--text-muted)] mt-3 mb-0 max-w-[62ch]">
            Our Word templates open just as easily in free software. Here are some of the best free tools we've
            found. No licence fees, and you can install them on as many computers as you like.
          </p>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-7">
            <ResourcesQuickLink v-for="l in freeSoftware" :key="l.url" :link="l" />
          </div>
        </div>
      </section>

      <!-- More for reps -->
      <section class="las-section">
        <div class="las-container">
          <h2 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-2xl)] tracking-[-0.015em] text-[var(--text-strong)] m-0">
            More for reps
          </h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            <ResourcesQuickLink v-for="l in relatedLinks" :key="l.url" :link="l" />
          </div>
        </div>
      </section>

      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>
