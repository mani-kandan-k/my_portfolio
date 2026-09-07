<script setup lang="ts">
import type { AdminProject } from '~/shared/types/admin'
import type { AdminCommentItem } from '~/shared/types/engagement'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin · Comments',
  robots: 'noindex, nofollow',
})

// ADM-19: comment moderation — newest first, filterable by project, soft delete.
const toast = useToast()
const projectFilter = ref('')

const { data: projectsData } = await useFetch<{ projects: AdminProject[] }>('/api/admin/projects')
const projects = computed(() => projectsData.value?.projects ?? [])

const {
  data,
  status,
  error,
  refresh,
} = await useFetch<{ comments: AdminCommentItem[] }>('/api/admin/comments', {
  query: computed(() => (projectFilter.value ? { projectId: projectFilter.value } : {})),
})
const comments = computed(() => data.value?.comments ?? [])

async function remove(id: number) {
  try {
    await $fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
    toast.success('Comment deleted')
    // Mark locally instead of refetching — the row stays visible with its badge.
    const row = data.value?.comments.find((comment) => comment.id === id)
    if (row) row.deletedAt = new Date().toISOString()
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to delete comment'))
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Comments</h1>
        <p class="mt-1 text-sm text-base-content/70">
          Moderate project comments — deleted ones stay listed here but are hidden publicly.
        </p>
      </div>
      <label class="form-control w-full max-w-xs">
        <div class="label py-1"><span class="label-text">Filter by project</span></div>
        <select v-model="projectFilter" class="select select-bordered select-sm w-full">
          <option value="">All projects</option>
          <option v-for="project in projects" :key="project.id" :value="String(project.id)">
            {{ project.title }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" aria-label="Loading comments" />
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>Failed to load comments: {{ error.statusMessage ?? error.message }}</span>
      <button type="button" class="btn btn-ghost btn-xs" @click="refresh()">Retry</button>
    </div>
    <p v-else-if="comments.length === 0" class="text-sm text-base-content/60">No comments yet.</p>

    <div v-else class="overflow-x-auto rounded-box border border-base-300">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Author</th>
            <th>Project</th>
            <th>Comment</th>
            <th>Posted</th>
            <th>State</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="comment in comments" :key="comment.id">
            <td>
              <span class="flex items-center gap-2">
                <img
                  v-if="comment.user.avatarUrl"
                  :src="comment.user.avatarUrl"
                  :alt="`${comment.user.username}'s avatar`"
                  class="size-6 rounded-full"
                  width="24"
                  height="24"
                  loading="lazy"
                />
                <span
                  v-else
                  class="flex size-6 items-center justify-center rounded-full bg-base-300 text-xs font-semibold"
                  aria-hidden="true"
                >
                  {{ comment.user.username.charAt(0).toUpperCase() }}
                </span>
                <span class="font-medium">{{ comment.user.username }}</span>
              </span>
            </td>
            <td>
              <NuxtLink
                :to="`/projects/${comment.project.slug}`"
                class="link-hover link"
                target="_blank"
              >
                {{ comment.project.title }}
              </NuxtLink>
            </td>
            <td class="max-w-md">
              <span class="line-clamp-2 whitespace-pre-line">{{ comment.body }}</span>
            </td>
            <td class="whitespace-nowrap">
              <time :datetime="comment.createdAt" :title="new Date(comment.createdAt).toLocaleString()">
                {{ relativeTime(comment.createdAt) }}
              </time>
            </td>
            <td>
              <span v-if="comment.deletedAt" class="badge badge-ghost badge-sm">deleted</span>
              <span v-else class="badge badge-success badge-sm">live</span>
            </td>
            <td>
              <AdminDeleteButton v-if="!comment.deletedAt" @confirm="remove(comment.id)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
