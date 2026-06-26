<script setup lang="ts">
const props = withDefaults(
  defineProps<{ kicker?: string, number?: string, hours?: string, flat?: boolean }>(),
  {
    kicker: 'UNISON Direct — get help now',
    number: '0800 0857 857',
    hours: 'Mon–Fri 06:00–midnight · Sat 09:00–16:00',
    flat: false,
  },
)

const WRAP
  = 'flex items-center gap-4 flex-wrap font-[family-name:var(--font-sans)] bg-[var(--emergency)] text-white p-4 px-6'

const tel = computed(() => `tel:${props.number.replace(/\s+/g, '')}`)
</script>

<template>
  <div :class="[WRAP, flat ? 'rounded-none' : 'rounded-[var(--radius-lg)]']">
    <span
      class="inline-flex size-[42px] flex-none items-center justify-center rounded-full bg-white/[0.16] [&>svg]:size-[22px]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M5 4h3l1.6 4-2 1.4a12 12 0 005 5l1.4-2 4 1.6V19a2 2 0 01-2 2A15 15 0 014 6a2 2 0 012-2z"
          stroke="#fff"
          stroke-width="1.8"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="flex flex-col leading-[1.1]">
      <span class="text-[0.875rem] font-bold tracking-[0.08em] uppercase opacity-90">{{ kicker }}</span>
      <a
        class="font-[family-name:var(--font-display)] text-[length:var(--text-3xl)] font-black tracking-[-0.015em] text-white no-underline hover:underline"
        :href="tel"
      >{{ number }}</a>
    </span>
    <span
      v-if="hours"
      class="ml-auto text-right text-[0.875rem] opacity-90"
    >{{ hours }}</span>
  </div>
</template>
