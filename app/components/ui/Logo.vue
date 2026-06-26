<script setup lang="ts">
/**
 * UiLogo — official UNISON brand lockup. `tone` adapts it to the surface:
 * `dark` (default) shows the full-colour logo on light surfaces (header);
 * `light` renders it knocked-out to white for dark surfaces (footer).
 */
import logoUrl from '~/assets/images/unison-logo.png'

withDefaults(defineProps<{ tone?: 'dark' | 'light' }>(), { tone: 'dark' })
</script>

<template>
  <div>
    <img
      :src="logoUrl"
      alt="LAS UNISON — London Ambulance Service"
      class="h-16 w-auto select-none"
      :class="tone === 'light' ? 'brightness-0 invert' : ''"
    >
  </div>
</template>
