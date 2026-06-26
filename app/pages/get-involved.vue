<script setup lang="ts">
// /get-involved — the hub for the branch's sections and self-organised groups.
// Destination for the "Get Involved" dropdown. Cards generated from the
// matching group in app/data/nav.ts.
import { navGroups } from '~/data/nav'
import type { SiteLink } from '~/data/links'

const group = navGroups.find(g => g.id === 'get-involved')!
const cards = computed<SiteLink[]>(() =>
  group.items.map(i => ({ label: i.label, url: i.path, note: i.note, icon: i.icon })),
)

useHead({ title: 'Get Involved — LAS UNISON' })
useSeoMeta({
  description: group.intro,
  ogTitle: 'Get Involved — LAS UNISON',
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
            class="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-[var(--purple-200)]"
          >
            <NuxtLink
              to="/"
              class="text-[var(--purple-200)] no-underline hover:text-white"
            >Home</NuxtLink>
            <span
              class="opacity-50"
              aria-hidden="true"
            >/</span>
            <span
              class="font-semibold text-white"
              aria-current="page"
            >Get Involved</span>
          </nav>
          <h1
            class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.02] font-black tracking-[-0.02em] text-white"
          >
            Get Involved
          </h1>
          <p class="mt-5 mb-0 max-w-[620px] text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)]">
            {{ group.intro }}
          </p>
        </div>
      </section>

      <!-- Ways in -->
      <section class="las-section">
        <div class="las-container">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ResourcesQuickLink
              v-for="c in cards"
              :key="c.url"
              :link="c"
              featured
            />
          </div>

          <!-- Become a rep -->
          <div
            class="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-brand-soft)] p-6"
          >
            <div class="max-w-[52ch]">
              <h2 class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-[var(--text-strong)]">
                Could you be a rep?
              </h2>
              <p class="m-0 mt-1.5 text-[0.9375rem] leading-[1.55] text-[var(--text-muted)]">
                Reps are the branch. With full training and the branch behind you, you can stand up for
                colleagues where it matters most — in your own workplace.
              </p>
            </div>
            <UiButton
              href="/stewards-zone"
              variant="primary"
              icon-right="arrowRight"
            >
              Stewards' zone
            </UiButton>
          </div>
        </div>
      </section>

      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>
