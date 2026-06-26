<script setup lang="ts">
/**
 * ResourcesQuickLink — a staff-tool / benefit tile (GRS, The Pulse, ESR …).
 * Rendered as a lift-on-hover card with an icon chip, a short note, and the
 * destination in mono. External URLs open in a new tab; site-relative paths
 * (`/news/…`) route in-app via NuxtLink.
 */
import type { SiteLink } from '~/data/links'

// Resolve the real component — binding :is to the string 'NuxtLink' renders an
// inert <nuxtlink> element rather than a working link.
const NuxtLink = resolveComponent('NuxtLink')

const props = defineProps<{ link: SiteLink, featured?: boolean }>()

/** Site-relative path → internal NuxtLink; otherwise an external anchor. */
const isInternal = computed(() => props.link.url.startsWith('/'))
</script>

<template>
  <component
    :is="isInternal ? NuxtLink : 'a'"
    :to="isInternal ? link.url : undefined"
    :href="isInternal ? undefined : link.url"
    :target="isInternal ? undefined : '_blank'"
    :rel="isInternal ? undefined : 'noopener noreferrer'"
    class="group relative flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:translate-y-[-3px] hover:border-[var(--border-default)] hover:shadow-[var(--shadow-lg)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
    :class="featured ? 'p-5' : 'p-4'"
  >
    <!-- Direction marker, top-right: ↗ external, → internal -->
    <span
      class="absolute top-3 right-3 text-[var(--text-subtle)] transition-colors duration-150 group-hover:text-[var(--brand-primary)]"
      aria-hidden="true"
    >
      <UiIcon
        :name="isInternal ? 'arrowRight' : 'arrowUpRight'"
        :size="18"
        :stroke="2"
      />
    </span>

    <span
      class="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary-strong)]"
      :class="featured ? 'w-12 h-12 mb-4' : 'w-10 h-10 mb-3'"
      aria-hidden="true"
    >
      <UiIcon
        :name="link.icon ?? 'arrowUpRight'"
        :size="featured ? 24 : 22"
        :stroke="1.9"
      />
    </span>

    <span
      class="block pr-6 font-[family-name:var(--font-display)] leading-tight font-extrabold tracking-[-0.01em] text-[var(--text-strong)]"
      :class="featured ? 'text-[1.25rem]' : 'text-[1.0625rem]'"
    >{{ link.label }}</span>

    <span
      v-if="link.note"
      class="mt-1 block text-[length:var(--text-sm)] leading-snug text-[var(--text-muted)]"
    >{{ link.note }}</span>

    <span
      class="mt-3 block truncate border-t border-[var(--border-subtle)] pt-3 font-[family-name:var(--font-mono)] text-[0.75rem] text-[var(--text-subtle)]"
    >{{ isInternal ? 'On this site' : hostLabel(link.url) }}</span>

    <span
      v-if="!isInternal"
      class="sr-only"
    > (opens in a new tab)</span>
  </component>
</template>
