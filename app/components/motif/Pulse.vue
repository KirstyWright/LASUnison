<script setup lang="ts">
/**
 * MotifPulse — "Pulse, refined". The branch's edge motif: a faint ECG graph-paper
 * grid and a crafted PQRST heartbeat trace tiled in `currentColor`, fading in from
 * the left so it never reads as a hard repeat. Set the host wrapper's text colour
 * and pin it to the bottom edge. Static and calm by design. Decorative.
 *
 *  - `grid` — the clinical graph-paper backing (default on; turn off for the bare trace)
 */
withDefaults(defineProps<{ grid?: boolean }>(), { grid: true })
</script>

<template>
  <div
    class="pulse"
    aria-hidden="true"
  >
    <div
      v-if="grid"
      class="pulse__grid"
    />
    <div class="pulse__trace" />
  </div>
</template>

<style scoped>
.pulse {
  position: relative;
  width: 100%;
  height: 5rem;
  overflow: hidden;
}

/* ECG graph-paper grid — clinical authority, fading upward off the baseline */
.pulse__grid {
  position: absolute;
  inset: 0;
  opacity: 0.14;
  background-image:
    repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 8px),
    repeating-linear-gradient(0deg, currentColor 0 1px, transparent 1px 8px);
  -webkit-mask: linear-gradient(0deg, #000, transparent 92%);
          mask: linear-gradient(0deg, #000, transparent 92%);
}

/* The trace: currentColor filled, shaped by the ECG mask, faded in from the left */
.pulse__trace {
  position: absolute;
  inset: 0;
  background-color: currentColor;
  -webkit-mask:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='80'%3E%3Cpath d='M0 50 H64 C72 50 76 41 84 41 C92 41 96 50 104 50 H120 L126 56 L132 16 L138 64 L144 50 H170 C180 50 184 39 196 39 C208 39 212 50 222 50 H280' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") left bottom/280px 80px repeat-x,
    linear-gradient(90deg, transparent, #000 14%) no-repeat;
  -webkit-mask-composite: source-in;
  mask:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='80'%3E%3Cpath d='M0 50 H64 C72 50 76 41 84 41 C92 41 96 50 104 50 H120 L126 56 L132 16 L138 64 L144 50 H170 C180 50 184 39 196 39 C208 39 212 50 222 50 H280' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") left bottom/280px 80px repeat-x,
    linear-gradient(90deg, transparent, #000 14%) no-repeat;
  mask-composite: intersect;
}
</style>
