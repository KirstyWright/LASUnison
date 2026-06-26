<script setup lang="ts">
/**
 * Custom error page (app/error.vue) — the branded 404 / 500 screen.
 *
 * Nuxt renders this standalone, *outside* the normal app/layout tree, so it
 * carries its own <SiteHeader>, <SiteFooter> and the search overlay (the header
 * search button is dead without it). Any NuxtLink here navigates normally:
 * Nuxt's router.afterEach auto-clears the error on the next client navigation,
 * so plain links and buttons "just work" — no manual clearError needed.
 *
 * Design: heritage purple band, banner-bold Archivo headline, the status code
 * flipped to spark green like a Stat on a dark surface, and a single battenburg
 * rule (the one sanctioned use of hi-vis yellow). No emergency red — a missing
 * page is not a 999 (the Earned-Red rule). Below the band, a wayfinding grid
 * helps a lost visitor get somewhere useful fast.
 */
import type { NuxtError } from '#app'
import type { SiteLink } from '~/data/links'

const props = defineProps<{ error: NuxtError }>()

const route = useRoute()
const { open: openSearch } = useSiteSearch()

const code = computed(() => props.error?.statusCode || 404)
const is404 = computed(() => code.value === 404)

// The path the visitor tried to reach — shown as a fact (mono) on a 404, where
// it's genuinely useful ("this address has nothing behind it"). Vue escapes the
// interpolation, so an attacker-controlled path can't inject markup.
const attemptedPath = computed(() => {
  const p = route.fullPath
  return p && p !== '/' ? p : ''
})

const heading = computed(() =>
  is404.value ? 'We couldn\'t find that page' : 'Something went wrong',
)

const lead = computed(() =>
  is404.value
    ? 'The page may have moved, been renamed, or the link that sent you here is out of date. The site was recently rebuilt — most old addresses redirect automatically, but a few slip through.'
    : 'A problem at our end stopped this page loading. Please try again in a moment — if it keeps happening, let the branch know.',
)

// Curated wayfinding for a lost visitor — the destinations people actually come
// for. Every path is a real route (see app/data/nav.ts).
const destinations: SiteLink[] = [
  { label: 'Homepage', url: '/', note: 'Start fresh from the front page', icon: 'flag' },
  { label: 'Join UNISON', url: '/membership', note: 'Why join, what it costs, and how', icon: 'userPlus' },
  { label: 'Latest news', url: '/news', note: 'Branch updates, pay and campaigns', icon: 'megaphone' },
  { label: 'Find your rep', url: '/find-a-rep', note: 'Your workplace rep by station & sector', icon: 'mapPin' },
  { label: 'Member support', url: '/support', note: 'Legal, health & safety, welfare and more', icon: 'lifebuoy' },
  { label: 'Resources', url: '/resources', note: 'Staff tools, forms and useful links', icon: 'bookOpen' },
]

useHead({ title: `${is404.value ? 'Page not found' : 'Error'} — LAS UNISON` })
// Keep error pages out of the index even if a crawler reaches one.
useSeoMeta({ robots: 'noindex, follow' })
</script>

<template>
  <div>
    <SiteHeader />

    <main id="main-content">
      <!-- Banner hero -->
      <section class="relative overflow-hidden bg-[var(--surface-brand)] text-white">
        <div class="las-container py-14 md:py-20">
          <div class="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div class="max-w-[34rem]">
              <p
                class="m-0 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 font-[family-name:var(--font-mono)] text-[0.8125rem] tracking-[0.04em] text-[var(--purple-200)]"
              >
                <span
                  class="inline-block size-1.5 rounded-full bg-[var(--brand-highlight)]"
                  aria-hidden="true"
                />
                Error {{ code }}
              </p>

              <h1
                class="mt-5 mb-0 font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.02] font-black tracking-[-0.02em] text-white"
              >
                {{ heading }}
              </h1>

              <p class="mt-5 mb-0 text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)]">
                {{ lead }}
              </p>

              <p
                v-if="is404 && attemptedPath"
                class="mt-4 mb-0 font-[family-name:var(--font-mono)] text-[0.8125rem] break-all text-[var(--purple-200)]/80"
              >
                Nothing found at <span class="text-white">{{ attemptedPath }}</span>
              </p>

              <div class="mt-8 flex flex-wrap items-center gap-3">
                <UiButton
                  href="/"
                  variant="highlight"
                  icon-left="arrowLeft"
                >
                  Back to homepage
                </UiButton>
                <button
                  type="button"
                  class="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-white/35 px-6 font-[family-name:var(--font-sans)] leading-none font-bold whitespace-nowrap text-white transition-colors duration-150 ease-out hover:bg-white/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] active:translate-y-px"
                  @click="openSearch"
                >
                  <span
                    class="inline-flex size-[1.15em]"
                    aria-hidden="true"
                  >
                    <UiIcon name="search" />
                  </span>
                  Search the site
                </button>
              </div>
            </div>

            <!-- Status code as a Stat-style figure: spark green on the dark band -->
            <div
              class="text-center font-[family-name:var(--font-display)] text-[clamp(6rem,20vw,12rem)] leading-[0.85] font-black tracking-[-0.04em] text-[var(--brand-highlight)] select-none md:text-right"
              aria-hidden="true"
            >
              {{ code }}
            </div>
          </div>
        </div>

        <!-- Battenburg rule — heritage ambulance motif; the one place hi-vis is allowed -->
        <div
          class="battenburg h-6"
          aria-hidden="true"
        />
      </section>

      <!-- Wayfinding -->
      <section class="las-section">
        <div class="las-container">
          <h2
            class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] font-extrabold text-[var(--text-strong)]"
          >
            Where would you like to go?
          </h2>
          <p class="mt-2 mb-0 max-w-[60ch] text-[length:var(--text-base)] text-[var(--text-muted)]">
            Pick up from one of these, or use search to find what you were after.
          </p>

          <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ResourcesQuickLink
              v-for="d in destinations"
              :key="d.url"
              :link="d"
              featured
            />
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
    <SiteSearchOverlay />
  </div>
</template>

<style scoped>
/* Green/hi-vis battenburg checkerboard (two offset rows) built from one conic
   tile that repeats — the ambulance livery, rendered as a thin brand rule. */
.battenburg {
  background-color: var(--green-600);
  background-image: conic-gradient(
    var(--yellow-400) 90deg,
    var(--green-600) 90deg 180deg,
    var(--yellow-400) 180deg 270deg,
    var(--green-600) 270deg
  );
  background-size: 24px 24px;
}
</style>
