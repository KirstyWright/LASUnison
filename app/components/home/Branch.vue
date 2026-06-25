<script setup lang="ts">
// "Your branch" — who runs it + ways to get involved. The committee is real
// content from the `committee` collection; "Get involved" links are editable data.

const { data: committee } = await useAsyncData('home-committee', () =>
  queryCollection('committee').all(),
)

const officers = computed(() =>
  (committee.value ?? [])
    .filter(m => m.group === 'officer')
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
)
const totalPeople = computed(() => (committee.value ?? []).length)

// Faces for the avatar stack (officers + reps with a photo).
const faces = computed(() =>
  (committee.value ?? [])
    .filter(m => m.photo)
    .sort((a, b) => (a.group === b.group ? (a.order ?? 999) - (b.order ?? 999) : a.group === 'officer' ? -1 : 1))
    .slice(0, 7),
)

// The "get help fast" shortlist — branch secretary first, then welfare + safety.
const KEY_ROLES = ['Branch Secretary', 'Welfare Officer', 'Health & Safety']
const keyContacts = computed(() =>
  KEY_ROLES.map(role => officers.value.find(o => o.role === role)).filter(
    (o): o is NonNullable<typeof o> => Boolean(o),
  ),
)

const INVOLVE: { icon: string; title: string; body: string; href: string }[] = [
  { icon: 'mapPin', title: 'Find your workplace rep', body: 'Every LAS station has a rep. Search by station to find yours and get in touch.', href: '/find-a-rep' },
  { icon: 'shield', title: 'Health, safety & welfare', body: 'Hurt at work, struggling, or worried about safety? The branch has your back.', href: '/health-safety' },
  { icon: 'userPlus', title: 'Join UNISON today', body: 'Not a member yet? Stand with almost 7,000 colleagues — it takes two minutes.', href: '/#join' },
]
</script>

<template>
  <section id="branch" class="las-section">
    <div class="las-container">
      <!-- Banner: the whole branch -->
      <div class="relative rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-lg)] mb-10">
        <img
          src="/images/branch-agm.jpg"
          alt="London Ambulance Service UNISON members together at the branch AGM, holding ‘Proud to be UNISON’ cards"
          width="2000"
          height="793"
          loading="lazy"
          class="w-full h-[260px] md:h-[300px] object-cover object-[center_35%]"
        >
        <div
          aria-hidden="true"
          class="absolute inset-0 bg-gradient-to-r from-[var(--purple-950)]/92 via-[var(--purple-900)]/70 to-[var(--purple-800)]/30"
        />
        <div class="absolute inset-0 flex flex-col justify-center p-7 md:p-12 max-w-[600px]">
          <h2
            class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-4xl)] leading-[1.05] tracking-[-0.02em] text-white m-0"
          >
            Run by members, for members
          </h2>
          <p class="text-[length:var(--text-base)] md:text-[length:var(--text-md)] leading-[1.55] text-[var(--purple-100)] mt-3 mb-0 max-w-[44ch]">
            Your reps and officers are LAS staff too. Get to know the committee, get involved, or just
            find the right person when you need them.
          </p>
          <div class="mt-5">
            <UiButton href="/branch" variant="highlight" size="sm" icon-right="arrowRight">Meet your committee</UiButton>
          </div>
        </div>
      </div>

      <div class="grid gap-8 lg:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <!-- Your branch committee -->
        <div class="las-reveal">
          <h3 class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-2xl)] text-[var(--text-strong)] m-0 mb-5">
            Your branch committee
          </h3>

          <!-- Avatar stack — the link through to the full committee -->
          <NuxtLink to="/branch" class="flex items-center gap-3.5 no-underline group mb-6">
            <div class="flex -space-x-3">
              <img
                v-for="f in faces"
                :key="f.name"
                :src="f.photo"
                alt=""
                width="44"
                height="44"
                loading="lazy"
                class="w-11 h-11 rounded-full object-cover object-[center_top] border-2 border-[var(--surface-card)] shadow-[var(--shadow-xs)]"
              >
            </div>
            <span class="text-[0.9375rem] leading-[1.4] text-[var(--text-muted)]">
              <strong class="text-[var(--text-strong)] font-bold">{{ totalPeople }} officers &amp; reps</strong><br>
              elected to stand up for you
            </span>
          </NuxtLink>

          <!-- Key contacts: help fast -->
          <ul class="list-none p-0 m-0 flex flex-col">
            <li v-for="c in keyContacts" :key="c.name">
              <div class="flex items-center gap-3.5 py-3 border-t border-[var(--border-subtle)]">
                <img
                  v-if="c.photo"
                  :src="c.photo"
                  alt=""
                  width="48"
                  height="48"
                  loading="lazy"
                  class="w-12 h-12 rounded-[var(--radius-md)] object-cover object-[center_top] flex-none"
                >
                <div class="min-w-0 flex-1">
                  <p class="font-[family-name:var(--font-display)] font-bold text-[1rem] leading-[1.2] text-[var(--text-strong)] m-0 truncate">
                    {{ c.name }}
                  </p>
                  <p class="text-[0.8125rem] text-[var(--brand-primary)] font-semibold m-0 mt-0.5">{{ c.role }}</p>
                </div>
                <!-- Public homepage: email the role inbox rather than a personal mobile. -->
                <a
                  v-if="c.email"
                  :href="`mailto:${c.email}`"
                  :aria-label="`Email ${c.name}`"
                  class="flex-none w-11 h-11 rounded-[var(--radius-md)] border border-[var(--border-default)] inline-flex items-center justify-center text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] hover:border-[var(--brand-primary)] transition-colors duration-150"
                >
                  <UiIcon name="mail" :size="17" :stroke="2" />
                </a>
              </div>
            </li>
          </ul>
        </div>

        <!-- Get involved -->
        <div class="las-reveal">
          <div
            class="rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] bg-[var(--surface-card)]"
          >
            <div class="relative h-[150px]">
              <img
                src="/images/campaign-hcpc.jpg"
                alt="LAS UNISON members holding a branch campaign banner outside"
                width="1200"
                height="900"
                loading="lazy"
                class="w-full h-full object-cover object-[center_28%]"
              >
              <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-t from-[var(--purple-950)]/85 via-[var(--purple-950)]/35 to-transparent" />
              <h3 class="absolute left-5 bottom-3.5 font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-xl)] text-white m-0">
                Get involved
              </h3>
            </div>
            <ul class="list-none p-0 m-0 divide-y divide-[var(--border-subtle)]">
              <li v-for="i in INVOLVE" :key="i.title">
                <NuxtLink
                  :to="i.href"
                  class="group flex items-start gap-3.5 p-5 no-underline transition-colors duration-150 ease-out hover:bg-[var(--surface-sunken)] focus-visible:bg-[var(--surface-sunken)]"
                >
                  <span class="flex-none w-10 h-10 rounded-[var(--radius-md)] bg-[var(--brand-secondary-soft)] text-[var(--brand-secondary)] inline-flex items-center justify-center">
                    <UiIcon :name="i.icon" :size="20" :stroke="1.9" />
                  </span>
                  <span class="min-w-0">
                    <span class="block font-[family-name:var(--font-display)] font-bold text-[length:var(--text-md)] text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">
                      {{ i.title }}
                    </span>
                    <span class="block text-[0.9375rem] leading-[1.5] text-[var(--text-muted)] mt-0.5">{{ i.body }}</span>
                  </span>
                  <UiIcon
                    name="arrowRight"
                    :size="16"
                    :stroke="2.2"
                    class="ml-auto flex-none mt-1 text-[var(--text-subtle)] transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--brand-primary)]"
                  />
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
