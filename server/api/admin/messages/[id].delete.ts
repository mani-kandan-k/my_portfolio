// ADM-21: hard delete a contact message. 404 when missing. Admin guard is
// global (server/middleware/admin.ts).
export default defineEventHandler(async (event): Promise<{ ok: true }> => {
  const id = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  }

  const existing = await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  }

  await prisma.contactMessage.delete({ where: { id } })
  return { ok: true }
})
