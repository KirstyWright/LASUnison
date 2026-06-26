<script setup lang="ts">
/**
 * BenefitsGrid — a scannable grid of membership benefits for content
 * (`::benefits-grid`). Icon chip + title + one line each, the same idiom as the
 * homepage Benefits panel. Not links (it answers "why join", it doesn't navigate),
 * so it's plain <div>s — no <ul>/<li> that the prose list styling would re-bullet.
 * Rooted in .las-embed; titles/bodies are <span>s, immune to the `.las-prose a`
 * reset. Pass `items` to override the defaults.
 */
interface Benefit { icon: string; title: string; body: string }

withDefaults(
  defineProps<{ items?: Benefit[] }>(),
  {
    items: () => [
      { icon: 'shield', title: 'Expert representation', body: 'A trained rep beside you in any meeting — grievance, capability or disciplinary.' },
      { icon: 'scale', title: 'Free legal help', body: 'For you at work, and you and your family at home. Members have won £3m+ since 1999.' },
      { icon: 'lifebuoy', title: 'Welfare & hardship', body: 'Confidential support and grants for you and your dependents when life gets hard.' },
      { icon: 'graduationCap', title: 'Learning & training', body: 'Funded courses, CPD and qualifications to help you progress in your career.' },
      { icon: 'banknote', title: 'Pay & conditions', body: 'We negotiate your pay, hours and pensions — locally, regionally and nationally.' },
      { icon: 'ticket', title: 'Member discounts', body: 'Exclusive deals on holidays, insurance, shopping and the Croyde Bay resort.' },
    ],
  },
)
</script>

<template>
  <div class="las-embed grid gap-x-6 gap-y-5 sm:grid-cols-2">
    <div v-for="b in items" :key="b.title" class="flex items-start gap-3.5">
      <span
        class="flex-none w-11 h-11 rounded-[var(--radius-md)] bg-[var(--brand-secondary-soft)] text-[var(--brand-secondary)] inline-flex items-center justify-center mt-0.5"
        aria-hidden="true"
      >
        <UiIcon :name="b.icon" :size="22" :stroke="1.9" />
      </span>
      <div>
        <span class="block font-[family-name:var(--font-display)] font-bold text-[length:var(--text-md)] text-[var(--text-strong)] leading-tight">{{ b.title }}</span>
        <span class="block text-[0.9375rem] leading-[1.5] text-[var(--text-muted)] mt-0.5">{{ b.body }}</span>
      </div>
    </div>
  </div>
</template>
