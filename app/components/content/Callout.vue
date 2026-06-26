<script setup lang="ts">
/**
 * Callout — a small accent CTA card for content (`::callout{...}`). An icon chip,
 * a title, a short body (default slot, Markdown) and one or two action links.
 * The actions are built natively (not UiButton) so the prose link reset can't
 * recolour their labels — each label sits in a child <span>. Rooted in .las-embed.
 */
type Tone = 'primary' | 'secondary' | 'accent'

const props = withDefaults(
  defineProps<{
    title?: string
    icon?: string
    href?: string
    cta?: string
    href2?: string
    cta2?: string
    tone?: Tone
  }>(),
  { icon: 'arrowRight', tone: 'primary' },
)

const NuxtLink = resolveComponent('NuxtLink')
const isInternal = (h?: string) => !!h && h.startsWith('/')
const isMail = (h?: string) => !!h && h.startsWith('mailto:')

// Internal paths route via NuxtLink; mailto: stays a plain anchor; external URLs
// open in a new tab. Returns the bindings (incl. `is`) for <component>.
function bind(h?: string) {
  if (isInternal(h)) return { is: NuxtLink, to: h }
  if (isMail(h)) return { is: 'a', href: h }
  return { is: 'a', href: h, target: '_blank', rel: 'noopener noreferrer' }
}

const TONES: Record<Tone, { card: string; chip: string }> = {
  primary: { card: 'bg-[var(--surface-brand-soft)]', chip: 'bg-[var(--brand-primary)] text-white' },
  secondary: { card: 'bg-[var(--brand-secondary-soft)]', chip: 'bg-[var(--brand-secondary)] text-white' },
  accent: { card: 'bg-[var(--brand-accent-soft)]', chip: 'bg-[var(--brand-accent)] text-white' },
}
</script>

<template>
  <div
    class="las-embed flex flex-col gap-3 border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6"
    :class="TONES[tone].card"
  >
    <div class="flex items-center gap-3">
      <span
        class="flex-none w-10 h-10 inline-flex items-center justify-center rounded-[var(--radius-md)]"
        :class="TONES[tone].chip"
        aria-hidden="true"
      >
        <UiIcon :name="icon" :size="20" :stroke="1.9" />
      </span>
      <div
        v-if="title"
        class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-[var(--text-strong)] leading-tight"
      >{{ title }}</div>
    </div>

    <div class="text-[var(--text-body)] leading-[1.6]">
      <slot />
    </div>

    <div v-if="cta || cta2" class="flex flex-wrap gap-3 mt-1">
      <component
        :is="bind(href).is"
        v-if="cta"
        v-bind="bind(href)"
        class="group inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-primary-strong)]"
      >
        <span class="font-[family-name:var(--font-sans)] font-bold text-[0.9375rem] text-white">{{ cta }}</span>
        <UiIcon name="arrowRight" :size="17" :stroke="2.2" class="text-white transition-transform group-hover:translate-x-0.5" />
      </component>

      <component
        :is="bind(href2).is"
        v-if="cta2"
        v-bind="bind(href2)"
        class="group inline-flex items-center gap-2 h-11 px-5 rounded-full bg-transparent border-2 border-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-primary-soft)]"
      >
        <span class="font-[family-name:var(--font-sans)] font-bold text-[0.9375rem] text-[var(--brand-primary)]">{{ cta2 }}</span>
      </component>
    </div>
  </div>
</template>
