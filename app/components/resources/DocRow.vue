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
    class="group flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-transparent p-3 no-underline transition-[background-color,border-color] duration-150 hover:border-[var(--border-subtle)] hover:bg-[var(--surface-card)] hover:shadow-[var(--shadow-sm)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] sm:px-4"
  >
    <!-- Topic glyph -->
    <span
      class="inline-flex size-11 flex-none items-center justify-center rounded-[var(--radius-md)]"
      :style="{ backgroundColor: meta.soft, color: meta.accent }"
      aria-hidden="true"
    >
      <UiIcon
        :name="meta.icon"
        :size="22"
        :stroke="1.9"
      />
    </span>

    <span class="min-w-0 flex-1">
      <span class="line-clamp-2 block text-[length:var(--text-base)] leading-snug font-semibold text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">
        {{ doc.title }}
      </span>
      <span class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.8125rem] text-[var(--text-muted)]">
        <span
          class="font-semibold"
          :style="{ color: meta.accent }"
        >{{ doc.topic }}</span>
        <span
          class="text-[var(--border-strong)]"
          aria-hidden="true"
        >·</span>
        <span>{{ doc.type }}</span>
        <span
          class="text-[var(--border-strong)]"
          aria-hidden="true"
        >·</span>
        <time
          :datetime="doc.date"
          class="font-[family-name:var(--font-mono)] text-[0.75rem] tabular-nums"
        >{{ formatDocDate(doc.date) }}</time>
      </span>
    </span>

    <!-- Open / download affordance -->
    <span
      class="inline-flex size-9 flex-none items-center justify-center rounded-full text-[var(--text-subtle)] transition-colors duration-150 group-hover:bg-[var(--brand-primary-soft)] group-hover:text-[var(--brand-primary)]"
      aria-hidden="true"
    >
      <UiIcon
        :name="external ? 'arrowUpRight' : 'download'"
        :size="18"
        :stroke="2"
      />
    </span>
    <span class="sr-only">({{ doc.type }}, opens in a new tab)</span>
  </a>
</template>
