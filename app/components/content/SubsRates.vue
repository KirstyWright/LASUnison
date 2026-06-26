<script setup lang="ts">
/**
 * SubsRates — UNISON subscription rates, banded by salary (`::subs-rates`). A
 * "from" figure, then the salary→cost bands as a description list (semantic, and
 * it dodges the `.las-prose table` styling), then the tax-relief note. Costs are in
 * IBM Plex Mono with tabular figures so they line up and read as fact. Rooted in
 * .las-embed; labels are <span>s, immune to the `.las-prose a` reset. The bands,
 * "from" figure and tax-relief link are props so Studio can update them when rates
 * change.
 */
interface Band { salary: string; cost: string }

const props = withDefaults(
  defineProps<{
    fromCost?: string
    region?: string
    taxReliefHref?: string
    items?: Band[]
    // Optional in-page anchor id (e.g. "subscription-rates") so other pages can
    // deep-link straight to the rates. Blank = no id.
    anchor?: string
  }>(),
  {
    fromCost: '£1.30',
    region: 'England, Scotland & Wales',
    taxReliefHref: '/news/tax-relief-on-unison-subsciptions',
    items: () => [
      { salary: 'Up to £2,000', cost: '£1.30' },
      { salary: '£2,001 – £5,000', cost: '£3.50' },
      { salary: '£5,001 – £8,000', cost: '£5.30' },
      { salary: '£8,001 – £11,000', cost: '£6.60' },
      { salary: '£11,001 – £14,000', cost: '£7.85' },
      { salary: '£14,001 – £17,000', cost: '£9.70' },
      { salary: '£17,001 – £20,000', cost: '£11.50' },
      { salary: '£20,001 – £25,000', cost: '£14.00' },
      { salary: '£25,001 – £30,000', cost: '£17.25' },
      { salary: '£30,001 – £35,000', cost: '£20.30' },
      { salary: 'Over £35,000', cost: '£22.50' },
    ],
  },
)

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <div :id="anchor" class="las-embed bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden scroll-mt-[calc(var(--header-h)+1rem)]">
    <!-- From figure -->
    <div class="flex flex-wrap items-end gap-x-4 gap-y-1 bg-[var(--surface-brand-soft)] px-5 py-4 border-b border-[var(--border-subtle)]">
      <div>
        <span class="block font-[family-name:var(--font-sans)] text-[0.75rem] font-bold uppercase tracking-[0.08em] text-[var(--brand-primary)]">From</span>
        <span class="block font-[family-name:var(--font-mono)] font-semibold text-[length:var(--text-4xl)] leading-none text-[var(--text-strong)]">{{ fromCost }}</span>
      </div>
      <span class="text-[0.9375rem] leading-[1.45] text-[var(--text-muted)] pb-1">a month. What you pay is banded by your salary — everyone gets the same cover.</span>
    </div>

    <!-- Column heads -->
    <div class="flex items-baseline justify-between gap-4 px-5 pt-4 pb-2">
      <span class="font-[family-name:var(--font-sans)] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[var(--text-muted)]">Annual salary</span>
      <span class="font-[family-name:var(--font-sans)] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[var(--text-muted)]">Monthly cost · {{ region }}</span>
    </div>

    <!-- Bands -->
    <dl class="m-0 px-5 pb-2">
      <div
        v-for="b in items"
        :key="b.salary"
        class="flex items-baseline justify-between gap-4 py-2.5 border-t border-[var(--border-subtle)]"
      >
        <dt class="m-0 text-[0.9375rem] text-[var(--text-body)]">{{ b.salary }}</dt>
        <dd class="m-0 font-[family-name:var(--font-mono)] font-semibold text-[0.9375rem] tabular-nums text-[var(--text-strong)]">{{ b.cost }}</dd>
      </div>
    </dl>

    <!-- Tax relief note -->
    <div class="flex items-start gap-3 bg-[var(--surface-sunken)] px-5 py-4 border-t border-[var(--border-subtle)]">
      <span class="flex-none mt-0.5 text-[var(--brand-secondary)]" aria-hidden="true">
        <UiIcon name="banknote" :size="20" :stroke="1.9" />
      </span>
      <p class="m-0 text-[0.9375rem] leading-[1.55] text-[var(--text-muted)]">
        You can claim tax relief on 70% of your subscription, lowering the real cost.
        <component :is="NuxtLink" :to="taxReliefHref" class="group inline-flex items-center gap-1 align-baseline">
          <span class="font-semibold text-[var(--brand-primary)] transition-colors group-hover:text-[var(--brand-primary-strong)]">How tax relief works</span>
          <UiIcon name="arrowRight" :size="15" :stroke="2.2" class="text-[var(--brand-primary)] transition-transform group-hover:translate-x-0.5" />
        </component>
      </p>
    </div>
  </div>
</template>
