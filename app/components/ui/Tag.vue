<script setup lang="ts">
const props = withDefaults(
  defineProps<{ href?: string, active?: boolean }>(),
  { active: false },
)

const BASE
  = 'inline-flex items-center gap-[0.45em] font-[family-name:var(--font-sans)] font-semibold text-[0.875rem] leading-none px-[0.85em] py-[0.5em] rounded-full no-underline border transition-colors duration-150'

const tone = computed(() =>
  props.active
    ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
    : [
        'bg-[var(--surface-card)] border-[var(--border-default)] text-[var(--text-body)]',
        props.href && 'hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary-strong)] focus-visible:border-[var(--brand-primary)] focus-visible:bg-[var(--brand-primary-soft)] focus-visible:text-[var(--brand-primary-strong)]',
      ],
)
</script>

<template>
  <component
    :is="href ? 'a' : 'span'"
    :href="href"
    :class="[BASE, tone]"
  >
    <slot />
  </component>
</template>
