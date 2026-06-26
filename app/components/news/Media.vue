<script setup lang="ts">
/**
 * NewsMedia — the visual block for a news item, in one of two states:
 *  - real photo: when the post carries a featured `image`, show it (object-cover).
 *  - branded banner: otherwise, a "branch banner" placeholder — a deep brand
 *    gradient (tone-matched to the category), the LAS UNISON wordmark, the
 *    category label, an ECG-pulse motif and a faint category-icon watermark.
 *    It reads as an intentional masthead, not a missing image.
 *
 * Fills its container; the parent sets the aspect ratio. `large` bumps the
 * type/watermark for the featured card and the article hero.
 */
const props = withDefaults(
  defineProps<{
    image?: string
    category: string
    tone: PhotoTone
    icon: string
    /** Alt text for a real photo. Empty (default) = decorative, e.g. inside a card whose link already names the article. */
    alt?: string
    /** Load eagerly (above-the-fold hero / featured card). */
    eager?: boolean
    /** Larger wordmark + watermark for big media slots. */
    large?: boolean
  }>(),
  { alt: '', eager: false, large: false },
)

const bannerBg = computed(() => newsBannerBg(props.tone))
</script>

<template>
  <!-- Real featured image -->
  <img
    v-if="image"
    :src="image"
    :alt="alt"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : 'auto'"
    decoding="async"
    class="size-full object-cover"
  >

  <!-- Branded banner placeholder (decorative) -->
  <div
    v-else
    class="relative flex size-full flex-col items-center justify-center overflow-hidden text-center text-white"
    :style="{ background: bannerBg }"
    aria-hidden="true"
  >
    <!-- category-icon watermark, bleeding off the corner -->
    <UiIcon
      :name="icon"
      :size="large ? 220 : 150"
      :stroke="1.25"
      class="pointer-events-none absolute -right-7 -bottom-8 text-white opacity-[0.09]"
    />

    <!-- Pulse, refined — echoes the masthead motif -->
    <div class="pointer-events-none absolute inset-x-0 bottom-0 text-white opacity-60">
      <MotifPulse />
    </div>

    <!-- wordmark + category -->
    <div class="relative flex flex-col items-center gap-2 px-4">
      <span
        class="inline-flex items-center gap-2 font-[family-name:var(--font-display)] leading-none font-extrabold tracking-[-0.01em]"
        :class="large ? 'text-[1.65rem]' : 'text-[1.0625rem]'"
      >
        <span
          class="inline-block rotate-45 bg-[var(--brand-highlight)]"
          :class="large ? 'w-3 h-3' : 'w-2 h-2'"
        />
        LAS UNISON
      </span>
      <span
        class="font-[family-name:var(--font-mono)] text-[var(--purple-100)] uppercase opacity-90"
        :class="large
          ? 'text-[0.8125rem] tracking-[0.22em]'
          : 'text-[0.6875rem] tracking-[0.2em]'"
      >{{ category }}</span>
    </div>
  </div>
</template>
