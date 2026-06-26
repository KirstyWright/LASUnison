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
  <section
    id="branch"
    class="las-section"
  >
    <div class="las-container">
      <div class="relative overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)]">
        <img
          src="/images/branch-agm.jpg"
          alt="London Ambulance Service UNISON members together at the branch AGM, holding ‘Proud to be UNISON’ cards"
          width="2000"
          height="793"
          loading="lazy"
          class="absolute inset-0 size-full object-cover object-[center_35%]"
        >
        <div
          aria-hidden="true"
          class="absolute inset-0 bg-gradient-to-r from-[var(--purple-950)]/92 via-[var(--purple-900)]/72 to-[var(--purple-800)]/35"
        />
        <div class="relative flex min-h-[280px] max-w-[600px] flex-col justify-center p-7 md:p-12">
          <div class="mb-3.5">
            <UiEyebrow color="var(--brand-highlight)">
              Run by members, for members
            </UiEyebrow>
          </div>
          <h2
            class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-4xl)] leading-[1.05] font-black tracking-[-0.02em] text-white"
          >
            Your branch committee
          </h2>
          <p class="mt-3 mb-0 max-w-[44ch] text-[length:var(--text-base)] leading-[1.55] text-[var(--purple-100)] md:text-[length:var(--text-md)]">
            Your reps and officers are LAS staff too. You elect them to negotiate on your behalf
            and back you up at work.
          </p>

          <!-- Faces + count: the human proof, links through to the full committee -->
          <div class="mt-6 flex items-center gap-3.5">
            <div class="flex -space-x-3">
              <img
                v-for="f in faces"
                :key="f.name"
                :src="f.photo"
                alt=""
                width="44"
                height="44"
                loading="lazy"
                class="size-11 rounded-full border-2 border-[var(--purple-950)]/40 object-cover object-[center_top] shadow-[var(--shadow-xs)] ring-2 ring-white/80"
              >
            </div>
            <span class="text-[0.9375rem] leading-[1.4] text-[var(--purple-100)]">
              <strong class="font-bold text-white">{{ totalPeople }} officers &amp; reps</strong><br>
              elected to stand up for you
            </span>
          </div>

          <div class="mt-6">
            <UiButton
              href="/branch"
              variant="highlight"
              size="sm"
              icon-right="arrowRight"
            >
              Meet your committee
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
