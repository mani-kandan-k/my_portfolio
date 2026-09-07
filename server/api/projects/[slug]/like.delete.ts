import type { LikeToggleResponse } from '~/shared/types/engagement'

// ENG-1: unlike a project (deleteMany keeps it idempotent when not liked).
export default defineEventHandler(async (event): Promise<LikeToggleResponse> => {
  const user = await requireUser(event)
  await rateLimit(event, { key: 'likes', limit: 60, windowMs: 10 * 60_000, withUser: true })

  const slug = getRouterParam(event, 'slug')
  const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  await prisma.reaction.deleteMany({ where: { userId: user.id, projectId: project.id } })

  const likeCount = await prisma.reaction.count({ where: { projectId: project.id } })
  clearSiteCache() // like counts live in the public payload
  return { liked: false, likeCount }
})
