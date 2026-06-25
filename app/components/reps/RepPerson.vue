<script setup lang="ts">
// Compact person row for a rep — a rep here is just a name (+ an optional short
// note like "GMB" or "covering, not elected"), so a full card would be mostly
// empty chrome. Used for both station-level reps and, via `senior`, the
// elevated sector senior reps.
const props = defineProps<{
  name: string
  note?: string
  // Sector senior reps get a stronger treatment (solid avatar, display-font
  // name) to mark them as the elevated tier above station-level reps.
  senior?: boolean
}>()

// Up to two initials from the name. Strip parenthetical nicknames first so
// "Malgorzata (Gosha) Graf" → "MG", not "M(".
const initials = computed(() =>
  props.name
    .replace(/\([^)]*\)/g, ' ')
    .split(/\s+/)
    .map(word => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <div class="flex items-center gap-3 min-w-0">
    <div
      class="flex-none rounded-full grid place-items-center font-[family-name:var(--font-display)] font-black leading-none"
      :class="senior
        ? 'w-10 h-10 bg-[var(--brand-primary)] text-white text-[0.875rem]'
        : 'w-9 h-9 bg-[var(--brand-primary-soft)] text-[var(--brand-primary-strong)] text-[0.8125rem]'"
      aria-hidden="true"
    >
      {{ initials }}
    </div>
    <div class="min-w-0">
      <p
        class="m-0 truncate text-[var(--text-strong)]"
        :class="senior
          ? 'font-[family-name:var(--font-display)] font-extrabold text-[1.0625rem] leading-[1.2] tracking-[-0.01em]'
          : 'font-bold text-[0.9375rem] leading-[1.25]'"
        :title="name"
      >
        {{ name }}
      </p>
      <p
        v-if="note"
        class="text-[0.75rem] text-[var(--text-subtle)] m-0 mt-0.5 leading-[1.3] truncate"
        :title="note"
      >
        {{ note }}
      </p>
    </div>
  </div>
</template>
