<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    intro?: string
    align?: 'left' | 'center'
    eyebrowColor?: string
  }>(),
  { align: 'left' },
)

const wrapStyle = computed(() => ({
  maxWidth: props.align === 'center' ? '720px' : 'none',
  marginInline: props.align === 'center' ? 'auto' : '0',
  textAlign: props.align,
}))
const introStyle = computed(() => ({
  maxWidth: '640px',
  marginInline: props.align === 'center' ? 'auto' : '0',
}))
</script>

<template>
  <div :style="wrapStyle">
    <div
      v-if="eyebrow"
      class="mb-2.5"
    >
      <UiEyebrow :color="eyebrowColor">
        {{ eyebrow }}
      </UiEyebrow>
    </div>
    <h2 class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-4xl)] leading-[1.12] font-extrabold tracking-[-0.015em] text-[var(--text-strong)]">
      {{ title }}
    </h2>
    <p
      v-if="intro"
      class="mt-3.5 mb-0 text-[length:var(--text-md)] text-[var(--text-muted)]"
      :style="introStyle"
    >
      {{ intro }}
    </p>
  </div>
</template>
