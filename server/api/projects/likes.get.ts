import type { LikedProjectsResponse } from '~/shared/types/engagement'

// ENG-1/6: projects the signed-in user has liked, so LikeButton can render its
// initial state. Anonymous visitors get an empty list (200, not 401) to keep
// client logic simple.
export default defineEventHandler(async (event): Promise<LikedProjectsResponse> => {
  const { user } = await getUserSession(event)
  if (!user) return { likedProjectIds: [] }

  const reactions = await prisma.reaction.findMany({
    where: { userId: user.id },
    select: { projectId: true },
  })
  return { likedProjectIds: reactions.map((r) => r.projectId) }
})
