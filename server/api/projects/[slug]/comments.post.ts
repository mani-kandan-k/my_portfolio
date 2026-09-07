import { commentCreateSchema } from '~/shared/schemas/engagement'
import type { CommentItem } from '~/shared/types/engagement'

// ENG-3/5: post a comment — signed-in users only, 1–1000 trimmed chars (zod),
// 10/hour per user (AUTH-9). Returns the created comment in CommentItem shape.
export default defineEventHandler(async (event): Promise<{ comment: CommentItem }> => {
  const user = await requireUser(event)
  await rateLimit(event, { key: 'comments', limit: 10, windowMs: 60 * 60_000, withUser: true })

  const { body } = await readValidatedBody(event, (payload) => commentCreateSchema.parse(payload))

  const slug = getRouterParam(event, 'slug')
  const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  const comment = await prisma.comment.create({
    data: { projectId: project.id, userId: user.id, body },
    include: { user: { select: commentUserSelect } },
  })

  clearSiteCache() // comment counts live in the public payload
  setResponseStatus(event, 201)
  return { comment: serializeComment(comment, true) }
})
