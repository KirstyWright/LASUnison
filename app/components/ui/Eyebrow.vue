<script setup lang="ts">
withDefaults(
  defineProps<{ color?: string }>(),
  { color: 'var(--brand-secondary)' },
)
</script>

<template>
  <span
    class="font-[family-name:var(--font-sans)] text-[0.875rem] font-bold tracking-[0.08em] uppercase"
    :style="{ color }"
  >
    <slot />
  </span>
</template>
