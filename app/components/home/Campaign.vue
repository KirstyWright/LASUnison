<template>
  <section id="campaign" class="bg-[var(--surface-brand-deep)] text-white">
    <div class="las-container las-section grid gap-14 items-center lg:grid-cols-[0.9fr_1.1fr]">
      <div class="rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-xl)]">
        <UiPhoto ratio="4/3" label="Campaign image" tone="ink" icon="megaphone" />
      </div>
      <div>
        <UiBadge variant="secondary" dot>Campaign</UiBadge>
        <h2
          class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-5xl)] leading-[1.02] tracking-[-0.02em] mt-4 mb-0 text-white"
        >
          999 Retirement Emergency
        </h2>
        <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)] mt-[18px] mb-7 max-w-[520px]">
          Pressures at work impact hugely on the health and wellbeing of ambulance staff — yet the
          retirement age keeps rising. We want you to have the choice to retire earlier.
        </p>
        <div class="flex gap-3 flex-wrap">
          <UiButton variant="highlight" href="#join">Back the campaign</UiButton>
          <UiButton variant="ghost" class="!text-white hover:!bg-white/10" icon-right="arrowUpRight">
            Read the evidence
          </UiButton>
        </div>
      </div>
    </div>
  </section>
</template>
