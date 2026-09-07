<script setup lang="ts">
import { Heart } from 'lucide-vue-next'

// ENG-1/6: like/unlike with optimistic UI — the displayed count is the server
// prop plus a pending delta until the response reconciles it. Anonymous clicks
// go through a full navigation into the GitHub OAuth flow.
const props = withDefaults(
  defineProps<{
    projectId: number
    slug: string
    likeCount: number
    size?: 'md' | 'sm'
  }>(),
  { size: 'md' },
)

const { loggedIn } = useUserSession()
const { isLiked, isPending, toggleLike } = await useLikes()
const toast = useToast()

const optimisticDelta = ref<number | null>(null)
const liked = computed(() => isLiked(props.projectId))
const pending = computed(() => isPending(props.projectId))
const displayCount = computed(() =>
  optimisticDelta.value === null ? props.likeCount : props.likeCount + optimisticDelta.value,
)

// Fresh server data supersedes any reconciled delta (e.g. after slug navigation
// or a refetched public payload).
watch(
  () => props.likeCount,
  () => {
    if (!pending.value) optimisticDelta.value = null
  },
)

async function onClick() {
  if (!loggedIn.value) {
    window.location.assign('/api/auth/github')
    return
  }
  if (pending.value) return // serialize: one in-flight request per project

  const wasLiked = liked.value
  optimisticDelta.value = (optimisticDelta.value ?? 0) + (wasLiked ? -1 : 1)
  try {
    const res = await toggleLike({ id: props.projectId, slug: props.slug })
    if (res) optimisticDelta.value = res.likeCount - props.likeCount
  } catch (error) {
    optimisticDelta.value = null // liked state already rolled back by toggleLike
    toast.error(apiErrorMessage(error, 'Failed to update like'))
  }
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center transition-colors"
    :class="[
      size === 'sm' ? 'gap-1 text-xs' : 'gap-1.5 text-sm',
      pending ? 'opacity-60' : 'hover:text-accent',
    ]"
    :aria-pressed="liked"
    :title="loggedIn ? (liked ? 'Unlike' : 'Like') : 'Sign in to like'"
    @click="onClick"
  >
    <Heart
      :class="[size === 'sm' ? 'size-3.5' : 'size-4', liked ? 'fill-current text-accent' : 'text-accent']"
      aria-hidden="true"
    />
    {{ displayCount }}
  </button>
</template>
