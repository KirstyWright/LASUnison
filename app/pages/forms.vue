<script setup lang="ts">
// Forms — the commonly-used national UNISON forms, rendered as cards from
// app/data/forms.ts (the old /forms WordPress page was a flat bullet list).
// Hero matches the catch-all content template; cards reuse the Resources visual
// language (icon chip, lift-on-hover, host in mono).
import { forms, formsIntro } from '~/data/forms'

useHead({ title: 'Forms — LAS UNISON' })
useSeoMeta({
  description: formsIntro,
  ogTitle: 'Forms — LAS UNISON',
  ogDescription: formsIntro,
})
</script>

<template>
  <div>
    <SiteHeader />

    <main id="main-content">
      <!-- Page hero -->
      <section class="bg-[var(--surface-brand)] text-white">
        <div class="las-container py-12 md:py-16">
          <nav
            aria-label="Breadcrumb"
            class="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-[var(--purple-200)]"
          >
            <NuxtLink
              to="/"
              class="text-[var(--purple-200)] no-underline hover:text-white"
            >Home</NuxtLink>
            <span
              class="opacity-50"
              aria-hidden="true"
            >/</span>
            <NuxtLink
              to="/resources"
              class="text-[var(--purple-200)] no-underline hover:text-white"
            >Resources</NuxtLink>
            <span
              class="opacity-50"
              aria-hidden="true"
            >/</span>
            <span
              class="font-semibold text-white"
              aria-current="page"
            >Forms</span>
          </nav>
          <h1
            class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-5xl)] leading-[1.02] font-black tracking-[-0.02em] text-white"
          >
            Forms
          </h1>
          <p class="mt-5 mb-0 max-w-[560px] text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)]">
            {{ formsIntro }}
          </p>
        </div>
      </section>

      <!-- Forms grid -->
      <section class="las-section">
        <div class="las-container">
          <ul class="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
            <li
              v-for="form in forms"
              :key="form.url"
            >
              <a
                :href="form.url"
                target="_blank"
                rel="noopener noreferrer"
                class="group relative flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:translate-y-[-3px] hover:border-[var(--border-default)] hover:shadow-[var(--shadow-lg)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
              >
                <span
                  class="absolute top-4 right-4 text-[var(--text-subtle)] transition-colors duration-150 group-hover:text-[var(--brand-primary)]"
                  aria-hidden="true"
                >
                  <UiIcon
                    name="arrowUpRight"
                    :size="18"
                    :stroke="2"
                  />
                </span>

                <span
                  class="mb-4 inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-secondary-soft)] text-[var(--green-700)]"
                  aria-hidden="true"
                >
                  <UiIcon
                    name="file"
                    :size="22"
                    :stroke="1.9"
                  />
                </span>

                <span class="block pr-6 font-[family-name:var(--font-display)] text-[1.0625rem] leading-tight font-extrabold tracking-[-0.01em] text-[var(--text-strong)] group-hover:text-[var(--brand-primary)]">
                  {{ form.title }}
                </span>

                <span
                  v-if="form.description"
                  class="mt-1.5 block text-[length:var(--text-sm)] leading-snug text-[var(--text-muted)]"
                >{{ form.description }}</span>

                <span class="mt-3 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
                  <span class="truncate font-[family-name:var(--font-mono)] text-[0.75rem] text-[var(--text-subtle)]">{{ hostLabel(form.url) }}</span>
                </span>

                <span class="sr-only"> (opens in a new tab)</span>
              </a>

              <!-- Secondary guide link sits below the card, outside the anchor -->
              <a
                v-if="form.guide"
                :href="form.guide.url"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-primary-strong)]"
              >
                <UiIcon
                  name="download"
                  :size="15"
                  :stroke="2"
                />
                {{ form.guide.label }}
              </a>
            </li>
          </ul>

          <!-- Suggest a form -->
          <p class="mt-8 max-w-[60ch] text-[length:var(--text-sm)] text-[var(--text-muted)]">
            Is there a form you think should be here? Let us know via the
            <NuxtLink
              to="/branch"
              class="font-semibold text-[var(--text-link)] underline underline-offset-2 hover:text-[var(--text-link-hover)]"
            >branch office</NuxtLink>.
          </p>
        </div>
      </section>

      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>
