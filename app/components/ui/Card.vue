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

const BASE
  = 'group flex flex-col bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-sm)] text-[var(--text-body)] transition duration-150 ease-out'
const INTERACTIVE
  = 'cursor-pointer no-underline hover:shadow-[var(--shadow-lg)] hover:-translate-y-[3px] hover:border-[var(--border-default)] focus-visible:shadow-[var(--shadow-lg)] focus-visible:-translate-y-[3px] focus-visible:border-[var(--border-default)]'

const isInteractive = computed(() => props.interactive || !!props.href)
const stripColor = computed(() => (props.accent ? `bg-[var(--${props.accent})]` : 'bg-[var(--brand-primary)]'))
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href"
    :class="[BASE, isInteractive && INTERACTIVE]"
  >
    <div
      v-if="topStrip"
      class="h-[1.5px]"
      :class="stripColor"
      aria-hidden="true"
    />
    <div
      v-if="$slots.media"
      class="relative aspect-video overflow-hidden bg-[var(--surface-sunken)] [&>img]:size-full [&>img]:object-cover"
    >
      <slot name="media" />
    </div>
    <div class="flex flex-1 flex-col gap-2 p-5 pb-6">
      <span
        v-if="eyebrow"
        class="text-[0.875rem] font-bold tracking-[0.08em] text-[var(--brand-secondary)] uppercase"
      >{{ eyebrow }}</span>
      <h3
        v-if="title"
        class="m-0 font-[family-name:var(--font-display)] text-[1.5rem] leading-[1.25] font-extrabold tracking-[-0.015em] text-[var(--text-strong)]"
        :class="isInteractive && 'group-hover:text-[var(--brand-primary)]'"
      >
        {{ title }}
      </h3>
      <span
        v-if="$slots.meta"
        class="text-[0.875rem] text-[var(--text-subtle)]"
      ><slot name="meta" /></span>
      <div
        v-if="$slots.default"
        class="text-[1rem] text-[var(--text-muted)]"
      >
        <slot />
      </div>
      <div
        v-if="$slots.footer"
        class="mt-auto flex items-center gap-3 pt-3"
      >
        <slot name="footer" />
      </div>
    </div>
  </component>
</template>
