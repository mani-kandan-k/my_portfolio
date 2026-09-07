<script setup lang="ts">
import { ExternalLink, Github, MessageCircle } from 'lucide-vue-next'
import type { ProjectItem, PublicSection, SiteSettingsPublic } from '~/shared/types/site'

const props = defineProps<{
  section: PublicSection
  settings?: SiteSettingsPublic | null
}>()

const projects = computed(() => props.section.items as ProjectItem[])
</script>

<template>
  <section v-if="projects.length" id="projects" class="border-b border-base-300">
    <div class="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeader :title="section.title" :subtitle="section.subtitle" />

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="project in projects"
          :key="project.id"
          class="card border bg-base-100 transition-colors"
          :class="project.featured ? 'border-accent/60' : 'border-base-300'"
        >
          <div class="card-body gap-3 p-6">
            <div class="flex items-start justify-between gap-2">
              <h3 class="card-title text-lg">
                <NuxtLink
                  :to="`/projects/${project.slug}`"
                  class="transition-colors hover:text-primary"
                >
                  {{ project.title }}
                </NuxtLink>
              </h3>
              <span v-if="project.featured" class="badge badge-accent badge-sm shrink-0"
                >Featured</span
              >
            </div>

            <p v-if="project.summary" class="text-sm text-base-content/70">{{ project.summary }}</p>

            <ul v-if="project.tech.length" class="flex flex-wrap gap-1.5">
              <li
                v-for="t in project.tech"
                :key="t"
                class="badge badge-sm border-base-300 bg-base-200"
              >
                {{ t }}
              </li>
            </ul>

            <div
              class="mt-auto flex items-center justify-between pt-3 text-sm text-base-content/60"
            >
              <div class="flex items-center gap-4">
                <!-- LikeButton is a sibling of the card title link — clicks never navigate -->
                <LikeButton
                  :project-id="project.id"
                  :slug="project.slug"
                  :like-count="project.likeCount"
                  size="sm"
                />
                <NuxtLink
                  :to="`/projects/${project.slug}#comments`"
                  class="inline-flex items-center gap-1.5 transition-colors hover:text-base-content"
                  title="View comments"
                >
                  <MessageCircle class="size-4 text-accent" aria-hidden="true" />
                  {{ project.commentCount }}
                </NuxtLink>
              </div>
              <div class="flex items-center gap-1">
                <a
                  v-if="project.repoUrl"
                  :href="project.repoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-ghost btn-xs btn-circle"
                  :aria-label="`${project.title} repository`"
                >
                  <Github class="size-4" aria-hidden="true" />
                </a>
                <a
                  v-if="project.liveUrl"
                  :href="project.liveUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-ghost btn-xs btn-circle"
                  :aria-label="`${project.title} live site`"
                >
                  <ExternalLink class="size-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
