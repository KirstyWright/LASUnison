<script setup lang="ts">
// The empty counterpart to RepPerson: same row footprint so a filled and a
// vacant slot line up in the workplace/H&S grid. Kept deliberately quiet — a
// vacancy must never out-shout a real rep — but it doubles as a gentle
// recruitment nudge (joining/standing as a rep is a branch priority). The
// branch contact route also lives in the help banner above the list.
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="flex items-center gap-3 min-w-0">
    <div
      class="w-9 h-9 flex-none rounded-full grid place-items-center border border-dashed border-[var(--border-default)] text-[var(--text-subtle)]"
      aria-hidden="true"
    >
      <UiIcon name="userPlus" :size="15" :stroke="1.8" />
    </div>
    <div class="min-w-0">
      <p class="font-bold text-[0.9375rem] leading-[1.25] text-[var(--text-muted)] m-0">
        {{ label ?? 'Position vacant' }}
      </p>
      <a
        href="mailto:branch@lasunison.com"
        class="min-h-[2.75rem] inline-flex items-center gap-1 text-[0.75rem] font-semibold text-[var(--brand-primary)] no-underline hover:underline leading-[1.3] mt-0.5"
      >
        Could this be you?
        <UiIcon name="arrowRight" :size="12" :stroke="2.2" class="flex-none" />
      </a>
    </div>
  </div>
</template>
