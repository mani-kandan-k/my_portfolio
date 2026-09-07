import type { LikeToggleResponse } from '~/shared/types/engagement'

// ENG-1: like a project (one per user — upsert makes repeat POSTs idempotent).
export default defineEventHandler(async (event): Promise<LikeToggleResponse> => {
  const user = await requireUser(event)
  await rateLimit(event, { key: 'likes', limit: 60, windowMs: 10 * 60_000, withUser: true })

  const slug = getRouterParam(event, 'slug')
  const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  await prisma.reaction.upsert({
    where: { userId_projectId: { userId: user.id, projectId: project.id } },
    update: {},
    create: { userId: user.id, projectId: project.id },
  })

  const likeCount = await prisma.reaction.count({ where: { projectId: project.id } })
  clearSiteCache() // like counts live in the public payload
  return { liked: true, likeCount }
})
