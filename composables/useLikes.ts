import type { LikeToggleResponse, LikedProjectsResponse } from '~/shared/types/engagement'

// ENG-1/6: shared liked-state for the signed-in user. Loaded lazily — only when
// loggedIn; SSR awaits it so liked buttons paint filled in the first HTML (no
// flash), and anon visitors never hit the endpoint. Client-side it refetches on
// login and clears on logout. LikeButton renders from isLiked() and calls
// toggleLike(), which flips state optimistically and rolls back on error.
//
// Async: callers in <script setup> must `await useLikes()`.
export async function useLikes() {
  const { loggedIn } = useUserSession()
  const likedProjectIds = useState<Set<number>>('liked-project-ids', () => new Set())
  const pendingProjectIds = useState<Set<number>>('pending-like-project-ids', () => new Set())

  // Keyed fetch shared (and deduped) across every LikeButton instance; the
  // default fills synchronously so anon/SSR renders never suspend.
  const likesFetch = useFetch<LikedProjectsResponse>('/api/projects/likes', {
    key: 'liked-project-ids',
    immediate: loggedIn.value,
    watch: false,
    default: () => ({ likedProjectIds: [] }),
  })
  const { data, refresh: refetchLikes } = likesFetch

  watch(
    data,
    (d) => {
      if (d) likedProjectIds.value = new Set(d.likedProjectIds)
    },
    { immediate: true },
  )

  // Block SSR (signed-in only) until the fetch resolves, so the rendered markup
  // already carries the liked state. The sync is explicit: pre-flush watchers
  // are not guaranteed to run between an awaited setup and SSR render.
  if (import.meta.server && loggedIn.value) {
    await likesFetch
    if (data.value) likedProjectIds.value = new Set(data.value.likedProjectIds)
  }

  if (import.meta.client) {
    watch(loggedIn, (isLoggedIn, wasLoggedIn) => {
      if (isLoggedIn && !wasLoggedIn) refetchLikes()
      else if (!isLoggedIn) {
        likedProjectIds.value = new Set()
        data.value = { likedProjectIds: [] }
      }
    })
  }

  function setLiked(projectId: number, liked: boolean) {
    const next = new Set(likedProjectIds.value)
    if (liked) next.add(projectId)
    else next.delete(projectId)
    likedProjectIds.value = next
    // Keep the fetch cache in sync so a remount (client navigation) doesn't
    // clobber optimistic state with stale data.
    data.value = { likedProjectIds: [...next] }
  }

  const isLiked = (projectId: number) => likedProjectIds.value.has(projectId)
  const isPending = (projectId: number) => pendingProjectIds.value.has(projectId)

  /** Optimistic toggle; resolves with the server response, rejects (after rollback) on error. */
  async function toggleLike(project: {
    id: number
    slug: string
  }): Promise<LikeToggleResponse | undefined> {
    if (pendingProjectIds.value.has(project.id)) return undefined

    const wasLiked = isLiked(project.id)
    setLiked(project.id, !wasLiked)
    pendingProjectIds.value = new Set(pendingProjectIds.value).add(project.id)

    try {
      const res = await $fetch<LikeToggleResponse>(
        `/api/projects/${encodeURIComponent(project.slug)}/like`,
        { method: wasLiked ? 'DELETE' : 'POST' },
      )
      setLiked(project.id, res.liked)
      return res
    } catch (error) {
      setLiked(project.id, wasLiked) // roll back the optimistic flip
      throw error
    } finally {
      const next = new Set(pendingProjectIds.value)
      next.delete(project.id)
      pendingProjectIds.value = next
    }
  }

  return { likedProjectIds: readonly(likedProjectIds), isLiked, isPending, toggleLike }
}
