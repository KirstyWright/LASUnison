<script setup lang="ts">
type Variant = 'default' | 'solid' | 'secondary' | 'accent' | 'highlight' | 'success' | 'warning' | 'danger' | 'emergency' | 'neutral'

const props = withDefaults(
  defineProps<{ variant?: Variant; dot?: boolean }>(),
  { variant: 'default', dot: false },
)

const BASE =
  'inline-flex items-center gap-[0.4em] font-[family-name:var(--font-sans)] font-bold text-[0.75rem] tracking-[0.02em] uppercase leading-none px-[0.7em] py-[0.42em] rounded-[var(--radius-sm)]'

const V: Record<Variant, string> = {
  default: 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary-strong)]',
  solid: 'bg-[var(--brand-primary)] text-white',
  secondary: 'bg-[var(--brand-secondary-soft)] text-[var(--brand-secondary-strong)]',
  accent: 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent-strong)]',
  highlight: 'bg-[var(--brand-highlight)]/15 text-[var(--brand-highlight)]',
  success: 'bg-[var(--success-soft)] text-[var(--brand-secondary-strong)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--amber-600)]',
  danger: 'bg-[var(--danger-soft)] text-[var(--red-700)]',
  emergency: 'bg-[var(--emergency)] text-white',
  neutral: 'bg-[var(--surface-sunken)] text-[var(--text-muted)]',
}
</script>

<template>
  <span :class="[BASE, V[variant]]">
    <span v-if="dot" class="w-[0.5em] h-[0.5em] rounded-full bg-current" aria-hidden="true" />
    <slot />
  </span>
</template>
