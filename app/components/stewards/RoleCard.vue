<script setup lang="ts">
/**
 * StewardsRoleCard — a rep-role tile for the Stewards' zone. Richer than
 * ResourcesQuickLink: a prominent icon chip, the role name, a sentence on what
 * the role does, and a labelled "learn more" action at the foot. The whole card
 * is the link (internal paths route in-app; external open in a new tab).
 */
import type { RepRole } from '~/data/stewards'

const NuxtLink = resolveComponent('NuxtLink')

const props = defineProps<{ role: RepRole }>()

const isInternal = computed(() => props.role.url.startsWith('/'))
</script>

<template>
  <component
    :is="isInternal ? NuxtLink : 'a'"
    :to="isInternal ? role.url : undefined"
    :href="isInternal ? undefined : role.url"
    :target="isInternal ? undefined : '_blank'"
    :rel="isInternal ? undefined : 'noopener noreferrer'"
    class="group flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:translate-y-[-3px] hover:border-[var(--border-default)] hover:shadow-[var(--shadow-lg)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
  >
    <span
      class="mb-4 inline-flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary-strong)]"
      aria-hidden="true"
    >
      <UiIcon
        :name="role.icon ?? 'briefcase'"
        :size="24"
        :stroke="1.9"
      />
    </span>

    <span
      class="block font-[family-name:var(--font-display)] text-[1.25rem] leading-tight font-extrabold tracking-[-0.01em] text-[var(--text-strong)]"
    >{{ role.label }}</span>

    <span
      v-if="role.note"
      class="mt-2 block text-[length:var(--text-sm)] leading-[1.55] text-[var(--text-muted)]"
    >{{ role.note }}</span>

    <span
      class="mt-4 inline-flex items-center gap-1.5 border-t border-[var(--border-subtle)] pt-3 text-[0.875rem] font-bold text-[var(--text-link)] group-hover:text-[var(--brand-primary-strong)]"
    >
      {{ role.cta ?? 'Learn more' }}
      <UiIcon
        :name="isInternal ? 'arrowRight' : 'arrowUpRight'"
        :size="16"
        :stroke="2"
        class="transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </span>
    <span
      v-if="!isInternal"
      class="sr-only"
    > (opens in a new tab)</span>
  </component>
</template>
