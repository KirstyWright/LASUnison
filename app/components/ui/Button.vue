<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'accent' | 'emergency' | 'highlight' | 'outline' | 'outline-invert' | 'ghost'
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

const BASE
  = 'group inline-flex items-center justify-center gap-2 font-[family-name:var(--font-sans)] font-bold leading-none rounded-full border-2 cursor-pointer whitespace-nowrap no-underline transition-colors duration-150 ease-out active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]'

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.875rem]',
  md: 'h-11 px-6 text-[1rem]',
  lg: 'h-[54px] px-8 text-[1.125rem]',
}

// The button surface — background, border and hover background. Kept separate from
// the text colour (TEXT, below) so the colour can also be painted on the inner
// label/icon spans.
const SURFACE: Record<Variant, string> = {
  'primary': 'bg-[var(--brand-primary)] border-transparent hover:bg-[var(--brand-primary-strong)]',
  'secondary': 'bg-[var(--brand-secondary)] border-transparent hover:bg-[var(--brand-secondary-strong)]',
  'accent': 'bg-[var(--brand-accent)] border-transparent hover:bg-[var(--brand-accent-strong)]',
  'emergency': 'bg-[var(--emergency)] border-transparent hover:bg-[var(--red-700)]',
  'highlight': 'bg-[var(--brand-highlight)] border-transparent hover:bg-[var(--brand-highlight-strong)]',
  'outline': 'bg-transparent border-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)]',
  'outline-invert': 'bg-transparent border-white/40 hover:bg-white/10',
  'ghost': 'bg-transparent border-transparent hover:bg-[var(--brand-primary-soft)]',
}

// Text colour, applied to the root AND the inner label/icon spans. When a button
// renders inside prose, the `.las-prose .las-embed a` reset (main.css) forces the
// anchor's colour to inherit the ink body colour — which would turn a primary
// button's label dark-on-purple. Colouring the child spans (which no prose rule
// targets) keeps the label correct. Hover uses `group-hover:` so it works whether
// the rule lands on the root (which is the `group`) or on a span inside it.
const TEXT: Record<Variant, string> = {
  'primary': 'text-white',
  'secondary': 'text-white',
  'accent': 'text-white',
  'emergency': 'text-white',
  'highlight': 'text-[var(--text-strong)]',
  'outline': 'text-[var(--brand-primary)] group-hover:text-[var(--brand-primary-strong)]',
  'outline-invert': 'text-white',
  'ghost': 'text-[var(--brand-primary)] group-hover:text-[var(--brand-primary-strong)]',
}

const IC = 'inline-flex w-[1.15em] h-[1.15em] [&>svg]:w-full [&>svg]:h-full'

const textClasses = computed(() => TEXT[props.variant])

const classes = computed(() => [
  BASE,
  SIZES[props.size],
  SURFACE[props.variant],
  textClasses.value,
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
    <span
      v-if="iconLeft"
      :class="[IC, textClasses]"
      aria-hidden="true"
    ><UiIcon :name="iconLeft" /></span>
    <span
      v-if="$slots.default"
      :class="textClasses"
    ><slot /></span>
    <span
      v-if="iconRight"
      :class="[IC, textClasses]"
      aria-hidden="true"
    ><UiIcon :name="iconRight" /></span>
  </component>
</template>
