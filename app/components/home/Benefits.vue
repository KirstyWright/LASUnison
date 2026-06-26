<script setup lang="ts">
// Why join — the homepage's join conversion (the `#join` anchor target).
// Benefit copy as data for Studio.
const JOIN_URL = 'https://join.unison.org.uk'
const BENEFITS: { icon: string, title: string, body: string }[] = [
  { icon: 'shield', title: 'Expert representation', body: 'A trained rep beside you in any meeting at work.' },
  { icon: 'scale', title: 'Free legal help', body: 'For you and your family, at work and at home.' },
  { icon: 'award', title: 'Free £5,000 cover', body: 'Accidental death cover for registered members.' },
  { icon: 'lifebuoy', title: 'Welfare & hardship', body: 'Grants and peer support when life gets hard.' },
  { icon: 'graduationCap', title: 'Learning & grants', body: 'Book grants, courses and CPD to progress.' },
  { icon: 'ticket', title: 'Croyde Bay & more', body: 'Holiday discounts, cashback shopping and offers.' },
]
</script>

<template>
  <section
    id="join"
    class="las-section border-y border-[var(--border-subtle)] bg-[var(--surface-card)]"
  >
    <div class="las-container grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <!-- Pitch + price + CTA -->
      <div>
        <h2
          class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-4xl)] leading-[1.06] font-black tracking-[-0.02em] text-[var(--text-strong)]"
        >
          More than a membership card
        </h2>
        <p class="mt-4 mb-7 max-w-[46ch] text-[length:var(--text-md)] leading-[1.6] text-[var(--text-muted)]">
          Members have won over <strong class="font-[family-name:var(--font-mono)] font-bold text-[var(--text-body)]">£4&nbsp;million</strong>
          in compensation since 1999. Join your colleagues and get the full weight of the branch
          behind you.
        </p>

        <div
          class="mb-6 flex items-end gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-brand-soft)] p-5"
        >
          <div>
            <div class="mb-1 text-[0.8125rem] font-bold tracking-[0.08em] text-[var(--brand-primary)] uppercase">
              From
            </div>
            <div class="font-[family-name:var(--font-mono)] text-[length:var(--text-4xl)] leading-none font-semibold text-[var(--text-strong)]">
              £1.30
            </div>
          </div>
          <p class="m-0 pb-1 text-[0.9375rem] leading-[1.45] text-[var(--text-muted)]">
            a month — banded by your salary. Cover starts the day you join, and you can cancel any time.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UiButton
            variant="primary"
            size="lg"
            :href="JOIN_URL"
            icon-right="arrowRight"
          >
            Join UNISON
          </UiButton>
          <UiButton
            variant="outline"
            size="lg"
            href="/membership"
          >
            Compare benefits
          </UiButton>
        </div>
        <NuxtLink
          to="/update-your-details"
          class="mt-4 inline-block text-[0.9375rem] font-semibold text-[var(--brand-primary)] underline decoration-[var(--brand-primary)]/30 underline-offset-4 hover:decoration-[var(--brand-primary)]"
        >
          Already a member? Update your details →
        </NuxtLink>
      </div>

      <!-- What you get -->
      <ul class="m-0 grid list-none gap-x-6 gap-y-5 p-0 sm:grid-cols-2">
        <li
          v-for="b in BENEFITS"
          :key="b.title"
          class="flex items-start gap-3.5"
        >
          <span
            class="mt-0.5 inline-flex size-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-secondary-soft)] text-[var(--brand-secondary)]"
          >
            <UiIcon
              :name="b.icon"
              :size="22"
              :stroke="1.9"
            />
          </span>
          <div>
            <h3 class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-md)] font-bold text-[var(--text-strong)]">
              {{ b.title }}
            </h3>
            <p class="m-0 mt-0.5 text-[0.9375rem] leading-[1.5] text-[var(--text-muted)]">
              {{ b.body }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
