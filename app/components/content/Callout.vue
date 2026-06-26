<script setup lang="ts">
/**
 * Callout — a small accent CTA card for content (`::callout{...}`). An icon chip,
 * a title, a short body (default slot, Markdown) and one or two action links.
 * The actions are built natively (not UiButton) so the prose link reset can't
 * recolour their labels — each label sits in a child <span>. Rooted in .las-embed.
 */
type Tone = 'primary' | 'secondary' | 'accent'

withDefaults(
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

// UiButton resolves internal paths to NuxtLink and external URLs to <a>; we only
// need to flag genuinely external links (not internal, not mailto:) so they open
// in a new tab.
const isInternal = (h?: string) => !!h && h.startsWith('/')
const isMail = (h?: string) => !!h && h.startsWith('mailto:')
const isExternal = (h?: string) => !!h && !isInternal(h) && !isMail(h)
const extAttrs = (h?: string) =>
  isExternal(h) ? { target: '_blank', rel: 'noopener noreferrer' } : {}

const TONES: Record<Tone, { card: string, chip: string }> = {
  primary: { card: 'bg-[var(--surface-brand-soft)]', chip: 'bg-[var(--brand-primary)] text-white' },
  secondary: { card: 'bg-[var(--brand-secondary-soft)]', chip: 'bg-[var(--brand-secondary)] text-white' },
  accent: { card: 'bg-[var(--brand-accent-soft)]', chip: 'bg-[var(--brand-accent)] text-white' },
}
</script>

<template>
  <div
    class="las-embed flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] p-6"
    :class="TONES[tone].card"
  >
    <div class="flex items-center gap-3">
      <span
        class="inline-flex size-10 flex-none items-center justify-center rounded-[var(--radius-md)]"
        :class="TONES[tone].chip"
        aria-hidden="true"
      >
        <UiIcon
          :name="icon"
          :size="20"
          :stroke="1.9"
        />
      </span>
      <div
        v-if="title"
        class="font-[family-name:var(--font-display)] text-[length:var(--text-lg)] leading-tight font-extrabold text-[var(--text-strong)]"
      >
        {{ title }}
      </div>
    </div>

    <div class="leading-[1.6] text-[var(--text-body)]">
      <slot />
    </div>

    <div
      v-if="cta || cta2"
      class="mt-1 flex flex-wrap gap-3"
    >
      <UiButton
        v-if="cta"
        :href="href"
        variant="primary"
        size="md"
        icon-right="arrowRight"
        v-bind="extAttrs(href)"
      >
        {{ cta }}
      </UiButton>

      <UiButton
        v-if="cta2"
        :href="href2"
        variant="outline"
        size="md"
        v-bind="extAttrs(href2)"
      >
        {{ cta2 }}
      </UiButton>
    </div>
  </div>
</template>
