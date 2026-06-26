<script setup lang="ts">
// Footer — mirrors the primary menu so the two never drift: the columns are built
// from app/data/nav.ts (the single source of truth for the site's IA), not a
// separate hand-kept list. Three menu groups become the first three columns; the
// fourth is a curated set of member-benefit providers (not part of the menu).
// The remaining menu sections sit in the bottom sitemap strip.
import { navGroups, socials as SOCIALS } from '~/data/nav'

// A handful of links are more useful from the footer than from the menu — remap
// those by path. "Update your details" goes straight to the My UNISON self-service
// portal here (the menu keeps the branch's own update form).
const OVERRIDES: Record<string, string> = {
  '/update-your-details': 'https://my.unison.org.uk/',
}

interface FooterLink { label: string; href: string }
interface FooterCol { h: string; href: string; links: FooterLink[] }

function colFromGroup(id: string): FooterCol {
  const g = navGroups.find((x) => x.id === id)!
  return {
    h: g.label,
    href: g.hub,
    links: g.items.map((it) => ({ label: it.label, href: OVERRIDES[it.path] ?? it.path })),
  }
}

// Member benefits — the union's benefit providers, kept out of the menu by design.
// Links verified live (Jun 2026); "All member offers" replaces a 404'd page.
const BENEFITS: FooterCol = {
  h: 'Member benefits',
  href: '/resources',
  links: [
    { label: 'Croyde Bay', href: 'https://www.croydeunison.co.uk/' },
    { label: 'Cashback shopping', href: 'https://www.unisonrewards.com/' },
    { label: 'Dental & health plan', href: 'https://union-benefits.co.uk/youbenefit/' },
    { label: 'Travel Club', href: 'https://www.unisontravelclub.co.uk/' },
    { label: 'All member offers', href: 'https://unison.org.uk/benefits' },
  ],
}

const COLS: FooterCol[] = [
  colFromGroup('your-branch'),
  colFromGroup('membership-pay'),
  colFromGroup('support'),
  BENEFITS,
]

// The menu's standalone sections (no dropdown) — a slim sitemap strip in the base.
const MORE: FooterLink[] = [
  { label: 'Get Involved', href: '/get-involved' },
  { label: 'News', href: '/news' },
  { label: 'Resources', href: '/resources' },
]

const isInternal = (h: string) => h.startsWith('/')

// Resolve the real component — binding :is to the string 'NuxtLink' renders an
// (inert) <nuxtlink> element that never navigates.
const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <footer class="font-[family-name:var(--font-sans)]">
    <!-- Battenburg band -->
    <div
      class="h-4"
      :style="{
        backgroundImage: 'url(/battenburg-band.svg)',
        backgroundSize: 'auto 100%',
        backgroundRepeat: 'repeat-x',
      }"
      aria-hidden="true"
    />
    <div class="bg-[var(--surface-inverse)] text-[var(--ink-300)] pt-16 pb-8">
      <div class="las-container">
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <UiLogo tone="light" class="mb-[18px]" />
            <p class="text-[0.875rem] leading-[1.6] text-[var(--ink-400)] max-w-[300px]">
              The biggest ambulance branch in the UK. We represent, support and
              stand up for ambulance staff across London.
            </p>
            <div class="flex gap-2.5 mt-[18px]">
              <a
                v-for="s in SOCIALS"
                :key="s.name"
                :href="s.href"
                :aria-label="`LAS UNISON on ${s.name}`"
                target="_blank"
                rel="noopener noreferrer"
                class="w-11 h-11 rounded-full bg-white/[0.08] text-white inline-flex items-center justify-center hover:bg-white/[0.16]"
              >
                <UiIcon :name="s.name" :size="18" :stroke="1.8" />
              </a>
            </div>
          </div>
          <div v-for="col in COLS" :key="col.h">
            <h4 class="m-0 mb-3.5">
              <NuxtLink
                :to="col.href"
                class="font-[family-name:var(--font-display)] font-extrabold text-[1rem] text-white no-underline tracking-[0.02em] hover:text-[var(--ink-300)] transition-colors duration-150"
              >{{ col.h }}</NuxtLink>
            </h4>
            <ul class="list-none p-0 m-0 flex flex-col gap-[9px]">
              <li v-for="l in col.links" :key="l.label">
                <component
                  :is="isInternal(l.href) ? NuxtLink : 'a'"
                  :to="isInternal(l.href) ? l.href : undefined"
                  :href="isInternal(l.href) ? undefined : l.href"
                  class="text-[var(--ink-300)] no-underline text-[0.875rem] hover:text-white transition-colors duration-150"
                  :target="isInternal(l.href) ? undefined : '_blank'"
                  :rel="isInternal(l.href) ? undefined : 'noopener noreferrer'"
                >{{ l.label }}</component>
              </li>
            </ul>
          </div>
        </div>

        <div
          class="border-t border-white/10 mt-12 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-[0.875rem] text-[var(--ink-400)]"
        >
          <nav aria-label="More" class="flex flex-wrap items-center gap-x-[18px] gap-y-2">
            <NuxtLink
              v-for="m in MORE"
              :key="m.href"
              :to="m.href"
              class="text-[var(--ink-300)] no-underline font-semibold hover:text-white"
            >{{ m.label }}</NuxtLink>
            <span class="opacity-30" aria-hidden="true">|</span>
            <NuxtLink to="/legal/privacy-policy" class="text-[var(--ink-400)] no-underline hover:text-white">Privacy Policy</NuxtLink>
            <NuxtLink to="/legal/cookie-policy" class="text-[var(--ink-400)] no-underline hover:text-white">Cookie Policy</NuxtLink>
          </nav>
          <span>© London Ambulance Service UNISON Branch.</span>
        </div>
      </div>
    </div>
  </footer>
</template>
