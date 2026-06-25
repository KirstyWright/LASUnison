<script setup lang="ts">
/**
 * ResourcesHubSearch — the hub's universal search field. Searches documents,
 * links and on-site pages at once (filtering happens in the parent). Lives on
 * the purple masthead, so the field itself is a white surface.
 */
const props = withDefaults(
  defineProps<{ modelValue: string; placeholder?: string }>(),
  { placeholder: 'Search documents, links and pages…' },
)
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const input = ref<HTMLInputElement | null>(null)

function clear() {
  emit('update:modelValue', '')
  input.value?.focus()
}
</script>

<template>
  <div role="search" class="relative w-full max-w-[640px]">
    <label for="hub-search" class="sr-only">Search resources</label>
    <span
      class="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] pointer-events-none"
      aria-hidden="true"
    >
      <UiIcon name="search" :size="22" :stroke="2" />
    </span>
    <input
      id="hub-search"
      ref="input"
      :value="modelValue"
      type="search"
      enterkeyhint="search"
      autocomplete="off"
      :placeholder="placeholder"
      class="w-full h-[58px] pl-[3.25rem] pr-[3.25rem] bg-[var(--surface-card)] text-[var(--text-strong)] text-[length:var(--text-md)] rounded-[var(--radius-pill)] border-2 border-transparent shadow-[var(--shadow-lg)] placeholder:text-[var(--text-subtle)] focus:outline-none focus-visible:border-[var(--border-focus)] [&::-webkit-search-cancel-button]:appearance-none"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button
      v-show="modelValue"
      type="button"
      aria-label="Clear search"
      class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center rounded-full border-none bg-[var(--surface-sunken)] text-[var(--text-muted)] cursor-pointer transition-colors duration-150 hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
      @click="clear"
    >
      <UiIcon name="x" :size="18" :stroke="2.2" />
    </button>
  </div>
</template>
