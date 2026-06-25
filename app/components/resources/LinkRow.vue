<script setup lang="ts">
/**
 * ResourcesLinkRow — a compact reference-link row (sister branches, NHS
 * bodies …). Label on the left with an external marker; host in mono.
 */
import type { SiteLink } from '~/data/links'

defineProps<{ link: SiteLink }>()
</script>

<template>
  <a
    :href="link.url"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex items-center justify-between gap-3 px-3 py-2.5 -mx-3 rounded-[var(--radius-md)] no-underline transition-colors duration-150 hover:bg-[var(--surface-sunken)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
  >
    <span class="min-w-0">
      <span class="flex items-center gap-1.5 font-semibold text-[length:var(--text-sm)] text-[var(--text-body)] group-hover:text-[var(--brand-primary)]">
        <span class="truncate">{{ link.label }}</span>
        <UiIcon
          name="arrowUpRight"
          :size="15"
          :stroke="2"
          class="flex-none text-[var(--text-subtle)] group-hover:text-[var(--brand-primary)] transition-colors duration-150"
        />
      </span>
      <span class="block font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--text-subtle)] truncate mt-0.5">
        {{ hostLabel(link.url) }}
      </span>
    </span>
    <span class="sr-only">(opens in a new tab)</span>
  </a>
</template>
