<script setup lang="ts">
import type { EducationItem, PublicSection, SiteSettingsPublic } from '~/shared/types/site'

const props = defineProps<{
  section: PublicSection
  settings?: SiteSettingsPublic | null
}>()

const educations = computed(() => props.section.items as EducationItem[])

function period(item: EducationItem): string {
  return `${item.startDate} — ${item.endDate ?? 'Present'}`
}
</script>

<template>
  <section v-if="educations.length" id="education" class="border-b border-base-300">
    <div class="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeader :title="section.title" :subtitle="section.subtitle" />

      <ol class="space-y-6">
        <li
          v-for="item in educations"
          :key="item.id"
          class="rounded-xl border border-base-300 bg-base-200/50 p-6"
        >
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 class="text-lg font-semibold">{{ item.institution }}</h3>
            <span class="text-sm text-base-content/60">{{ period(item) }}</span>
          </div>
          <p class="mt-1 font-medium text-primary">{{ item.degree }}</p>
          <p v-if="item.notes" class="mt-2 text-sm text-base-content/70">{{ item.notes }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
