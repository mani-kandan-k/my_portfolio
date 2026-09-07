<script setup lang="ts">
import type { CommentItem } from '~/shared/types/engagement'

// ENG-3/4: newest-first comment rows with avatar, username, relative time and
// (when canDelete) the two-step DeleteButton. Bodies render via {{ }} only —
// never v-html (ENG-5). "Load more" appends the next page.
defineProps<{
  comments: CommentItem[]
  hasMore: boolean
  loadingMore: boolean
}>()
const emit = defineEmits<{ deleted: [id: number]; loadMore: [] }>()

const toast = useToast()

async function remove(id: number) {
  try {
    await $fetch(`/api/comments/${id}`, { method: 'DELETE' })
    emit('deleted', id)
    toast.success('Comment deleted')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'Failed to delete comment'))
  }
}
</script>

<template>
  <div>
    <ul class="divide-y divide-base-300">
      <li v-for="comment in comments" :key="comment.id" class="flex gap-3 py-4">
        <img
          v-if="comment.user.avatarUrl"
          :src="comment.user.avatarUrl"
          :alt="`${comment.user.username}'s avatar`"
          class="size-8 shrink-0 rounded-full"
          width="32"
          height="32"
          loading="lazy"
        />
        <span
          v-else
          class="flex size-8 shrink-0 items-center justify-center rounded-full bg-base-300 text-sm font-semibold"
          aria-hidden="true"
        >
          {{ comment.user.username.charAt(0).toUpperCase() }}
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span class="text-sm font-semibold">{{ comment.user.username }}</span>
            <time
              :datetime="comment.createdAt"
              :title="new Date(comment.createdAt).toLocaleString()"
              class="text-xs text-base-content/50"
            >
              {{ relativeTime(comment.createdAt) }}
            </time>
            <span class="flex-1" />
            <AdminDeleteButton v-if="comment.canDelete" @confirm="remove(comment.id)" />
          </div>
          <p class="mt-1 whitespace-pre-line text-sm text-base-content/80">{{ comment.body }}</p>
        </div>
      </li>
    </ul>

    <div v-if="hasMore" class="pt-2 text-center">
      <button
        type="button"
        class="btn btn-outline btn-sm"
        :disabled="loadingMore"
        @click="emit('loadMore')"
      >
        <span v-if="loadingMore" class="loading loading-spinner loading-xs" aria-hidden="true" />
        {{ loadingMore ? 'Loading…' : 'Load more' }}
      </button>
    </div>
  </div>
</template>
