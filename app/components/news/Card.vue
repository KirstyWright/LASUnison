<script setup lang="ts">
/**
 * NewsCard — a single news item, in two layouts:
 *  - default: vertical card for the grid / homepage teaser
 *  - featured: wide horizontal lead story for the top of the archive
 * Category drives accent colour, tone and icon (see utils/news.ts);
 * urgent items take the 999-red treatment.
 */
const props = withDefaults(
  defineProps<{ post: NewsItem; featured?: boolean }>(),
  { featured: false },
)

const meta = computed(() => newsCategoryMeta(props.post.category, props.post.urgent))
const dateText = computed(() => formatNewsDate(props.post.date))
const readText = computed(() => readTimeLabel(props.post.readTime))

const BASE =
  'group relative flex bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-sm)] no-underline text-[var(--text-body)] transition duration-200 ease-out hover:shadow-[var(--shadow-lg)] hover:-translate-y-[3px] hover:border-[var(--border-default)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]'
</script>

<template>
  <NuxtLink
    :to="post.path"
    :class="[BASE, featured ? 'flex-col lg:flex-row' : 'flex-col']"
  >
    <!-- accent strip: top on default cards, left edge on the featured card -->
    <div
      class="absolute z-[1]"
      :class="featured ? 'inset-y-0 left-0 w-1.5 lg:h-full' : 'inset-x-0 top-0 h-1.5'"
      :style="{ background: meta.accent }"
      aria-hidden="true"
    />

    <!-- media -->
    <div
      class="relative overflow-hidden bg-[var(--surface-sunken)] flex-none"
      :class="featured ? 'aspect-video lg:aspect-auto lg:w-[44%]' : 'aspect-video'"
    >
      <NewsMedia
        :image="post.image"
        :category="post.category"
        :tone="meta.tone"
        :icon="meta.icon"
        :large="featured"
        :eager="featured"
      />
      <span
        v-if="post.urgent"
        class="absolute top-3 left-3 inline-flex items-center gap-1.5 font-[family-name:var(--font-sans)] font-bold text-[0.75rem] tracking-[0.04em] uppercase leading-none px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--emergency)] text-white shadow-[var(--shadow-sm)]"
      >
        <UiIcon name="alert" :size="13" :stroke="2.4" /> Action needed
      </span>
    </div>

    <!-- body -->
    <div
      class="flex flex-col gap-2.5 flex-1 p-5"
      :class="featured ? 'lg:p-8 lg:justify-center' : 'pb-6'"
    >
      <span
        class="font-[family-name:var(--font-sans)] text-[0.8125rem] font-bold tracking-[0.08em] uppercase leading-none"
        :style="{ color: meta.accent }"
      >{{ post.category }}</span>

      <h3
        class="font-[family-name:var(--font-display)] font-extrabold tracking-[-0.015em] text-[var(--text-strong)] m-0 group-hover:text-[var(--brand-primary)]"
        :class="featured
          ? 'text-[length:var(--text-3xl)] leading-[1.1]'
          : 'text-[1.375rem] leading-[1.2]'"
      >{{ post.title }}</h3>

      <p
        class="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-muted)] m-0"
      >
        <time :datetime="isoDate(post.date)">{{ dateText }}</time>
        <template v-if="readText">
          <span class="text-[var(--border-strong)]" aria-hidden="true">·</span>
          <span>{{ readText }}</span>
        </template>
      </p>

      <p
        class="text-[var(--text-muted)] m-0"
        :class="featured ? 'text-[length:var(--text-md)] leading-[1.6] max-w-[52ch]' : 'text-[0.9375rem] leading-[1.55]'"
      >{{ post.excerpt }}</p>

      <div class="mt-auto pt-3 flex items-center gap-3">
        <UiBadge v-if="post.topic" variant="neutral">{{ post.topic }}</UiBadge>
        <span
          class="ml-auto inline-flex items-center gap-1 font-bold text-[0.875rem] text-[var(--brand-primary)]"
        >
          Read {{ featured ? 'full story' : 'more' }}
          <UiIcon
            name="arrowRight"
            :size="15"
            class="transition-transform duration-200 ease-out group-hover:translate-x-1"
          />
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
