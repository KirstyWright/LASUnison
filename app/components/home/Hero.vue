<script setup lang="ts">
// Hero — "solidarity made visible". Editable copy lives here as plain data so
// it can migrate to a Content collection before connecting Studio.

// Hero slideshow — curated branch photographs. Editable content, kept as data so it
// can migrate to a Content collection before connecting Studio.
const SLIDES = [
  {
    src: '/images/hero/banners.jpg',
    alt: 'London Ambulance Service UNISON members on the picket line holding the branch\'s purple-and-green banners aloft during the 2023 ambulance workers\' strike.',
    caption: 'Ambulance strike, London · 2023',
    focus: 'center 40%',
  },
  {
    src: '/images/hero/picket.jpg',
    alt: 'Ambulance workers on the picket line outside an LAS station holding ‘Fair Pay & Safe Staffing’ and ‘Support the Ambulance Workers’ placards, 2023.',
    caption: 'Fair pay picket line · 2023',
    focus: 'center 38%',
  },
  {
    src: '/images/hero/solidarity.jpg',
    alt: 'London Ambulance Service UNISON members standing together on the steps holding branch placards.',
    caption: 'London Ambulance UNISON members',
    focus: 'center 30%',
  },
]
</script>

<template>
  <section
    id="top"
    class="relative overflow-hidden bg-[var(--surface-brand)] text-white"
  >
    <!-- Pulse, refined — live cardiac-monitor edge motif along the hero hem -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 bottom-0 text-[var(--brand-highlight)]"
    >
      <MotifPulse />
    </div>
    <!-- top-edge highlight so the drenched hero doesn't read as a flat block -->
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 h-px bg-white/15"
    />

    <div
      class="las-container relative grid items-center gap-12 py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14"
    >
      <div>
        <div
          class="las-rise mb-4"
          style="animation-delay: 60ms"
        >
          <UiEyebrow color="var(--brand-highlight)">
            UK's biggest ambulance branch
          </UiEyebrow>
        </div>
        <h1
          class="las-rise m-0 font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.04] font-black tracking-[-0.02em] text-white"
          style="animation-delay: 120ms"
        >
          Stronger together for London's ambulance staff
        </h1>
        <p
          class="las-rise mt-6 mb-8 max-w-[520px] text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)]"
          style="animation-delay: 200ms"
        >
          We represent, protect and stand up for the people who answer the
          call — every shift, day and night.
        </p>
        <div
          class="las-rise flex flex-wrap gap-3"
          style="animation-delay: 280ms"
        >
          <UiButton
            variant="highlight"
            size="lg"
            href="#join"
            icon-right="arrowRight"
          >
            Join UNISON today
          </UiButton>
          <UiButton
            variant="outline-invert"
            size="lg"
            href="#campaigns"
          >
            Our campaigns
          </UiButton>
        </div>
        <p
          class="las-rise m-0 mt-11 flex items-center gap-3"
          style="animation-delay: 360ms"
        >
          <span
            aria-hidden="true"
            class="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-[var(--brand-highlight)]"
          >
            <UiIcon
              name="shield"
              :size="22"
              :stroke="1.9"
            />
          </span>
          <span class="max-w-[360px] text-[length:var(--text-md)] leading-snug font-semibold text-white">
            The biggest union in the London Ambulance Service
          </span>
        </p>
      </div>

      <HomeHeroSlideshow
        :slides="SLIDES"
        class="las-rise"
        style="animation-delay: 220ms"
      />
    </div>
  </section>
</template>
