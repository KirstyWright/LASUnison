<script setup lang="ts">
// Why join — the homepage's join conversion (the `#join` anchor target).
// Benefit copy as data for Studio.
const JOIN_URL = 'https://join.unison.org.uk'
const BENEFITS: { icon: string; title: string; body: string }[] = [
  { icon: 'shield', title: 'Expert representation', body: 'A trained rep beside you in any meeting at work.' },
  { icon: 'scale', title: 'Free legal help', body: 'For you and your family, at work and at home.' },
  { icon: 'award', title: 'Free £5,000 cover', body: 'Accidental death cover for registered members.' },
  { icon: 'lifebuoy', title: 'Welfare & hardship', body: 'Grants and peer support when life gets hard.' },
  { icon: 'graduationCap', title: 'Learning & grants', body: 'Book grants, courses and CPD to progress.' },
  { icon: 'ticket', title: 'Croyde Bay & more', body: 'Holiday discounts, cashback shopping and offers.' },
]
</script>

<template>
  <section id="join" class="las-section bg-[var(--surface-card)] border-y border-[var(--border-subtle)]">
    <div class="las-container grid gap-10 lg:gap-16 lg:grid-cols-[0.85fr_1.15fr] items-center">
      <!-- Pitch + price + CTA -->
      <div>
        <h2
          class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-4xl)] leading-[1.06] tracking-[-0.02em] text-[var(--text-strong)] m-0"
        >
          More than a membership card
        </h2>
        <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--text-muted)] mt-4 mb-7 max-w-[46ch]">
          Members have won over <strong class="font-[family-name:var(--font-mono)] text-[var(--text-body)] font-bold">£4&nbsp;million</strong>
          in compensation since 1999. Join your colleagues and get the full weight of the branch
          behind you.
        </p>

        <div
          class="flex items-end gap-4 bg-[var(--surface-brand-soft)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 mb-6"
        >
          <div>
            <div class="text-[0.8125rem] font-bold tracking-[0.08em] uppercase text-[var(--brand-primary)] mb-1">
              From
            </div>
            <div class="font-[family-name:var(--font-mono)] font-semibold text-[length:var(--text-4xl)] leading-none text-[var(--text-strong)]">
              £1.30
            </div>
          </div>
          <p class="text-[0.9375rem] leading-[1.45] text-[var(--text-muted)] m-0 pb-1">
            a month — banded by your salary. Cover starts the day you join, and you can cancel any time.
          </p>
        </div>

        <div class="flex gap-3 flex-wrap">
          <UiButton variant="primary" size="lg" :href="JOIN_URL" icon-right="arrowRight">Join UNISON</UiButton>
          <UiButton variant="outline" size="lg" href="/membership">Compare benefits</UiButton>
        </div>
        <NuxtLink
          to="/update-your-details"
          class="inline-block mt-4 text-[var(--brand-primary)] font-semibold text-[0.9375rem] underline decoration-[var(--brand-primary)]/30 hover:decoration-[var(--brand-primary)] underline-offset-4"
        >
          Already a member? Update your details →
        </NuxtLink>
      </div>

      <!-- What you get -->
      <ul class="list-none p-0 m-0 grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <li v-for="b in BENEFITS" :key="b.title" class="flex items-start gap-3.5">
          <span
            class="flex-none w-11 h-11 rounded-[var(--radius-md)] bg-[var(--brand-secondary-soft)] text-[var(--brand-secondary)] inline-flex items-center justify-center mt-0.5"
          >
            <UiIcon :name="b.icon" :size="22" :stroke="1.9" />
          </span>
          <div>
            <h3 class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-md)] text-[var(--text-strong)] m-0">
              {{ b.title }}
            </h3>
            <p class="text-[0.9375rem] leading-[1.5] text-[var(--text-muted)] m-0 mt-0.5">{{ b.body }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
