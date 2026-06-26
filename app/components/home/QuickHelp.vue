<script setup lang="ts">
// Quick-access "triage" strip — the help-first principle made scannable.
// Sits directly under the UNISON Direct bar; the most common member jobs.
type Tone = 'primary' | 'accent' | 'secondary' | 'amber'

const ACTIONS: { icon: string, title: string, body: string, href: string, tone: Tone }[] = [
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
  <section
    id="help"
    class="las-container pt-12 md:pt-16"
  >
    <div class="mb-6 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h2
          class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-3xl)] font-extrabold tracking-[-0.015em] text-[var(--text-strong)]"
        >
          Whatever's happened, start here
        </h2>
      </div>
      <UiButton
        variant="ghost"
        href="/support"
        icon-right="arrowRight"
      >
        All member support
      </UiButton>
    </div>

    <div
      class="grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)] sm:grid-cols-2 lg:grid-cols-4 [&>a:not(:first-child)]:border-t lg:[&>a:not(:first-child)]:border-t-0 sm:[&>a:nth-child(2)]:border-t-0 sm:[&>a:nth-child(2n)]:border-l lg:[&>a:nth-child(3)]:border-l"
    >
      <NuxtLink
        v-for="a in ACTIONS"
        :key="a.title"
        :to="a.href"
        class="group relative flex flex-col gap-2.5 border-[var(--border-subtle)] p-6 text-[var(--text-body)] no-underline transition-colors duration-150 ease-out hover:bg-[var(--surface-sunken)] focus-visible:bg-[var(--surface-sunken)]"
      >
        <span
          class="inline-flex size-12 items-center justify-center rounded-[var(--radius-md)]"
          :class="TONES[a.tone]"
        >
          <UiIcon
            :name="a.icon"
            :size="24"
            :stroke="1.9"
          />
        </span>
        <h3
          class="m-0 mt-1 inline-flex items-center gap-1.5 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]"
        >
          {{ a.title }}
          <UiIcon
            name="arrowRight"
            :size="16"
            :stroke="2.4"
            class="-translate-x-1 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
          />
        </h3>
        <p class="m-0 text-[0.9375rem] leading-[1.55] text-[var(--text-muted)]">{{ a.body }}</p>
      </NuxtLink>
    </div>
  </section>
</template>
