// Delete an uploaded image (orphan cleanup). Fields already referencing its URL
// are NOT rewritten — the URL will 404, so delete only unused uploads.
export default defineEventHandler(async (event): Promise<{ ok: true }> => {
  const id = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 404, statusMessage: 'Media not found' })
  }

  const media = await prisma.media.findUnique({ where: { id }, select: { id: true } })
  if (!media) {
    throw createError({ statusCode: 404, statusMessage: 'Media not found' })
  }

  await prisma.media.delete({ where: { id } })
  return { ok: true }
})
