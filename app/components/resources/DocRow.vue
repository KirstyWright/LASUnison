<script setup lang="ts">
/**
 * ResourcesDocRow — a single document in the library / search results.
 * Topic drives the glyph colour; the file opens in a new tab. Title, topic,
 * file type and (mono) date are all surfaced for fast scanning.
 */
import type { SiteDocument } from '~/utils/resources'

const props = defineProps<{ doc: SiteDocument }>()
const meta = computed(() => docTopicMeta(props.doc.topic))
const external = computed(() => /^https?:\/\//.test(props.doc.file))
</script>

<template>
  <a
    :href="doc.file"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex items-center gap-3.5 px-3 py-3 sm:px-4 rounded-[var(--radius-lg)] border border-transparent no-underline transition-[background-color,border-color] duration-150 hover:bg-[var(--surface-card)] hover:border-[var(--border-subtle)] hover:shadow-[var(--shadow-sm)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
  >
    <!-- Topic glyph -->
    <span
      class="flex-none inline-flex items-center justify-center w-11 h-11 rounded-[var(--radius-md)]"
      :style="{ backgroundColor: meta.soft, color: meta.accent }"
      aria-hidden="true"
    >
      <UiIcon :name="meta.icon" :size="22" :stroke="1.9" />
    </span>

    <span class="flex-1 min-w-0">
      <span class="block font-semibold text-[length:var(--text-base)] text-[var(--text-strong)] leading-snug group-hover:text-[var(--brand-primary)] line-clamp-2">
        {{ doc.title }}
      </span>
      <span class="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[0.8125rem] text-[var(--text-muted)]">
        <span class="font-semibold" :style="{ color: meta.accent }">{{ doc.topic }}</span>
        <span class="text-[var(--border-strong)]" aria-hidden="true">·</span>
        <span>{{ doc.type }}</span>
        <span class="text-[var(--border-strong)]" aria-hidden="true">·</span>
        <time :datetime="doc.date" class="font-[family-name:var(--font-mono)] text-[0.75rem] tabular-nums">{{ formatDocDate(doc.date) }}</time>
      </span>
    </span>

    <!-- Open / download affordance -->
    <span
      class="flex-none inline-flex items-center justify-center w-9 h-9 rounded-full text-[var(--text-subtle)] transition-colors duration-150 group-hover:bg-[var(--brand-primary-soft)] group-hover:text-[var(--brand-primary)]"
      aria-hidden="true"
    >
      <UiIcon :name="external ? 'arrowUpRight' : 'download'" :size="18" :stroke="2" />
    </span>
    <span class="sr-only">({{ doc.type }}, opens in a new tab)</span>
  </a>
</template>
