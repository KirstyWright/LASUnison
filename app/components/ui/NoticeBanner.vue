<script setup lang="ts">
withDefaults(defineProps<{ tag?: string }>(), { tag: 'Latest' })
const emit = defineEmits<{ close: [] }>()

const WRAP =
  'flex items-center gap-3 flex-wrap font-[family-name:var(--font-sans)] text-[0.875rem] bg-[var(--surface-brand-deep)] text-white py-2 px-[var(--gutter)]'
</script>

<template>
  <div :class="WRAP">
    <span
      v-if="tag"
      class="flex-none font-bold tracking-[0.08em] uppercase text-[0.75rem] bg-[var(--brand-highlight)] text-[var(--ink-900)] px-[0.6em] py-[0.3em] rounded-[var(--radius-sm)]"
    >{{ tag }}</span>
    <span class="min-w-0 [&_a]:text-[var(--brand-highlight)] [&_a]:font-bold"><slot /></span>
    <button
      type="button"
      aria-label="Dismiss"
      class="ml-auto bg-transparent border-none text-[var(--purple-200)] cursor-pointer inline-flex items-center justify-center w-11 h-11 rounded-[var(--radius-md)] hover:text-white [&>svg]:w-4 [&>svg]:h-4"
      @click="emit('close')"
    >
      <UiIcon name="x" :size="16" :stroke="2" />
    </button>
  </div>
</template>
