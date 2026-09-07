export default defineEventHandler(async (event) => {
  const id = parseIdParam(event)
  const existing = await prisma.socialLink.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Link not found' })
  }
  await prisma.socialLink.delete({ where: { id } })
  clearSiteCache()
  return { ok: true }
})
