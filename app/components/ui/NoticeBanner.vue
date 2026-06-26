<script setup lang="ts">
withDefaults(defineProps<{ tag?: string }>(), { tag: 'Latest' })
const emit = defineEmits<{ close: [] }>()

const WRAP
  = 'flex items-center gap-3 flex-wrap font-[family-name:var(--font-sans)] text-[0.875rem] bg-[var(--surface-brand-deep)] text-white py-2 px-[var(--gutter)]'
</script>

<template>
  <div :class="WRAP">
    <span
      v-if="tag"
      class="flex-none rounded-[var(--radius-sm)] bg-[var(--brand-highlight)] px-[0.6em] py-[0.3em] text-[0.75rem] font-bold tracking-[0.08em] text-[var(--ink-900)] uppercase"
    >{{ tag }}</span>
    <span class="min-w-0 [&_a]:font-bold [&_a]:text-[var(--brand-highlight)]"><slot /></span>
    <button
      type="button"
      aria-label="Dismiss"
      class="ml-auto inline-flex size-11 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-none bg-transparent text-[var(--purple-200)] hover:text-white [&>svg]:size-4"
      @click="emit('close')"
    >
      <UiIcon
        name="x"
        :size="16"
        :stroke="2"
      />
    </button>
  </div>
</template>
