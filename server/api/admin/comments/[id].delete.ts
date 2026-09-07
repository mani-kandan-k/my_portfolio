// ADM-19: admin soft delete of any comment. 404 when missing; idempotent when
// already deleted. Admin guard is global (server/middleware/admin.ts).
export default defineEventHandler(async (event): Promise<{ ok: true }> => {
  const id = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 404, statusMessage: 'Comment not found' })
  }

  const comment = await prisma.comment.findUnique({ where: { id }, select: { deletedAt: true } })
  if (!comment) {
    throw createError({ statusCode: 404, statusMessage: 'Comment not found' })
  }

  if (!comment.deletedAt) {
    await prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } })
    clearSiteCache() // comment counts live in the public payload
  }
  return { ok: true }
})
