<script setup lang="ts">
import { ArrowLeft, ExternalLink, Github, MessageCircle } from 'lucide-vue-next'
import type { ProjectDetail } from '~/shared/types/site'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const { data: project, error } = await useFetch<ProjectDetail>(
  () => `/api/public/project/${encodeURIComponent(slug.value)}`,
  { key: `public-project-${slug.value}` },
)

if (error.value || !project.value) {
  throw createError({
    statusCode: error.value?.statusCode ?? 404,
    statusMessage: 'Project not found',
    fatal: true,
  })
}

// Live comment count: starts at the server value, then CommentsSection reports
// post/delete/total via `updated` (ENG-7 live-like feel).
const liveCommentCount = ref(project.value?.commentCount ?? 0)
watch(project, (p) => {
  if (p) liveCommentCount.value = p.commentCount
})

// Project fields provide the defaults; a per-page override for
// '/projects/<slug>' (ADM-13) wins per field.
const { ready } = useSite()
const override = useSeoOverride(() => `/projects/${slug.value}`)
await ready // settings needed for the static-vs-generated OG decision (8.2)

const ogTitle = computed(
  () => override.value?.title || (project.value ? `${project.value.title} — Projects` : 'Project'),
)
const ogDescription = computed(() => override.value?.description || project.value?.summary || undefined)
// Static OG image (per-page override, else the project's hero image) wins when
// configured; otherwise the generated card below is used (8.2/PUB-6).
const staticOgImage = computed(
  () => override.value?.ogImagePath || project.value?.heroImagePath || undefined,
)

useSeoMeta({
  title: ogTitle,
  description: ogDescription,
  ogTitle: () => override.value?.title || project.value?.title,
  ogDescription,
  ogImage: () => staticOgImage.value,
  twitterImage: () => staticOgImage.value,
  twitterCard: 'summary_large_image',
})

if (!staticOgImage.value) {
  const { data: brand } = useBrandColors()
  await brand
  defineOgImage('Portfolio', {
    title: ogTitle.value,
    description: ogDescription.value,
    themeColor: brand.value?.primaryColor,
  })
}
</script>

<template>
  <article v-if="project" class="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
    <NuxtLink
      to="/#projects"
      class="inline-flex items-center gap-2 text-sm font-medium text-base-content/60 transition-colors hover:text-primary"
    >
      <ArrowLeft class="size-4" aria-hidden="true" />
      Back to projects
    </NuxtLink>

    <header class="mt-8">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">{{ project.title }}</h1>
        <span v-if="project.featured" class="badge badge-accent badge-sm">Featured</span>
      </div>
      <p v-if="project.summary" class="mt-3 text-lg text-base-content/70">{{ project.summary }}</p>

      <div class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-base-content/60">
        <LikeButton :project-id="project.id" :slug="project.slug" :like-count="project.likeCount" />
        <a
          href="#comments"
          class="inline-flex items-center gap-1.5 transition-colors hover:text-base-content"
          title="Jump to comments"
        >
          <MessageCircle class="size-4 text-accent" aria-hidden="true" />
          {{ liveCommentCount }}
        </a>
        <a
          v-if="project.repoUrl"
          :href="project.repoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <Github class="size-4" aria-hidden="true" />
          Repository
        </a>
        <a
          v-if="project.liveUrl"
          :href="project.liveUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <ExternalLink class="size-4" aria-hidden="true" />
          Live site
        </a>
      </div>
    </header>

    <NuxtImg
      v-if="project.heroImagePath"
      :src="project.heroImagePath"
      :alt="`${project.title} hero image`"
      width="1536"
      height="864"
      class="mt-8 w-full rounded-2xl border border-base-300 object-cover"
    />

    <ul v-if="project.tech.length" class="mt-8 flex flex-wrap gap-2">
      <li v-for="t in project.tech" :key="t" class="badge badge-lg border-base-300 bg-base-200">
        {{ t }}
      </li>
    </ul>

    <div
      v-if="project.description"
      class="mt-8 whitespace-pre-line leading-relaxed text-base-content/80"
    >
      {{ project.description }}
    </div>

    <CommentsSection :slug="project.slug" @updated="liveCommentCount = $event" />
  </article>
</template>
