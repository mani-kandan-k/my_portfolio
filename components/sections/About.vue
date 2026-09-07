<script setup lang="ts">
import type { AboutPayload, PublicSection, SiteSettingsPublic } from '~/shared/types/site'

const props = defineProps<{
  section: PublicSection
  settings?: SiteSettingsPublic | null
}>()

const payload = computed(() => props.section.payload as AboutPayload)
const hasContent = computed(() => Boolean(payload.value.bio || payload.value.portraitPath))
</script>

<template>
  <section v-if="hasContent" id="about" class="border-b border-base-300">
    <div class="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeader :title="section.title" :subtitle="section.subtitle" />

      <div class="flex flex-col gap-10 md:flex-row md:items-start">
        <NuxtImg
          v-if="payload.portraitPath"
          :src="payload.portraitPath"
          :alt="`Portrait of ${settings?.name ?? 'site owner'}`"
          width="320"
          height="320"
          class="size-48 shrink-0 rounded-2xl border border-base-300 object-cover"
        />
        <div class="min-w-0">
          <p v-if="payload.bio" class="max-w-3xl whitespace-pre-line text-base-content/80">
            {{ payload.bio }}
          </p>
          <dl v-if="payload.stats?.length" class="mt-8 flex flex-wrap gap-4">
            <div
              v-for="stat in payload.stats"
              :key="stat.label"
              class="rounded-xl border border-base-300 bg-base-200/50 px-6 py-4"
            >
              <dt class="text-sm text-base-content/60">{{ stat.label }}</dt>
              <dd class="mt-1 text-2xl font-bold text-primary">{{ stat.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>
</template>
