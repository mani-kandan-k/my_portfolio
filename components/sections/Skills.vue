<script setup lang="ts">
import type { PublicSection, SiteSettingsPublic, SkillItem } from '~/shared/types/site'

const props = defineProps<{
  section: PublicSection
  settings?: SiteSettingsPublic | null
}>()

const skills = computed(() => props.section.items as SkillItem[])

const categories = computed(() => {
  const groups = new Map<string, SkillItem[]>()
  for (const skill of skills.value) {
    const list = groups.get(skill.category) ?? []
    list.push(skill)
    groups.set(skill.category, list)
  }
  return [...groups.entries()].map(([name, items]) => ({ name, items }))
})

function levelLabel(proficiency: number): string {
  return `Proficiency ${proficiency} out of 5`
}
</script>

<template>
  <section v-if="skills.length" id="skills" class="border-b border-base-300">
    <div class="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeader :title="section.title" :subtitle="section.subtitle" />

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="category in categories"
          :key="category.name"
          class="rounded-xl border border-base-300 bg-base-200/50 p-6"
        >
          <h3 class="text-sm font-semibold uppercase tracking-wide text-base-content/60">
            {{ category.name }}
          </h3>
          <ul class="mt-4 flex flex-wrap gap-2">
            <li v-for="skill in category.items" :key="skill.id">
              <span
                class="badge badge-lg gap-2 border-base-300 bg-base-100"
                :title="levelLabel(skill.proficiency)"
              >
                {{ skill.name }}
                <span class="flex items-center gap-0.5" aria-hidden="true">
                  <span
                    v-for="n in 5"
                    :key="n"
                    class="size-1.5 rounded-full"
                    :class="n <= skill.proficiency ? 'bg-accent' : 'bg-base-300'"
                  />
                </span>
                <span class="sr-only">{{ levelLabel(skill.proficiency) }}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
