<script setup lang="ts">
// "Your branch" — a compact band that shows the committee is real and human,
// then points to the full committee page. People come from the editable
// `committee` collection; the full directory + contacts live at /branch.

const { data: committee } = await useAsyncData('home-committee', () =>
  queryCollection('committee').all(),
)

const totalPeople = computed(() => (committee.value ?? []).length)

// Faces for the avatar stack — officers first, then reps with a photo.
const faces = computed(() =>
  (committee.value ?? [])
    .filter(m => m.photo)
    .sort((a, b) =>
      a.group === b.group
        ? (a.order ?? 999) - (b.order ?? 999)
        : a.group === 'officer'
          ? -1
          : 1,
    )
    .slice(0, 7),
)
</script>

<template>
  <section id="branch" class="las-section">
    <div class="las-container">
      <div class="relative rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-lg)]">
        <img
          src="/images/branch-agm.jpg"
          alt="London Ambulance Service UNISON members together at the branch AGM, holding ‘Proud to be UNISON’ cards"
          width="2000"
          height="793"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover object-[center_35%]"
        >
        <div
          aria-hidden="true"
          class="absolute inset-0 bg-gradient-to-r from-[var(--purple-950)]/92 via-[var(--purple-900)]/72 to-[var(--purple-800)]/35"
        />
        <div class="relative p-7 md:p-12 max-w-[600px] min-h-[280px] flex flex-col justify-center">
          <div class="mb-3.5">
            <UiEyebrow color="var(--brand-highlight)">Run by members, for members</UiEyebrow>
          </div>
          <h2
            class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-4xl)] leading-[1.05] tracking-[-0.02em] text-white m-0"
          >
            Your branch committee
          </h2>
          <p class="text-[length:var(--text-base)] md:text-[length:var(--text-md)] leading-[1.55] text-[var(--purple-100)] mt-3 mb-0 max-w-[44ch]">
            Your reps and officers are LAS staff too. You elect them to negotiate on your behalf
            and back you up at work.
          </p>

          <!-- Faces + count: the human proof, links through to the full committee -->
          <div class="flex items-center gap-3.5 mt-6">
            <div class="flex -space-x-3">
              <img
                v-for="f in faces"
                :key="f.name"
                :src="f.photo"
                alt=""
                width="44"
                height="44"
                loading="lazy"
                class="w-11 h-11 rounded-full object-cover object-[center_top] border-2 border-[var(--purple-950)]/40 ring-2 ring-white/80 shadow-[var(--shadow-xs)]"
              >
            </div>
            <span class="text-[0.9375rem] leading-[1.4] text-[var(--purple-100)]">
              <strong class="text-white font-bold">{{ totalPeople }} officers &amp; reps</strong><br>
              elected to stand up for you
            </span>
          </div>

          <div class="mt-6">
            <UiButton href="/branch" variant="highlight" size="sm" icon-right="arrowRight">Meet your committee</UiButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
