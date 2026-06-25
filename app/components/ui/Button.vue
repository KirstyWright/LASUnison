<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'accent' | 'emergency' | 'highlight' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    fullWidth?: boolean
    iconLeft?: string
    iconRight?: string
    href?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'md', fullWidth: false, type: 'button' },
)

const BASE =
  'group inline-flex items-center justify-center gap-2 font-[family-name:var(--font-sans)] font-bold leading-none rounded-full border-2 cursor-pointer whitespace-nowrap no-underline transition-colors duration-150 ease-out active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]'

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.875rem]',
  md: 'h-11 px-6 text-[1rem]',
  lg: 'h-[54px] px-8 text-[1.125rem]',
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-[var(--brand-primary)] text-white border-transparent hover:bg-[var(--brand-primary-strong)]',
  secondary: 'bg-[var(--brand-secondary)] text-white border-transparent hover:bg-[var(--green-700)]',
  accent: 'bg-[var(--brand-accent)] text-white border-transparent hover:bg-[var(--blue-700)]',
  emergency: 'bg-[var(--emergency)] text-white border-transparent hover:bg-[var(--red-700)]',
  highlight: 'bg-[var(--brand-highlight)] text-[var(--ink-900)] border-transparent hover:bg-[var(--spark-600)]',
  outline: 'bg-transparent text-[var(--brand-primary)] border-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary-strong)]',
  ghost: 'bg-transparent text-[var(--brand-primary)] border-transparent hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary-strong)]',
}

const IC = 'inline-flex w-[1.15em] h-[1.15em] [&>svg]:w-full [&>svg]:h-full'

const classes = computed(() => [
  BASE,
  SIZES[props.size],
  VARIANTS[props.variant],
  props.fullWidth ? 'w-full' : '',
])

// Internal paths ("/branch", "/#join") navigate client-side via NuxtLink; external
// URLs, pure "#anchor" links, and tel:/mailto: stay plain anchors. No href → button.
const NuxtLink = resolveComponent('NuxtLink')
const isInternal = (h?: string): boolean => !!h && h.startsWith('/') && !h.startsWith('//')
const tag = computed(() => (props.href ? (isInternal(props.href) ? NuxtLink : 'a') : 'button'))
const linkProps = computed<Record<string, unknown>>(() =>
  !props.href
    ? { type: props.type }
    : isInternal(props.href)
      ? { to: props.href }
      : { href: props.href },
)
</script>

<template>
  <component
    :is="tag"
    v-bind="linkProps"
    :class="classes"
  >
    <span v-if="iconLeft" :class="IC" aria-hidden="true"><UiIcon :name="iconLeft" /></span>
    <span v-if="$slots.default"><slot /></span>
    <span v-if="iconRight" :class="IC" aria-hidden="true"><UiIcon :name="iconRight" /></span>
  </component>
</template>
