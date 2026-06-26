<script setup lang="ts">
// Current campaigns. The lead (999 Retirement Emergency) mirrors the live
// campaign in the news collection; the rail lists the branch's standing
// campaigns and affiliations. Editable copy kept as data for Studio.
const LEAD = {
  badge: 'Active campaign',
  title: '999 Retirement Emergency',
  body:
    'The toll of the job is real — yet ambulance staff are expected to work to 68. We\'re campaigning for paramedics, ECAs, EMTs, PTS and control-room staff to be given the choice to retire earlier, with a pension they can live on.',
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
  <section
    id="campaigns"
    class="relative overflow-hidden bg-[var(--surface-brand-deep)] text-white"
  >
    <div class="las-container las-section">
      <div class="max-w-[640px]">
        <h2
          class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-4xl)] leading-[1.05] font-black tracking-[-0.02em] text-white"
        >
          The fights we're picking on your behalf
        </h2>
        <p class="mt-4 mb-0 text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)]">
          Backed by evidence, with the whole branch behind them. Here's what we're
          pushing for right now.
        </p>
      </div>

      <!-- Lead campaign over the ambulance photo -->
      <article
        class="las-reveal relative mt-10 flex min-h-[420px] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)]"
      >
        <img
          src="/images/ambulance.jpg"
          alt="A London Ambulance Service emergency ambulance in its green and yellow battenburg livery"
          width="1300"
          height="453"
          loading="lazy"
          class="absolute inset-0 size-full object-cover object-center"
        >
        <div
          aria-hidden="true"
          class="absolute inset-0 bg-gradient-to-r from-[var(--purple-950)]/95 via-[var(--purple-900)]/85 to-[var(--purple-800)]/55"
        />
        <div class="relative flex max-w-[600px] flex-col justify-center p-7 md:p-12">
          <UiBadge
            variant="highlight"
            dot
            class="self-start"
          >
            {{ LEAD.badge }}
          </UiBadge>
          <h3
            class="mt-4 mb-0 font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.02] font-black tracking-[-0.02em] text-white"
          >
            {{ LEAD.title }}
          </h3>
          <p class="mt-4 mb-7 max-w-[48ch] text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-100)]">
            {{ LEAD.body }}
          </p>
          <div class="flex flex-wrap gap-3">
            <UiButton
              variant="highlight"
              :href="LEAD.articleHref"
              icon-right="arrowRight"
            >
              Read the evidence on 999 retirement
            </UiButton>
          </div>
        </div>
      </article>

      <!-- Standing campaigns & affiliations -->
      <h3
        class="mt-12 mb-5 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-extrabold text-white"
      >
        We also stand with
      </h3>
      <ul class="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
        <li
          v-for="c in CAMPAIGNS"
          :key="c.name"
        >
          <a
            :href="c.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex h-full items-start gap-4 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.06] p-5 no-underline transition-colors duration-150 ease-out hover:border-white/20 hover:bg-white/[0.12] focus-visible:bg-white/[0.12]"
          >
            <span
              class="inline-flex size-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-highlight)]/15 text-[var(--brand-highlight)]"
            >
              <UiIcon
                :name="c.icon"
                :size="22"
                :stroke="1.9"
              />
            </span>
            <span class="flex min-w-0 flex-col gap-1">
              <span class="inline-flex items-center gap-1.5 font-[family-name:var(--font-display)] text-[length:var(--text-md)] font-bold text-white">
                {{ c.name }}
                <span class="sr-only"> (opens in new tab)</span>
                <UiIcon
                  name="arrowUpRight"
                  :size="15"
                  :stroke="2.2"
                  class="-translate-x-0.5 text-[var(--purple-200)] opacity-40 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
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
