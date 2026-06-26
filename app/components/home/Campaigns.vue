<script setup lang="ts">
// Current campaigns. The lead (999 Retirement Emergency) mirrors the live
// campaign in the news collection; the rail lists the branch's standing
// campaigns and affiliations. Editable copy kept as data for Studio.
const LEAD = {
  badge: 'Active campaign',
  title: '999 Retirement Emergency',
  body:
    "The toll of the job is real — yet ambulance staff are expected to work to 68. We're campaigning for paramedics, ECAs, EMTs, PTS and control-room staff to be given the choice to retire earlier, with a pension they can live on.",
  articleHref: '/news/999-retirement-emergency',
}

const CAMPAIGNS = [
  {
    icon: 'ribbon',
    name: 'White Ribbon UK',
    body: 'A White Ribbon branch: ending men’s violence against women and girls.',
    href: 'https://www.whiteribbon.org.uk',
  },
  {
    icon: 'users',
    name: 'Hope not Hate',
    body: 'Standing with colleagues against the far right, on and off shift.',
    href: 'https://hopenothate.org.uk',
  },
]
</script>

<template>
  <section id="campaigns" class="bg-[var(--surface-brand-deep)] text-white relative overflow-hidden">
    <div class="las-container las-section">
      <div class="max-w-[640px]">
        <h2
          class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-4xl)] leading-[1.05] tracking-[-0.02em] text-white m-0"
        >
          The fights we're picking on your behalf
        </h2>
        <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)] mt-4 mb-0">
          Backed by evidence, with the whole branch behind them. Here's what we're
          pushing for right now.
        </p>
      </div>

      <!-- Lead campaign over the ambulance photo -->
      <article
        class="las-reveal relative mt-10 rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-xl)] min-h-[420px] flex"
      >
        <img
          src="/images/ambulance.jpg"
          alt="A London Ambulance Service emergency ambulance in its green and yellow battenburg livery"
          width="1300"
          height="453"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover object-center"
        >
        <div
          aria-hidden="true"
          class="absolute inset-0 bg-gradient-to-r from-[var(--purple-950)]/95 via-[var(--purple-900)]/85 to-[var(--purple-800)]/55"
        />
        <div class="relative p-7 md:p-12 flex flex-col justify-center max-w-[600px]">
          <UiBadge variant="highlight" dot class="self-start">{{ LEAD.badge }}</UiBadge>
          <h3
            class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-5xl)] leading-[1.02] tracking-[-0.02em] text-white mt-4 mb-0"
          >
            {{ LEAD.title }}
          </h3>
          <p class="text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-100)] mt-4 mb-7 max-w-[48ch]">
            {{ LEAD.body }}
          </p>
          <div class="flex gap-3 flex-wrap">
            <UiButton
              variant="highlight"
              :href="LEAD.articleHref"
              icon-right="arrowRight"
            >Read the evidence on 999 retirement</UiButton>
          </div>
        </div>
      </article>

      <!-- Standing campaigns & affiliations -->
      <h3
        class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-lg)] text-white mt-12 mb-5"
      >
        We also stand with
      </h3>
      <ul class="list-none p-0 m-0 grid gap-4 sm:grid-cols-2">
        <li v-for="c in CAMPAIGNS" :key="c.name">
          <a
            :href="c.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-start gap-4 h-full p-5 rounded-[var(--radius-lg)] bg-white/[0.06] border border-white/10 no-underline transition-colors duration-150 ease-out hover:bg-white/[0.12] hover:border-white/20 focus-visible:bg-white/[0.12]"
          >
            <span
              class="flex-none w-11 h-11 rounded-[var(--radius-md)] bg-[var(--brand-highlight)]/15 text-[var(--brand-highlight)] inline-flex items-center justify-center"
            >
              <UiIcon :name="c.icon" :size="22" :stroke="1.9" />
            </span>
            <span class="flex flex-col gap-1 min-w-0">
              <span class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-md)] text-white inline-flex items-center gap-1.5">
                {{ c.name }}
                <span class="sr-only"> (opens in new tab)</span>
                <UiIcon
                  name="arrowUpRight"
                  :size="15"
                  :stroke="2.2"
                  class="text-[var(--purple-200)] opacity-40 -translate-x-0.5 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0"
                />
              </span>
              <span class="text-[0.875rem] leading-[1.5] text-[var(--purple-200)]">{{ c.body }}</span>
            </span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>
