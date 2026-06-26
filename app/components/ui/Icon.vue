<script setup lang="ts">
/**
 * UiIcon — Lucide-style line icons, 24x24, ~2px stroke.
 * Ported from the LAS UNISON kit. Use a `name` from PATHS below.
 */
const PATHS: Record<string, string[]> = {
  menu: ['M3 6h18', 'M3 12h18', 'M3 18h18'],
  search: ['M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-4.3-4.3'],
  x: ['M18 6 6 18', 'M6 6l12 12'],
  phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L20 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'],
  arrowRight: ['M5 12h14', 'M13 5l7 7-7 7'],
  arrowLeft: ['M19 12H5', 'M11 5l-7 7 7 7'],
  arrowUpRight: ['M7 17 17 7', 'M7 7h10v10'],
  chevronDown: ['M6 9l6 6 6-6'],
  chevronRight: ['M9 6l6 6-6 6'],
  calendar: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'],
  file: ['M14 3v4a1 1 0 0 0 1 1h4', 'M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z'],
  shield: ['M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z'],
  heart: ['M19 5c-1.5-1.5-4-1.5-5.5 0L12 6.5 10.5 5C9 3.5 6.5 3.5 5 5s-1.5 4 0 5.5l7 7 7-7c1.5-1.5 1.5-4 0-5.5z'],
  users: ['M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 9m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', 'M22 19v-2a4 4 0 0 0-3-3.85', 'M16 5.13A4 4 0 0 1 16 13'],
  alert: ['M12 9v4', 'M12 17h.01', 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'],
  check: ['M20 6 9 17l-5-5'],
  clock: ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 7v5l3 2'],
  mapPin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', 'M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'],
  mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M22 7l-10 6L2 7'],
  image: ['M3 5h18v14H3z', 'M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', 'M21 16l-5-5L5 21'],
  scale: ['M12 3v18', 'M5 7h14', 'M5 7 2 14h6L5 7z', 'M19 7l-3 7h6l-3-7z', 'M8 21h8'],
  bookOpen: ['M12 7v14', 'M3 18a9 9 0 0 1 9-2 9 9 0 0 1 9 2V5a9 9 0 0 0-9-2 9 9 0 0 0-9 2z'],
  megaphone: ['M3 11v2a1 1 0 0 0 1 1h2l9 5V5l-9 5H4a1 1 0 0 0-1 1z', 'M18 8a4 4 0 0 1 0 8'],
  facebook: ['M16 4h-2.5A3.5 3.5 0 0 0 10 7.5V10H8v3h2v7h3v-7h2.5l.5-3H13V7.5a.5.5 0 0 1 .5-.5H16z'],
  youtube: ['M22 8.2a3 3 0 0 0-2-2C18 5.7 12 5.7 12 5.7s-6 0-8 .5a3 3 0 0 0-2 2A31 31 0 0 0 1.7 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2 2c2 .5 8 .5 8 .5s6 0 8-.5a3 3 0 0 0 2-2A31 31 0 0 0 22.3 12 31 31 0 0 0 22 8.2z', 'M10 15l5-3-5-3z'],
  instagram: ['M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z', 'M12 12m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0', 'M17.5 6.5h.01'],
  download: ['M12 3v12', 'M7 11l5 5 5-5', 'M5 21h14'],
  briefcase: ['M4 7h16a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1z', 'M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M3 13h18'],
  banknote: ['M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z', 'M12 12m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0', 'M6 12h.01', 'M18 12h.01'],
  lifebuoy: ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 12m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0', 'M4.9 4.9l4.6 4.6', 'M14.5 14.5l4.6 4.6', 'M14.5 9.5l4.6-4.6', 'M4.9 19.1l4.6-4.6'],
  graduationCap: ['M22 10 12 5 2 10l10 5 10-5z', 'M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5', 'M22 10v6'],
  gift: ['M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8', 'M3 7h18v5H3z', 'M12 21V7', 'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z', 'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z'],
  ticket: ['M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1 0 4H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z', 'M14 6v2', 'M14 12v2', 'M14 16v2'],
  ribbon: ['M12 11m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M9.5 16 6.5 22l5.5-2.2L17.5 22l-3-6'],
  award: ['M12 9m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M15.5 13.5 17 22l-5-3-5 3 1.5-8.5'],
  userPlus: ['M15 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M8.5 9m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', 'M19 8v6', 'M22 11h-6'],
  building: ['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18', 'M2 22h20', 'M9 6h.01', 'M14 6h.01', 'M9 10h.01', 'M14 10h.01', 'M9 14h.01', 'M14 14h.01', 'M10 22v-4h4v4'],
  flag: ['M4 21V4', 'M4 4h13l-2 4 2 4H4'],
  handshake: ['M11 17 9.5 18.5a1.5 1.5 0 0 1-2.1-2.1L9 14.8', 'M13.5 18.5l1 1a1.5 1.5 0 0 0 2.1-2.1L13 13.5', 'M3 11l3.5-3.5 4.5 4.5', 'M21 12.5l-3.5 3.5-6-6 2.2-2.2a2 2 0 0 1 2.8 0z'],
}

const props = withDefaults(
  defineProps<{ name: string; size?: number; stroke?: number }>(),
  { size: 24, stroke: 2 },
)

const paths = computed(() => PATHS[props.name] ?? [])
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      v-for="(d, i) in paths"
      :key="i"
      :d="d"
      stroke="currentColor"
      :stroke-width="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
