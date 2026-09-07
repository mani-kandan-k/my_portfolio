<script setup lang="ts">
import type { Component } from 'vue'
import {
  SectionsAbout,
  SectionsContact,
  SectionsEducation,
  SectionsExperience,
  SectionsHero,
  SectionsProjects,
  SectionsSiteFooter,
  SectionsSkills,
} from '#components'

const { settings, sections, ready } = useSite()
// 8.2: the static-vs-generated OG decision below needs the real settings, so
// wait for the shared payload before registering anything.
await ready

// Sections render in DB order (PUB-1/2); unknown keys render nothing.
const sectionComponents: Record<string, Component> = {
  hero: SectionsHero,
  about: SectionsAbout,
  skills: SectionsSkills,
  experience: SectionsExperience,
  projects: SectionsProjects,
  education: SectionsEducation,
  contact: SectionsContact,
  footer: SectionsSiteFooter,
}

// SEO from SiteSettings (PUB-6), falling back to name/role/tagline.
// A per-page override for '/' (ADM-13) wins over the defaults.
const override = useSeoOverride('/')
const title = computed(
  () =>
    override.value?.title ||
    settings.value?.seoTitle ||
    [settings.value?.name, settings.value?.role].filter(Boolean).join(' — ') ||
    'Portfolio',
)
const description = computed(
  () =>
    override.value?.description ||
    settings.value?.seoDescription ||
    settings.value?.tagline ||
    'Personal portfolio',
)

// Static OG image (settings default or per-page override) wins when configured;
// otherwise the generated card below is used (8.2/PUB-6).
const staticOgImage = computed(
  () => override.value?.ogImagePath || settings.value?.seoOgImagePath || undefined,
)

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: () => staticOgImage.value,
  twitterImage: () => staticOgImage.value,
  twitterCard: 'summary_large_image',
})

if (!staticOgImage.value) {
  const { data: brand } = useBrandColors()
  await brand
  defineOgImage('Portfolio', {
    title: title.value,
    description: description.value,
    themeColor: brand.value?.primaryColor,
  })
}
</script>

<template>
  <div>
    <template v-for="section in sections" :key="section.key">
      <component
        :is="sectionComponents[section.key]"
        v-if="sectionComponents[section.key]"
        :section="section"
        :settings="settings"
      />
    </template>
  </div>
</template>
