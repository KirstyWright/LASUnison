<script setup lang="ts">
// /branch — the elected branch committee: officers and branch representatives.
// People (names, roles, contacts, photos) live in the editable `committee`
// content collection; this page is the structure around them.

// "More from your branch" — the rest of the Your Branch group (about, rules,
// calendar, contact); /branch is this page and /find-a-rep has its own callout.
import { navGroups } from '~/data/nav'
import type { SiteLink } from '~/data/links'

const { data: committee } = await useAsyncData('committee', () =>
  queryCollection('committee').all(),
)

const officers = computed(() =>
  (committee.value ?? [])
    .filter(m => m.group === 'officer')
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
)

// Branch Secretary and Branch Chair lead the branch — featured side by side
// ahead of the grid so the two principal officers are easy to reach.
const LEAD_ROLES = ['branch secretary', 'branch chair']
const leads = computed(() =>
  LEAD_ROLES.map(r => officers.value.find(o => o.role.toLowerCase() === r)).filter(
    (o): o is NonNullable<typeof o> => Boolean(o),
  ),
)
const gridOfficers = computed(() => officers.value.filter(o => !leads.value.includes(o)))

// Branch reps hold elected seats by sector; group them under their sector.
const AREAS: { slug: string, name: string, blurb: string }[] = [
  { slug: 'west', name: 'West Sector', blurb: 'Hillingdon, St John\'s Wood and the west' },
  { slug: 'north-central', name: 'North Central Sector', blurb: 'Islington and central London' },
  { slug: 'east-central', name: 'East Central Sector', blurb: 'Whipps Cross, Dockside and the east' },
  { slug: 'south-west', name: 'South West Sector', blurb: 'New Malden, St Helier and the south west' },
  { slug: 'south-east', name: 'South East Sector', blurb: 'Greenwich, Waterloo and the south east' },
  { slug: 'eoc-111', name: 'EOC & 111', blurb: 'The 999 and 111 control rooms' },
]

const repAreas = computed(() =>
  AREAS.map(area => ({
    ...area,
    members: (committee.value ?? [])
      .filter(m => m.group === 'rep' && m.area === area.slug)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
  })).filter(a => a.members.length > 0),
)

const repCount = computed(() => (committee.value ?? []).filter(m => m.group === 'rep').length)
const branchGroup = navGroups.find(g => g.id === 'your-branch')!
const moreFromBranch = computed<SiteLink[]>(() =>
  branchGroup.items
    .filter(i => !['/branch', '/find-a-rep'].includes(i.path))
    .map(i => ({ label: i.label, url: i.path, note: i.note, icon: i.icon })),
)

useHead({ title: 'Your branch committee — LAS UNISON' })
useSeoMeta({
  description:
    'Meet the people who run your union branch: the elected branch officers and branch representatives who represent London Ambulance Service staff. Officer contact details included.',
})
</script>

<template>
  <div>
    <SiteHeader />

    <main id="main-content">
      <!-- ── Masthead ─────────────────────────────────────────────────────── -->
      <section class="relative overflow-hidden bg-[var(--surface-brand)] text-white">
        <!-- Pulse, refined — live cardiac-monitor edge motif -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-x-0 bottom-0 text-[var(--brand-highlight)]"
        >
          <MotifPulse />
        </div>
        <div class="las-container relative py-14 md:py-[4.5rem]">
          <nav
            aria-label="Breadcrumb"
            class="mb-5 text-[0.875rem] text-[var(--purple-200)]"
          >
            <NuxtLink
              to="/"
              class="text-[var(--purple-200)] no-underline hover:text-white"
            >Home</NuxtLink>
            <span
              class="mx-2 opacity-50"
              aria-hidden="true"
            >/</span>
            <span
              class="font-semibold text-white"
              aria-current="page"
            >Your Branch</span>
          </nav>

          <div class="mb-[18px]">
            <UiEyebrow color="var(--brand-highlight)">
              Run by members, for members
            </UiEyebrow>
          </div>
          <h1
            class="text-wrap-balance m-0 max-w-[16ch] font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.02] font-black tracking-[-0.02em] text-white"
          >
            Your branch committee
          </h1>
          <p class="mt-5 mb-0 max-w-[60ch] text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)]">
            UNISON is the biggest union in the London Ambulance Service. The branch is run by ambulance
            staff like you — these are the officers and representatives you elect to stand up for
            colleagues, negotiate on your behalf and get members help when it matters.
          </p>

          <!-- Jump links -->
          <div class="mt-8 flex flex-wrap gap-3">
            <a
              href="#officers"
              class="inline-flex h-10 items-center gap-2 rounded-[var(--radius-pill)] bg-white/10 px-4 text-[0.875rem] font-bold text-white no-underline transition-colors duration-150 hover:bg-white/20"
            >
              <UiIcon
                name="shield"
                :size="16"
                :stroke="2"
              />
              {{ officers.length }} branch officers
            </a>
            <a
              href="#representatives"
              class="inline-flex h-10 items-center gap-2 rounded-[var(--radius-pill)] bg-white/10 px-4 text-[0.875rem] font-bold text-white no-underline transition-colors duration-150 hover:bg-white/20"
            >
              <UiIcon
                name="users"
                :size="16"
                :stroke="2"
              />
              {{ repCount }} representatives
            </a>
          </div>
        </div>
      </section>

      <!-- ── Branch officers ──────────────────────────────────────────────── -->
      <section
        id="officers"
        class="las-section"
      >
        <div class="las-container">
          <UiSectionHead
            eyebrow="Branch Officers"
            title="Branch officers"
            intro="Each officer leads an area of the branch's work — from health &amp; safety and welfare to education, equalities and pay. Reach the right one directly."
          />

          <!-- Leads: Branch Secretary + Branch Chair -->
          <div class="mt-9 grid gap-5 lg:grid-cols-2">
            <article
              v-for="l in leads"
              :key="l.name"
              class="grid grid-cols-[120px_1fr] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--brand-primary-soft)] bg-[var(--surface-brand-soft)] shadow-[var(--shadow-sm)] sm:grid-cols-[150px_1fr]"
            >
              <div class="relative min-h-[190px] overflow-hidden bg-[var(--surface-sunken)]">
                <img
                  v-if="l.photo"
                  :src="l.photo"
                  :alt="`${l.name} — ${l.role}`"
                  width="560"
                  height="700"
                  class="size-full object-cover object-[center_top]"
                >
                <div
                  v-else
                  class="flex size-full items-center justify-center"
                  style="background: linear-gradient(150deg, var(--purple-600), var(--purple-800))"
                  aria-hidden="true"
                >
                  <span class="font-[family-name:var(--font-display)] text-[2rem] leading-none font-black text-white/90">
                    {{ l.name.split(' ').map(n => n[0]).slice(0, 2).join('') }}
                  </span>
                </div>
                <span
                  class="absolute inset-y-0 right-0 w-1 bg-[var(--brand-primary)]"
                  aria-hidden="true"
                />
              </div>
              <div class="flex flex-col justify-center p-5 md:p-6">
                <h3 class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-xl)] leading-[1.15] font-extrabold tracking-[-0.015em] text-[var(--text-strong)]">
                  {{ l.name }}
                </h3>
                <p class="mt-1 mb-0 text-[length:var(--text-base)] font-bold text-[var(--brand-primary)]">
                  {{ l.role }}
                </p>
                <p
                  v-if="l.workplace"
                  class="mt-2.5 mb-0 flex items-center gap-1.5 text-[0.875rem] text-[var(--text-muted)]"
                >
                  <UiIcon
                    name="mapPin"
                    :size="15"
                    :stroke="2"
                    class="flex-none text-[var(--text-subtle)]"
                  />
                  {{ l.workplace }}
                </p>
                <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a
                    v-if="l.phone"
                    :href="`tel:${l.phone.replace(/\s+/g, '')}`"
                    class="group/link flex items-center gap-2 font-[family-name:var(--font-mono)] text-[0.8125rem] font-medium text-[var(--text-body)] no-underline hover:text-[var(--brand-primary)]"
                  >
                    <UiIcon
                      name="phone"
                      :size="14"
                      :stroke="2"
                      class="flex-none text-[var(--text-subtle)] group-hover/link:text-[var(--brand-primary)]"
                    />
                    {{ l.phone }}
                  </a>
                  <UiButton
                    v-if="l.email"
                    :href="`mailto:${l.email}`"
                    variant="outline"
                    size="sm"
                    icon-left="mail"
                  >
                    Email
                  </UiButton>
                </div>
              </div>
            </article>
          </div>

          <!-- Remaining officers -->
          <div
            class="mt-6 grid gap-5"
            style="grid-template-columns: repeat(auto-fill, minmax(210px, 1fr))"
          >
            <CommitteeMemberCard
              v-for="o in gridOfficers"
              :key="o.name"
              :name="o.name"
              :role="o.role"
              :workplace="o.workplace"
              :phone="o.phone"
              :email="o.email"
              :photo="o.photo"
              accent="purple"
              class="las-reveal"
            />
          </div>
        </div>
      </section>

      <!-- ── Branch representatives ───────────────────────────────────────── -->
      <section
        id="representatives"
        class="pb-[var(--section-y)]"
      >
        <div class="las-container">
          <div class="border-t border-[var(--border-subtle)] pt-[var(--section-y-tight)]">
            <UiSectionHead
              eyebrow="Branch Representatives"
              eyebrow-color="var(--brand-secondary)"
              title="Your representatives"
            />

            <div class="mt-10 flex flex-col gap-12">
              <section
                v-for="area in repAreas"
                :key="area.slug"
              >
                <div class="mb-5 flex items-center gap-3.5">
                  <span
                    class="h-9 w-2 flex-none rounded-[var(--radius-pill)] bg-[var(--brand-secondary)]"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-xl)] leading-[1.1] font-black tracking-[-0.015em] text-[var(--text-strong)]">
                      {{ area.name }}
                    </h3>
                    <p class="m-0 mt-0.5 text-[0.8125rem] text-[var(--text-muted)]">
                      {{ area.blurb }}
                    </p>
                  </div>
                </div>
                <div
                  class="grid gap-5"
                  style="grid-template-columns: repeat(auto-fill, minmax(210px, 1fr))"
                >
                  <CommitteeMemberCard
                    v-for="r in area.members"
                    :key="r.name"
                    :name="r.name"
                    :role="r.role"
                    :workplace="r.workplace"
                    :photo="r.photo"
                    accent="green"
                    class="las-reveal"
                  />
                </div>
              </section>
            </div>

            <!-- Reaching a rep -->
            <div
              class="mt-12 flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-6 sm:flex-row sm:items-center"
            >
              <span class="inline-flex size-12 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-secondary-soft)] text-[var(--brand-secondary)]">
                <UiIcon
                  name="mapPin"
                  :size="24"
                  :stroke="1.9"
                />
              </span>
              <div class="min-w-0 flex-1">
                <h3 class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-md)] font-extrabold text-[var(--text-strong)]">
                  Looking for the rep at your station?
                </h3>
                <p class="m-0 mt-1 text-[0.9375rem] text-[var(--text-muted)]">
                  Every LAS workplace has its own rep too. Search by station to find yours and get their contact details.
                </p>
              </div>
              <UiButton
                href="/find-a-rep"
                variant="secondary"
                icon-right="arrowRight"
                class="flex-none"
              >
                Find a rep
              </UiButton>
            </div>
          </div>
        </div>
      </section>

      <!-- ── More from your branch ───────────────────────────────────────── -->
      <section class="las-section border-y border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
        <div class="las-container">
          <UiSectionHead
            eyebrow="Your Branch"
            title="More from your branch"
            intro="About the branch, the rules we work to, key dates and how to get in touch."
          />
          <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ResourcesQuickLink
              v-for="l in moreFromBranch"
              :key="l.url"
              :link="l"
            />
          </div>
        </div>
      </section>

      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>
