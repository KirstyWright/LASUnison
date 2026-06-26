<script setup lang="ts">
// Hero slideshow — "the branch banner", made to move. Crossfades a small, curated
// set of branch photographs in the hero's framed figure. A calm fade (not a sliding
// carousel): it auto-advances but is fully pausable, keyboard-operable, and falls
// back to a single static slide under prefers-reduced-motion.
//
// The slide list is passed in as data (content) so it can migrate to a Content
// collection before connecting Studio; the slideshow mechanics stay here (structure).
interface Slide {
  src: string
  alt: string
  /** short, factual overlay caption */
  caption: string
  /** object-position for the portrait crop, e.g. 'center 38%' */
  focus?: string
}

const props = withDefaults(
  defineProps<{ slides: Slide[], interval?: number }>(),
  { interval: 6000 },
)

const active = ref(0)
const reduced = ref(false) // prefers-reduced-motion
const paused = ref(false) // transient pause while hovered / focus-within

const count = computed(() => props.slides.length)
// Kept (logic intact) so the per-slide caption can be re-enabled later.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- retained for future re-enable
const current = computed(() => props.slides[active.value] ?? props.slides[0])
// The timer runs only when motion is allowed, the pointer isn't hovering/focused
// inside, and there's more than one slide to show.
const rotating = computed(
  () => !reduced.value && !paused.value && count.value > 1,
)

let timer: ReturnType<typeof setInterval> | undefined
function stop() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}
function start() {
  stop()
  if (rotating.value) timer = setInterval(() => go(active.value + 1), props.interval)
}
function go(i: number) {
  active.value = (i + count.value) % count.value
}
// User-initiated navigation resets the dwell timer so a click doesn't immediately advance.
function select(i: number) {
  go(i)
  start()
}

watch(rotating, start)

onMounted(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced.value = mq.matches
  mq.addEventListener('change', e => (reduced.value = e.matches))
  start()
})
onBeforeUnmount(stop)
</script>

<template>
  <figure
    class="relative m-0"
    role="group"
    aria-roledescription="carousel"
    aria-label="London Ambulance UNISON members"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <div
      class="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] border-4 border-white/[0.12] bg-[var(--purple-900)] shadow-[var(--shadow-xl)]"
    >
      <!-- slides: stacked, crossfaded -->
      <div
        class="absolute inset-0"
        :aria-live="rotating ? 'off' : 'polite'"
      >
        <div
          v-for="(s, i) in slides"
          :key="s.src"
          class="absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-out)] motion-reduce:transition-none"
          :class="i === active ? 'opacity-100' : 'opacity-0'"
          :aria-hidden="i === active ? undefined : 'true'"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${i + 1} of ${count}: ${s.caption}`"
        >
          <img
            :src="s.src"
            :alt="s.alt"
            class="size-full object-cover"
            :style="{ objectPosition: s.focus ?? 'center' }"
            :fetchpriority="i === 0 ? 'high' : undefined"
            :loading="i === 0 ? 'eager' : 'lazy'"
            decoding="async"
            width="1400"
            height="1750"
          >
        </div>
      </div>

      <!-- purple wash anchors the photo to the drenched hero and lifts the caption -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--purple-950)]/65 via-[var(--purple-950)]/5 to-transparent"
      />

      <!-- caption overlay hidden for now — data + `current` logic kept so it can be re-enabled -->
    </div>

    <!-- controls: slide dots, sat on the drenched hero below the frame -->
    <div
      v-if="count > 1"
      class="mt-4 flex items-center justify-center"
    >
      <div
        role="group"
        aria-label="Choose a photo"
        class="flex items-center gap-1.5"
      >
        <button
          v-for="(s, i) in slides"
          :key="s.src"
          type="button"
          :aria-label="`Show photo ${i + 1}: ${s.caption}`"
          :aria-current="i === active ? 'true' : undefined"
          class="group inline-flex size-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
          @click="select(i)"
        >
          <span
            class="block h-2 rounded-full transition-all duration-150 ease-[var(--ease-out)]"
            :class="i === active ? 'w-5 bg-[var(--brand-highlight)]' : 'w-2 bg-white/35 group-hover:bg-white/60'"
          />
        </button>
      </div>
    </div>
  </figure>
</template>
