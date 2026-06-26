<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: page } = await useAsyncData('legal-' + slug, () => {
  return queryCollection('legal').path('/legal/' + slug).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useContentSeo({
  title: () => page.value?.title,
  description: () => page.value?.description,
  seo: () => page.value?.seo,
})

const formattedDate = computed(() => {
  if (!page.value?.lastUpdated) return null
  return new Date(page.value.lastUpdated).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<template>
  <div>
    <SiteHeader />

    <main id="main-content">
      <!-- Page hero -->
      <div class="bg-[var(--surface-brand)] text-white">
        <div class="las-container py-12 md:py-16">
          <nav class="text-[0.8125rem] text-[var(--purple-200)] mb-4 flex items-center gap-1.5" aria-label="Breadcrumb">
            <NuxtLink to="/" class="hover:text-white transition-colors">Home</NuxtLink>
            <span class="opacity-50" aria-hidden="true">/</span>
            <span class="text-white font-semibold" aria-current="page">{{ page!.title }}</span>
          </nav>
          <h1 class="font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] font-black leading-none tracking-[-0.02em] text-white m-0">
            {{ page!.title }}
          </h1>
          <p v-if="page!.description" class="mt-4 text-[var(--purple-200)] text-[var(--text-md)] max-w-[56ch]">
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
          <p v-if="formattedDate" class="mt-12 pt-6 border-t border-[var(--border-subtle)] text-[0.8125rem] text-[var(--text-muted)]">
            Last updated: {{ formattedDate }}
          </p>
        </div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
