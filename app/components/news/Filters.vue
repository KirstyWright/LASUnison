<script setup lang="ts">
/**
 * NewsFilters — category filter chips for the news archive.
 * Controlled via v-model; each chip shows its result count.
 */
defineProps<{
  categories: { label: string; count: number }[]
  modelValue: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const BASE =
  'inline-flex items-center gap-2 font-[family-name:var(--font-sans)] font-bold text-[0.875rem] leading-none px-4 h-10 rounded-full border-2 cursor-pointer whitespace-nowrap transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]'
const ACTIVE = 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
const IDLE =
  'bg-[var(--surface-card)] border-[var(--border-default)] text-[var(--text-body)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'
</script>

<template>
  <div
    role="group"
    aria-label="Filter news by category"
    class="flex gap-2.5 flex-wrap"
  >
    <button
      v-for="c in categories"
      :key="c.label"
      type="button"
      :aria-pressed="modelValue === c.label"
      :class="[BASE, modelValue === c.label ? ACTIVE : IDLE]"
      @click="emit('update:modelValue', c.label)"
    >
      {{ c.label }}
      <span
        class="font-[family-name:var(--font-mono)] text-[0.75rem] font-medium tabular-nums"
        :class="modelValue === c.label ? 'text-white/70' : 'text-[var(--text-subtle)]'"
      >{{ c.count }}</span>
    </button>
  </div>
</template>
