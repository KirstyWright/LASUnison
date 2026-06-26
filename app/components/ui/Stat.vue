<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: string
    label?: string
    sub?: string
    accent?: string
    align?: 'left' | 'center'
    size?: 'md' | 'lg'
    invert?: boolean
  }>(),
  { align: 'left', size: 'lg', invert: false },
)

const valueColor = computed(() =>
  props.invert
    ? 'text-[var(--brand-highlight)]'
    : props.accent
      ? `text-[var(--${props.accent})]`
      : 'text-[var(--brand-primary)]',
)
const labelColor = computed(() => (props.invert ? 'text-white' : 'text-[var(--text-strong)]'))
const subColor = computed(() => (props.invert ? 'text-[var(--purple-200)]' : 'text-[var(--text-muted)]'))
const valueSize = computed(() =>
  props.size === 'md' ? 'text-[length:var(--text-4xl)]' : 'text-[length:var(--text-5xl)]',
)
</script>

<template>
  <div
    class="flex flex-col gap-1 font-[family-name:var(--font-sans)]"
    :class="align === 'center' && 'items-center text-center'"
  >
    <span
      class="font-[family-name:var(--font-display)] font-black tracking-[-0.015em] leading-none"
      :class="[valueColor, valueSize]"
    >{{ value }}</span>
    <span v-if="label" class="text-[1rem] font-bold" :class="labelColor">{{ label }}</span>
    <span v-if="sub" class="text-[length:var(--text-sm)]" :class="subColor">{{ sub }}</span>
  </div>
</template>
