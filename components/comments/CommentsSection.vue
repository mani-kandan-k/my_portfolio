<script setup lang="ts">
import { Github, MessageCircle } from 'lucide-vue-next'
import type { CommentItem, CommentsPage } from '~/shared/types/engagement'

// ENG-2/3/4: comments orchestrator for the project detail page. Fetches
// client-side ($fetch on mount + on slug change) so the session-aware canDelete
// flags and pagination always reflect the current viewer. Emits `updated` with
// the live total so the page header count stays in sync.
const props = defineProps<{ slug: string }>()
const emit = defineEmits<{ updated: [count: number] }>()

const { loggedIn } = useUserSession()
const toast = useToast()

const comments = ref<CommentItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(true)
const loadingMore = ref(false)
const loadError = ref('')

const hasMore = computed(() => comments.value.length < total.value)

async function fetchPage(targetPage: number): Promise<CommentsPage> {
  return await $fetch<CommentsPage>(
    `/api/projects/${encodeURIComponent(props.slug)}/comments`,
    { query: { page: targetPage } },
  )
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await fetchPage(1)
    comments.value = res.comments
    total.value = res.total
    page.value = res.page
    pageSize.value = res.pageSize
    emit('updated', res.total)
  } catch (error) {
    loadError.value = apiErrorMessage(error, 'Failed to load comments')
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.slug, load)

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    const res = await fetchPage(page.value + 1)
    comments.value = [...comments.value, ...res.comments]
    total.value = res.total
    page.value = res.page
  } catch (error) {
    toast.error(apiErrorMessage(error, 'Failed to load more comments'))
  } finally {
    loadingMore.value = false
  }
}

function onPosted(comment: CommentItem) {
  comments.value = [comment, ...comments.value]
  total.value += 1
  emit('updated', total.value)
}

function onDeleted(id: number) {
  comments.value = comments.value.filter((comment) => comment.id !== id)
  total.value = Math.max(0, total.value - 1)
  emit('updated', total.value)
}
</script>

<template>
  <section id="comments" aria-labelledby="comments-heading" class="mt-12 scroll-mt-24 border-t border-base-300 pt-8">
    <h2 id="comments-heading" class="flex items-center gap-2 text-xl font-bold">
      <MessageCircle class="size-5 text-accent" aria-hidden="true" />
      Comments
      <span v-if="!loading" class="text-base font-normal text-base-content/60">({{ total }})</span>
    </h2>

    <div class="mt-5">
      <CommentsCommentComposer v-if="loggedIn" :slug="slug" @posted="onPosted" />
      <div v-else class="rounded-box border border-base-300 p-4 text-sm text-base-content/70">
        <p class="mb-3">Sign in with GitHub to comment.</p>
        <a href="/api/auth/github" rel="nofollow" class="btn btn-outline btn-sm gap-2">
          <Github class="size-4" aria-hidden="true" />
          Sign in with GitHub
        </a>
      </div>
    </div>

    <div class="mt-6">
      <div v-if="loading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-md" aria-label="Loading comments" />
      </div>
      <div v-else-if="loadError" class="alert alert-error">
        <span>{{ loadError }}</span>
      </div>
      <p v-else-if="comments.length === 0" class="py-4 text-sm text-base-content/60">
        No comments yet — be the first.
      </p>
      <CommentsCommentList
        v-else
        :comments="comments"
        :has-more="hasMore"
        :loading-more="loadingMore"
        @deleted="onDeleted"
        @load-more="loadMore"
      />
    </div>
  </section>
</template>
