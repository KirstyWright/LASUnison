<script setup lang="ts">
/**
 * ContactDirect — the UNISON Direct help-line, calm brand treatment (purple
 * surface, green accent, number in IBM Plex Mono). Used in Markdown via
 * `::contact-direct`. The red EmergencyBar register is reserved for genuine 999
 * urgency (DESIGN.md "earned red") — this informational card stays in heritage
 * purple/green. Number defaults match the homepage bar and the header link.
 *
 * Rooted in .las-embed so the prose link reset applies; every visible label is a
 * child <span> with its own colour, immune to `.las-prose a`.
 */
const props = withDefaults(
  defineProps<{ number?: string, textphone?: string, hours?: string, onlineUrl?: string }>(),
  {
    number: '0800 0857 857',
    textphone: '0800 0 967 968',
    hours: 'Mon–Fri 6am–midnight · Sat 9am–4pm',
    onlineUrl: 'https://www.unison.org.uk/get-help/',
  },
)

const tel = computed(() => `tel:${props.number.replace(/\s+/g, '')}`)
const textTel = computed(() => `tel:${props.textphone.replace(/\s+/g, '')}`)
</script>

<template>
  <div
    class="las-embed flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-brand-soft)] p-6 md:p-7"
  >
    <div class="flex items-center gap-3">
      <span
        class="inline-flex size-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-primary)] text-white"
        aria-hidden="true"
      >
        <UiIcon
          name="phone"
          :size="22"
          :stroke="1.9"
        />
      </span>
      <span
        class="font-[family-name:var(--font-sans)] text-[0.8125rem] font-bold tracking-[0.08em] text-[var(--brand-primary-strong)] uppercase"
      >UNISON Direct</span>
    </div>

    <div class="flex flex-col gap-1.5">
      <a
        :href="tel"
        class="group inline-flex w-fit flex-wrap items-baseline gap-x-3 gap-y-1"
      >
        <span
          class="font-[family-name:var(--font-mono)] text-[length:var(--text-3xl)] font-semibold tracking-[-0.01em] whitespace-nowrap text-[var(--text-strong)] transition-colors group-hover:text-[var(--brand-primary)]"
        >{{ number }}</span>
        <span class="text-[length:var(--text-sm)] text-[var(--text-muted)]">freephone</span>
      </a>
      <p class="m-0 text-[length:var(--text-sm)] text-[var(--text-muted)]">
        Textphone
        <a
          :href="textTel"
          class="font-[family-name:var(--font-mono)] no-underline transition-colors duration-150 hover:text-[var(--brand-primary)]"
        ><span class="text-[var(--text-body)]">{{ textphone }}</span></a>
      </p>
    </div>

    <span class="inline-flex items-center gap-1.5 text-[length:var(--text-sm)] text-[var(--text-muted)]">
      <UiIcon
        name="clock"
        :size="16"
        :stroke="1.9"
      />
      {{ hours }}
    </span>

    <p class="m-0 text-[length:var(--text-sm)] text-[var(--text-muted)]">
      Don't know who your rep is? Have your membership number ready when you call.
    </p>

    <a
      :href="onlineUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="group inline-flex w-fit items-center gap-1.5 py-1 font-semibold"
    >
      <span class="text-[var(--brand-primary)] transition-colors group-hover:text-[var(--brand-primary-strong)]">Get help online at unison.org.uk</span>
      <UiIcon
        name="arrowUpRight"
        :size="16"
        :stroke="2.2"
        class="text-[var(--brand-primary)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
      <span class="sr-only"> (opens in a new tab)</span>
    </a>
  </div>
</template>
