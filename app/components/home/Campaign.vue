<template>
  <section
    id="campaign"
    class="bg-[var(--surface-brand-deep)] text-white"
  >
    <div class="las-container las-section grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
      <div class="overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)]">
        <UiPhoto
          ratio="4/3"
          label="Campaign image"
          tone="ink"
          icon="megaphone"
        />
      </div>
      <div>
        <UiBadge
          variant="secondary"
          dot
        >
          Campaign
        </UiBadge>
        <h2
          class="mt-4 mb-0 font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.02] font-black tracking-[-0.02em] text-white"
        >
          999 Retirement Emergency
        </h2>
        <p class="mt-[18px] mb-7 max-w-[520px] text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)]">
          Pressures at work impact hugely on the health and wellbeing of ambulance staff — yet the
          retirement age keeps rising. We want you to have the choice to retire earlier.
        </p>
        <div class="flex flex-wrap gap-3">
          <UiButton
            variant="highlight"
            href="#join"
          >
            Back the campaign
          </UiButton>
          <UiButton
            variant="ghost"
            class="!text-white hover:!bg-white/10"
            icon-right="arrowUpRight"
          >
            Read the evidence
          </UiButton>
        </div>
      </div>
    </div>
  </section>
</template>
