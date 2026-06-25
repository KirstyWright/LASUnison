<script setup lang="ts">
/**
 * UiPhoto — branded image placeholder. Reads as an intentional CMS
 * image slot (no real photography in this prototype), not a broken image.
 */
type Tone = 'purple' | 'green' | 'blue' | 'ink'

const props = withDefaults(
  defineProps<{ ratio?: string; label?: string; tone?: Tone; icon?: string }>(),
  { ratio: '16/9', label: 'Image', tone: 'purple', icon: 'image' },
)

const TONES: Record<Tone, { bg: string; fg: string }> = {
  purple: { bg: 'var(--purple-100)', fg: 'var(--purple-400)' },
  green: { bg: 'var(--green-100)', fg: 'var(--green-500)' },
  blue: { bg: 'var(--blue-100)', fg: 'var(--blue-500)' },
  ink: { bg: 'var(--ink-100)', fg: 'var(--ink-400)' },
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
    class="flex flex-col items-center justify-center gap-2 relative overflow-hidden"
    :style="wrapStyle"
  >
    <slot>
      <UiIcon :name="icon" :size="30" :stroke="1.6" />
      <span
        v-if="label"
        class="font-[family-name:var(--font-sans)] text-[12px] font-bold tracking-[0.06em] uppercase"
      >{{ label }}</span>
    </slot>
  </div>
</template>
