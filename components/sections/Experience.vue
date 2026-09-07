<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'
import type { ExperienceItem, PublicSection, SiteSettingsPublic } from '~/shared/types/site'

const props = defineProps<{
  section: PublicSection
  settings?: SiteSettingsPublic | null
}>()

const experiences = computed(() => props.section.items as ExperienceItem[])

function period(item: ExperienceItem): string {
  return `${item.startDate} — ${item.endDate ?? 'Present'}`
}
</script>

<template>
  <section v-if="experiences.length" id="experience" class="border-b border-base-300">
    <div class="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeader :title="section.title" :subtitle="section.subtitle" />

      <ol class="relative space-y-10 border-l-2 border-base-300 pl-6 sm:pl-8">
        <li v-for="item in experiences" :key="item.id" class="relative">
          <span
            class="absolute top-1.5 -left-[31px] size-3 rounded-full bg-primary ring-4 ring-base-100 sm:-left-[39px]"
            aria-hidden="true"
          />
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 class="text-lg font-semibold">{{ item.role }}</h3>
            <span class="font-medium text-primary">{{ item.company }}</span>
          </div>
          <p class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/60">
            <span>{{ period(item) }}</span>
            <span v-if="item.location" class="inline-flex items-center gap-1">
              <MapPin class="size-3.5" aria-hidden="true" />
              {{ item.location }}
            </span>
          </p>
          <ul
            v-if="item.bullets.length"
            class="mt-3 list-disc space-y-1.5 pl-5 text-base-content/80"
          >
            <li v-for="(bullet, i) in item.bullets" :key="i">{{ bullet }}</li>
          </ul>
          <ul v-if="item.tech.length" class="mt-3 flex flex-wrap gap-2">
            <li v-for="t in item.tech" :key="t" class="badge badge-sm border-base-300 bg-base-200">
              {{ t }}
            </li>
          </ul>
        </li>
      </ol>
    </div>
  </section>
</template>
