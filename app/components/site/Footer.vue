<script setup lang="ts">
import { socials as SOCIALS } from '~/data/nav'

// Internal links route in-app via NuxtLink; an earlier footer pointed several
// of these back at the old lasunison.co.uk domain — they now resolve to the
// pages that live on this site.
const COLS = [
  {
    h: 'Your Branch',
    links: [
      { label: 'Branch Officers',       href: '/branch' },
      { label: 'Branch Representatives', href: '/branch#representatives' },
      { label: 'Calendar',              href: '/calendar' },
      { label: 'Health & Safety',       href: '/health-safety' },
      { label: 'Welfare',               href: '/welfare' },
      { label: 'Find a Rep',            href: '/find-a-rep' },
    ],
  },
  {
    h: 'Support',
    links: [
      { label: 'Pay Rates',             href: '/pay' },
      { label: 'NHS Pension Scheme',    href: '/nhs-pension-scheme' },
      { label: 'Legal Services',        href: '/legal/legal-services' },
      { label: 'Help at Work',          href: 'https://www.unison.org.uk/get-help/services-support/unison-direct/' },
      { label: 'Update Your Details',   href: '/update-your-details' },
    ],
  },
  {
    h: 'Benefits',
    links: [
      { label: 'Croyde Bay',        href: 'https://www.croydeunison.co.uk/' },
      { label: 'Cashback Shopping', href: 'https://www.unisonrewards.com/' },
      { label: 'Dental Plan',       href: 'https://www.youbenefit.co.uk/' },
      { label: 'Travel Club',       href: 'https://www.unisontravelclub.co.uk/' },
      { label: 'Member Offers',     href: 'https://www.unison.org.uk/member-benefits/exclusive-deals-offers/' },
    ],
  },
]
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
        <div class="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <UiLogo tone="light" class="mb-[18px]" />
            <p class="text-[0.875rem] leading-[1.6] text-[var(--ink-400)] max-w-[300px]">
              The biggest ambulance branch in the UK, with almost 7,000 members. We represent, support and
              stand up for ambulance staff across London.
            </p>
            <div class="flex gap-2.5 mt-[18px]">
              <a
                v-for="s in SOCIALS"
                :key="s.name"
                :href="s.href"
                :aria-label="s.name"
                :target="s.href !== '#' ? '_blank' : undefined"
                :rel="s.href !== '#' ? 'noopener noreferrer' : undefined"
                class="w-[38px] h-[38px] rounded-full bg-white/[0.08] text-white inline-flex items-center justify-center hover:bg-white/[0.16]"
              >
                <UiIcon :name="s.name" :size="18" :stroke="1.8" />
              </a>
            </div>
          </div>
          <div v-for="col in COLS" :key="col.h">
            <h4 class="font-[family-name:var(--font-display)] font-bold text-[1rem] text-white tracking-[0.02em] mb-3.5">
              {{ col.h }}
            </h4>
            <ul class="list-none p-0 m-0 flex flex-col gap-[9px]">
              <li v-for="l in col.links" :key="l.label">
                <component
                  :is="l.href.startsWith('/') ? 'NuxtLink' : 'a'"
                  :to="l.href.startsWith('/') ? l.href : undefined"
                  :href="l.href.startsWith('/') ? undefined : l.href"
                  class="text-[var(--ink-300)] no-underline text-[0.875rem] hover:text-white"
                  :target="l.href.startsWith('http') ? '_blank' : undefined"
                  :rel="l.href.startsWith('http') ? 'noopener noreferrer' : undefined"
                >{{ l.label }}</component>
              </li>
            </ul>
          </div>
        </div>
        <div
          class="border-t border-white/10 mt-12 pt-6 flex justify-between flex-wrap gap-3 text-[0.875rem] text-[var(--ink-500)]"
        >
          <span>© London Ambulance Service UNISON Branch. All rights reserved.</span>
          <div class="flex gap-[18px]">
            <NuxtLink to="/legal/privacy-policy" class="text-[var(--ink-400)] no-underline hover:text-white">Privacy Policy</NuxtLink>
            <NuxtLink to="/legal/cookie-policy"  class="text-[var(--ink-400)] no-underline hover:text-white">Cookie Policy</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
