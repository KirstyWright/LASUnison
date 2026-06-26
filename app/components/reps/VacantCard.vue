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
  <div class="flex min-w-0 items-center gap-3">
    <div
      class="grid size-9 flex-none place-items-center rounded-full border border-dashed border-[var(--border-default)] text-[var(--text-subtle)]"
      aria-hidden="true"
    >
      <UiIcon
        name="userPlus"
        :size="15"
        :stroke="1.8"
      />
    </div>
    <div class="min-w-0">
      <p class="m-0 text-[0.9375rem] leading-[1.25] font-bold text-[var(--text-muted)]">
        {{ label ?? 'Position vacant' }}
      </p>
      <a
        href="mailto:branch@lasunison.com"
        class="mt-0.5 inline-flex min-h-[2.75rem] items-center gap-1 text-[0.75rem] leading-[1.3] font-semibold text-[var(--brand-primary)] no-underline hover:underline"
      >
        Could this be you?
        <UiIcon
          name="arrowRight"
          :size="12"
          :stroke="2.2"
          class="flex-none"
        />
      </a>
    </div>
  </div>
</template>
