<script setup lang="ts">
const HELP = [
  { icon: 'shield', title: 'Help at work', body: 'Representation, grievances, disciplinary support and advice from your local stewards.' },
  { icon: 'scale', title: 'Legal services', body: 'Free legal help for you and your family — at work and at home.' },
  { icon: 'heart', title: 'Welfare & wellbeing', body: 'Hardship grants, Linc peer support and the MIND Blue Light programme.' },
  { icon: 'bookOpen', title: 'Learning & education', body: 'Book grants, courses and development to help you progress.' },
] as const
</script>

<template>
  <section
    id="help"
    class="las-section border-y border-[var(--border-subtle)] bg-[var(--surface-card)]"
  >
    <div class="las-container">
      <UiSectionHead
        align="center"
        eyebrow="Member support"
        eyebrow-color="var(--brand-primary)"
        title="Here for you, on and off shift"
        intro="Whatever you're facing at work or at home, your branch is behind you."
      />
      <div class="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="h in HELP"
          :key="h.title"
          class="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-6"
        >
          <div
            class="mb-4 inline-flex size-[52px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
          >
            <UiIcon
              :name="h.icon"
              :size="26"
              :stroke="1.8"
            />
          </div>
          <h3 class="mb-2 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-[var(--text-strong)]">
            {{ h.title }}
          </h3>
          <p class="m-0 text-[0.875rem] leading-[1.6] text-[var(--text-muted)]">
            {{ h.body }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
