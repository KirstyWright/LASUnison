<script setup lang="ts">
/**
 * UiPhoto — branded image placeholder. Reads as an intentional CMS
 * image slot (no real photography in this prototype), not a broken image.
 */
type Tone = 'purple' | 'green' | 'blue' | 'ink'

const props = withDefaults(
  defineProps<{ ratio?: string, label?: string, tone?: Tone, icon?: string }>(),
  { ratio: '16/9', label: 'Image', tone: 'purple', icon: 'image' },
)

const TONES: Record<Tone, { bg: string, fg: string }> = {
  purple: { bg: 'var(--brand-primary-soft)', fg: 'var(--purple-400)' },
  green: { bg: 'var(--brand-secondary-soft)', fg: 'var(--green-500)' },
  blue: { bg: 'var(--brand-accent-soft)', fg: 'var(--blue-500)' },
  ink: { bg: 'var(--surface-sunken)', fg: 'var(--ink-400)' },
}

const t = computed(() => TONES[props.tone])
const wrapStyle = computed(() => ({
  aspectRatio: props.ratio,
  background: t.value.bg,
  color: t.value.fg,
}))
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-center gap-2 overflow-hidden"
    :style="wrapStyle"
  >
    <slot>
      <UiIcon
        :name="icon"
        :size="30"
        :stroke="1.6"
      />
      <span
        v-if="label"
        class="font-[family-name:var(--font-sans)] text-[length:var(--text-xs)] font-bold tracking-[0.06em] uppercase"
      >{{ label }}</span>
    </slot>
  </div>
</template>
