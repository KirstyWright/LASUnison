<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: page } = await useAsyncData(`legal-${slug}`, () => {
  return queryCollection('legal').path(`/legal/${slug}`).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useContentSeo({
  title: () => page.value?.title,
  description: () => page.value?.description,
  seo: () => page.value?.seo,
})

// Shared with news pages — same "12 June 2026" output, parsed by parts (no TZ drift).
const formattedDate = computed(() =>
  page.value?.lastUpdated ? formatNewsDate(page.value.lastUpdated) : null,
)
</script>

<template>
  <div>
    <SiteHeader />

    <main id="main-content">
      <!-- Page hero -->
      <div class="bg-[var(--surface-brand)] text-white">
        <div class="las-container py-12 md:py-16">
          <nav
            class="mb-4 flex items-center gap-1.5 text-[0.8125rem] text-[var(--purple-200)]"
            aria-label="Breadcrumb"
          >
            <NuxtLink
              to="/"
              class="transition-colors hover:text-white"
            >Home</NuxtLink>
            <span
              class="opacity-50"
              aria-hidden="true"
            >/</span>
            <span
              class="font-semibold text-white"
              aria-current="page"
            >{{ page!.title }}</span>
          </nav>
          <h1 class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.02] font-black tracking-[-0.02em] text-white">
            {{ page!.title }}
          </h1>
          <p
            v-if="page!.description"
            class="mt-4 max-w-[56ch] text-[var(--purple-200)] text-[var(--text-md)]"
          >
            {{ page!.description }}
          </p>
        </div>
      </div>

      <!-- Content -->
      <div class="las-container py-12 md:py-16">
        <div class="max-w-[75ch]">
          <UiLightbox>
            <ContentRenderer
              v-if="page"
              :value="page"
              class="las-prose"
            />
          </UiLightbox>
          <p
            v-if="formattedDate"
            class="mt-12 border-t border-[var(--border-subtle)] pt-6 text-[0.8125rem] text-[var(--text-muted)]"
          >
            Last updated: {{ formattedDate }}
          </p>
        </div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
