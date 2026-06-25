<script setup lang="ts">
// One committee member: photo (or initials), name, role and — for officers —
// the ways to reach them. Used on /branch for both officers and branch reps.
const props = withDefaults(
  defineProps<{
    name: string
    role: string
    workplace?: string
    phone?: string
    email?: string
    photo?: string
    accent?: 'purple' | 'green'
  }>(),
  { accent: 'purple' },
)

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

const tel = computed(() => props.phone?.replace(/\s+/g, '') ?? '')

const accentVar = computed(() =>
  props.accent === 'green' ? 'var(--brand-secondary)' : 'var(--brand-primary)',
)
const fallbackBg = computed(() =>
  props.accent === 'green'
    ? 'linear-gradient(150deg, var(--green-600), var(--green-800))'
    : 'linear-gradient(150deg, var(--purple-600), var(--purple-800))',
)
</script>

<template>
  <article
    class="group/card flex flex-col bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] transition-[box-shadow,transform,border-color] duration-200 ease-out hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 hover:border-[var(--border-default)]"
  >
    <!-- Portrait -->
    <div class="relative aspect-[4/5] overflow-hidden bg-[var(--surface-sunken)]">
      <img
        v-if="photo"
        :src="photo"
        :alt="`${name} — ${role}`"
        width="560"
        height="700"
        loading="lazy"
        decoding="async"
        class="w-full h-full object-cover object-[center_top] transition-transform duration-500 ease-out group-hover/card:scale-[1.03]"
      >
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
        :style="{ background: fallbackBg }"
        aria-hidden="true"
      >
        <span class="font-[family-name:var(--font-display)] font-black text-[2.5rem] leading-none text-white/90 tracking-[-0.02em]">
          {{ initials }}
        </span>
      </div>
      <!-- accent keyline anchoring the photo to the card body -->
      <span class="absolute inset-x-0 bottom-0 h-1" :style="{ background: accentVar }" aria-hidden="true" />
    </div>

    <!-- Body -->
    <div class="flex flex-col flex-1 p-4">
      <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[1.0625rem] leading-[1.2] tracking-[-0.01em] text-[var(--text-strong)] m-0">
        {{ name }}
      </h3>
      <p
        class="font-[family-name:var(--font-sans)] font-bold text-[0.8125rem] leading-[1.3] mt-1 mb-0"
        :style="{ color: accentVar }"
      >
        {{ role }}
      </p>

      <p
        v-if="workplace"
        class="flex items-start gap-1.5 text-[0.8125rem] leading-[1.35] text-[var(--text-muted)] mt-2.5 mb-0"
      >
        <UiIcon name="mapPin" :size="14" :stroke="2" class="text-[var(--text-subtle)] flex-none mt-px" />
        <span>{{ workplace }}</span>
      </p>

      <!-- Contact (officers carry phone/email; reps are reached via Find a rep) -->
      <div
        v-if="phone || email"
        class="flex flex-col gap-1.5 mt-3 pt-3 border-t border-[var(--border-subtle)]"
      >
        <a
          v-if="phone"
          :href="`tel:${tel}`"
          class="flex items-center gap-2 no-underline font-[family-name:var(--font-mono)] text-[0.8125rem] font-medium text-[var(--text-body)] hover:text-[var(--brand-primary)] group/link"
        >
          <UiIcon name="phone" :size="14" :stroke="2" class="text-[var(--text-subtle)] flex-none group-hover/link:text-[var(--brand-primary)]" />
          {{ phone }}
        </a>
        <a
          v-if="email"
          :href="`mailto:${email}`"
          class="flex items-center gap-2 no-underline text-[0.8125rem] text-[var(--text-body)] hover:text-[var(--brand-primary)] group/link min-w-0"
        >
          <UiIcon name="mail" :size="14" :stroke="2" class="text-[var(--text-subtle)] flex-none group-hover/link:text-[var(--brand-primary)]" />
          <span class="truncate">{{ email }}</span>
        </a>
      </div>
    </div>
  </article>
</template>
