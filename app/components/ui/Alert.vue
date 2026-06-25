<script setup lang="ts">
type Variant = 'info' | 'success' | 'warning' | 'danger' | 'emergency'

const props = withDefaults(
  defineProps<{ variant?: Variant; title?: string }>(),
  { variant: 'info' },
)

const WRAP =
  'flex gap-3 items-start font-[family-name:var(--font-sans)] rounded-[var(--radius-md)] p-4 px-5 border text-[var(--text-body)]'

const V: Record<Variant, { wrap: string; ac: string }> = {
  info: { wrap: 'bg-[var(--info-soft)] border-[var(--info)]', ac: 'text-[var(--info)]' },
  success: { wrap: 'bg-[var(--success-soft)] border-[var(--success)]', ac: 'text-[var(--success)]' },
  warning: { wrap: 'bg-[var(--warning-soft)] border-[var(--warning)]', ac: 'text-[var(--warning)]' },
  danger: { wrap: 'bg-[var(--danger-soft)] border-[var(--danger)]', ac: 'text-[var(--danger)]' },
  emergency: { wrap: 'bg-[var(--emergency)] border-[var(--emergency)] text-white', ac: 'text-white' },
}

// success uses a tick, everything else an exclamation
const ICONS: Record<Variant, { d: string; w: string }> = {
  info: { d: 'M12 8h.01M11 12h1v5h1', w: '2' },
  success: { d: 'M5 12.5l4.5 4.5L19 7.5', w: '2.2' },
  warning: { d: 'M12 8v5m0 4h.01', w: '2' },
  danger: { d: 'M12 8v5m0 4h.01', w: '2' },
  emergency: { d: 'M12 8v5m0 4h.01', w: '2' },
}

const v = computed(() => V[props.variant])
const isEmerg = computed(() => props.variant === 'emergency')
const role = computed(() => (props.variant === 'danger' || isEmerg.value ? 'alert' : 'status'))
const titleColor = computed(() => (isEmerg.value ? 'text-white' : 'text-[var(--text-strong)]'))
const bodyColor = computed(() => (isEmerg.value ? 'text-white' : 'text-[var(--text-muted)]'))
</script>

<template>
  <div :role="role" :class="[WRAP, v.wrap]">
    <span class="flex-none w-[22px] h-[22px] mt-px [&>svg]:w-full [&>svg]:h-full" :class="v.ac" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path
          :d="ICONS[variant].d"
          stroke="currentColor"
          :stroke-width="ICONS[variant].w"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
      </svg>
    </span>
    <div class="min-w-0">
      <p
        v-if="title"
        class="font-[family-name:var(--font-display)] font-bold text-[1.125rem] tracking-[-0.015em] m-0 mb-0.5"
        :class="titleColor"
      >{{ title }}</p>
      <div class="text-[0.9375rem] leading-[1.55] m-0" :class="bodyColor"><slot /></div>
    </div>
  </div>
</template>
