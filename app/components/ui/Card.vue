<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    accent?: string
    topStrip?: boolean
    interactive?: boolean
    href?: string
  }>(),
  { topStrip: false, interactive: false },
)

const BASE =
  'group flex flex-col bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-sm)] text-[var(--text-body)] transition duration-200 ease-out'
const INTERACTIVE =
  'cursor-pointer no-underline hover:shadow-[var(--shadow-lg)] hover:-translate-y-[3px] hover:border-[var(--border-default)]'

const isInteractive = computed(() => props.interactive || !!props.href)
const stripColor = computed(() => (props.accent ? `bg-[var(--${props.accent})]` : 'bg-[var(--brand-primary)]'))
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href"
    :class="[BASE, isInteractive && INTERACTIVE]"
  >
    <div v-if="topStrip" class="h-1.5" :class="stripColor" aria-hidden="true" />
    <div
      v-if="$slots.media"
      class="relative aspect-video bg-[var(--surface-sunken)] overflow-hidden [&>img]:w-full [&>img]:h-full [&>img]:object-cover"
    >
      <slot name="media" />
    </div>
    <div class="p-5 pb-6 flex flex-col gap-2 flex-1">
      <span
        v-if="eyebrow"
        class="text-[0.875rem] font-bold tracking-[0.08em] uppercase text-[var(--brand-secondary)]"
      >{{ eyebrow }}</span>
      <h3
        v-if="title"
        class="font-[family-name:var(--font-display)] font-extrabold text-[1.5rem] leading-[1.25] tracking-[-0.015em] text-[var(--text-strong)] m-0"
        :class="isInteractive && 'group-hover:text-[var(--brand-primary)]'"
      >{{ title }}</h3>
      <span v-if="$slots.meta" class="text-[0.875rem] text-[var(--text-subtle)]"><slot name="meta" /></span>
      <div v-if="$slots.default" class="text-[1rem] text-[var(--text-muted)]"><slot /></div>
      <div v-if="$slots.footer" class="mt-auto pt-3 flex items-center gap-3"><slot name="footer" /></div>
    </div>
  </component>
</template>
