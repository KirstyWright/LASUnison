<script setup lang="ts">
// /support — the "member support" hub. Triage destination for the homepage
// Quick Help strip ("All member support", "Help at work") and the Support
// dropdown. Cards are generated from the Support group in app/data/nav.ts so
// the hub and the menu can never drift apart.
import { navGroups } from '~/data/nav'
import type { SiteLink } from '~/data/links'

const group = navGroups.find((g) => g.id === 'support')!
const cards = computed<SiteLink[]>(() =>
  group.items.map((i) => ({ label: i.label, url: i.path, note: i.note, icon: i.icon })),
)

useHead({ title: 'Support — LAS UNISON' })
useSeoMeta({
  description: group.intro,
  ogTitle: 'Support — LAS UNISON',
  ogDescription: group.intro,
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
            <span class="text-white font-semibold" aria-current="page">Support</span>
          </nav>
          <h1
            class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-5xl)] leading-[1.02] tracking-[-0.02em] m-0 text-white"
          >
            Support
          </h1>
          <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)] mt-5 mb-0 max-w-[620px]">
            {{ group.intro }}
          </p>
        </div>
      </section>

      <!-- Support topics -->
      <section class="las-section">
        <div class="las-container">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ResourcesQuickLink v-for="c in cards" :key="c.url" :link="c" featured />
          </div>

          <!-- Help at work, right now -->
          <div
            class="mt-8 bg-[var(--surface-brand-soft)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 flex flex-wrap items-center justify-between gap-4"
          >
            <div class="max-w-[52ch]">
              <h2 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] m-0">
                Facing something at work?
              </h2>
              <p class="text-[0.9375rem] leading-[1.55] text-[var(--text-muted)] m-0 mt-1.5">
                You're entitled to a trained rep beside you in any grievance, investigation or disciplinary.
                Find your workplace rep, or call UNISON Direct.
              </p>
            </div>
            <UiButton href="/find-a-rep" variant="primary" icon-right="arrowRight">Find your rep</UiButton>
          </div>
        </div>
      </section>

      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>
