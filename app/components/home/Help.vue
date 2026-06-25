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
    class="las-section bg-[var(--surface-card)] border-y border-[var(--border-subtle)]"
  >
    <div class="las-container">
      <UiSectionHead
        align="center"
        eyebrow="Member support"
        eyebrow-color="var(--brand-primary)"
        title="Here for you, on and off shift"
        intro="Whatever you're facing at work or at home, your branch is behind you."
      />
      <div class="grid gap-5 mt-11 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="h in HELP"
          :key="h.title"
          class="bg-[var(--surface-page)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6"
        >
          <div
            class="w-[52px] h-[52px] rounded-[var(--radius-md)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] inline-flex items-center justify-center mb-4"
          >
            <UiIcon :name="h.icon" :size="26" :stroke="1.8" />
          </div>
          <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] mb-2">
            {{ h.title }}
          </h3>
          <p class="text-[0.875rem] leading-[1.6] text-[var(--text-muted)] m-0">{{ h.body }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
