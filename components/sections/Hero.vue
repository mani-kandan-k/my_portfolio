<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import type { HeroPayload, PublicSection, SiteSettingsPublic } from '~/shared/types/site'

const props = defineProps<{
  section: PublicSection
  settings?: SiteSettingsPublic | null
}>()

const payload = computed(() => props.section.payload as HeroPayload)
</script>

<template>
  <section id="hero" class="border-b border-base-300">
    <div class="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <p v-if="payload.greeting" class="text-lg font-medium text-primary">{{ payload.greeting }}</p>
      <h1 class="mt-3 text-4xl font-extrabold tracking-tight sm:text-6xl">
        {{ settings?.name }}
        <span
          v-if="settings?.role"
          class="mt-2 block text-2xl font-semibold text-base-content/60 sm:text-3xl"
        >
          {{ settings.role }}
        </span>
      </h1>
      <p v-if="payload.subHeadline" class="mt-6 max-w-2xl text-lg text-base-content/70">
        {{ payload.subHeadline }}
      </p>
      <p v-else-if="settings?.tagline" class="mt-6 max-w-2xl text-lg text-base-content/70">
        {{ settings.tagline }}
      </p>

      <div class="mt-10 flex flex-wrap items-center gap-3">
        <a
          v-if="payload.primaryCta?.label"
          :href="payload.primaryCta.url || '#'"
          class="btn btn-primary"
        >
          {{ payload.primaryCta.label }}
        </a>
        <a
          v-if="payload.secondaryCta?.label"
          :href="payload.secondaryCta.url || '#'"
          class="btn btn-outline"
        >
          {{ payload.secondaryCta.label }}
        </a>
        <a
          v-if="settings?.resumePath"
          :href="settings.resumePath"
          download
          class="btn btn-ghost gap-2"
        >
          <Download class="size-4" aria-hidden="true" />
          Resume
        </a>
      </div>

      <div v-if="payload.images?.length" class="mt-12 grid gap-4 sm:grid-cols-3">
        <NuxtImg
          v-for="(image, index) in payload.images.slice(0, 3)"
          :key="image"
          :src="image"
          :alt="`${settings?.name ?? 'Site owner'} — photo ${index + 1}`"
          width="480"
          height="640"
          class="aspect-[3/4] w-full rounded-2xl border border-base-300 object-cover"
        />
      </div>
    </div>
  </section>
</template>
