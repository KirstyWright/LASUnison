<script setup lang="ts">
/**
 * StatBand — a horizontal band of headline figures for content (`::stat-band`).
 * Each item is a big Archivo-black figure over a small label: the "solidarity is
 * countable" stat signature from DESIGN.md, reusing the shared <UiStat>. Rooted
 * in .las-embed so the prose styles don't touch it. Pass `items` from the block's
 * frontmatter — `{ value, label, sub? }`.
 */
interface StatItem { value: string, label: string, sub?: string }

defineProps<{ items: StatItem[] }>()
</script>

<template>
  <div class="las-embed">
    <!-- gap-px over a border-tinted background paints hairline dividers between
         cells (vertical on ≥sm, horizontal when stacked). -->
    <div
      class="grid gap-px overflow-hidden rounded-[var(--radius-lg)] bg-[var(--border-subtle)] ring-1 ring-[var(--border-subtle)] sm:grid-cols-3"
    >
      <div
        v-for="s in items"
        :key="s.label"
        class="bg-[var(--surface-sunken)] px-6 py-7"
      >
        <UiStat
          :value="s.value"
          :label="s.label"
          :sub="s.sub"
          align="center"
          size="md"
        />
      </div>
    </div>
  </div>
</template>
