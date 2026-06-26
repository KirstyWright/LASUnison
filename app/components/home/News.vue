<script setup lang="ts">
// Homepage teaser — the latest items from the news collection: the most
// recent as a featured lead, then a grid of the next three.
// The full archive lives at /news.
const { data: posts } = await useAsyncData('home-news', () =>
  queryCollection('news').order('date', 'DESC').limit(4).all(),
)

const lead = computed(() => posts.value?.[0] as NewsItem | undefined)
const rest = computed(() => (posts.value ?? []).slice(1) as NewsItem[])
</script>

<template>
  <section
    id="news"
    class="las-section"
  >
    <div class="las-container">
      <div class="mb-9 flex flex-wrap items-end justify-between gap-5">
        <UiSectionHead title="News &amp; bulletins" />
        <UiButton
          variant="ghost"
          href="/news"
          icon-right="arrowRight"
        >
          All news
        </UiButton>
      </div>

      <NewsCard
        v-if="lead"
        :post="lead"
        featured
        class="mb-6"
      />

      <div
        v-if="rest.length"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <NewsCard
          v-for="p in rest"
          :key="p.path"
          :post="p"
        />
      </div>
    </div>
  </section>
</template>
