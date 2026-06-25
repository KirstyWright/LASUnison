<script setup lang="ts">
// Quick-access "triage" strip — the help-first principle made scannable.
// Sits directly under the UNISON Direct bar; the most common member jobs.
type Tone = 'primary' | 'accent' | 'secondary' | 'amber'

const ACTIONS: { icon: string; title: string; body: string; href: string; tone: Tone }[] = [
  { icon: 'shield', title: 'Help at work', body: 'Representation in grievances, investigations and disciplinaries.', href: '/support', tone: 'primary' },
  { icon: 'scale', title: 'Legal services', body: 'Free legal help for you and your family, at work and at home.', href: '/legal/legal-services', tone: 'accent' },
  { icon: 'lifebuoy', title: 'Welfare & wellbeing', body: 'Hardship grants, Linc peer support and Blue Light wellbeing.', href: '/welfare', tone: 'secondary' },
  { icon: 'banknote', title: 'Pay & pensions', body: 'AfC pay rates, the NHS pension and injury benefit, explained.', href: '/pay', tone: 'amber' },
]

const TONES: Record<Tone, string> = {
  primary: 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]',
  accent: 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]',
  secondary: 'bg-[var(--brand-secondary-soft)] text-[var(--brand-secondary)]',
  amber: 'bg-[var(--warning-soft)] text-[var(--amber-600)]',
}
</script>

<template>
  <section id="help" class="las-container pt-12 md:pt-16">
    <div class="flex items-end justify-between gap-5 flex-wrap mb-6">
      <div>
        <h2
          class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-3xl)] tracking-[-0.015em] text-[var(--text-strong)] m-0"
        >
          Whatever's happened, start here
        </h2>
      </div>
      <UiButton variant="ghost" href="/support" icon-right="arrowRight">All member support</UiButton>
    </div>

    <div
      class="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-[var(--border-subtle)] sm:[&>a]:border-l sm:[&>a:first-child]:border-l-0 lg:divide-x lg:divide-y-0"
    >
      <NuxtLink
        v-for="a in ACTIONS"
        :key="a.title"
        :to="a.href"
        class="group relative flex flex-col gap-2.5 p-6 no-underline text-[var(--text-body)] border-[var(--border-subtle)] transition-colors duration-150 ease-out hover:bg-[var(--surface-sunken)] focus-visible:bg-[var(--surface-sunken)]"
      >
        <span
          class="w-12 h-12 rounded-[var(--radius-md)] inline-flex items-center justify-center"
          :class="TONES[a.tone]"
        >
          <UiIcon :name="a.icon" :size="24" :stroke="1.9" />
        </span>
        <h3
          class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] m-0 mt-1 inline-flex items-center gap-1.5 group-hover:text-[var(--brand-primary)]"
        >
          {{ a.title }}
          <UiIcon
            name="arrowRight"
            :size="16"
            :stroke="2.4"
            class="opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0"
          />
        </h3>
        <p class="text-[0.9375rem] leading-[1.55] text-[var(--text-muted)] m-0">{{ a.body }}</p>
      </NuxtLink>
    </div>
  </section>
</template>
