// ENG-4: soft delete own comment; admins can delete any (ADM-19 uses the admin
// route, but this one authorizes admins too). 404 when missing or already deleted.
export default defineEventHandler(async (event): Promise<{ ok: true }> => {
  const user = await requireUser(event)

  const id = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 404, statusMessage: 'Comment not found' })
  }

  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment || comment.deletedAt) {
    throw createError({ statusCode: 404, statusMessage: 'Comment not found' })
  }
  if (comment.userId !== user.id && user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden — not your comment' })
  }

  await prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } })
  clearSiteCache() // comment counts live in the public payload
  return { ok: true }
})
