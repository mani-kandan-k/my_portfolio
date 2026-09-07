export default defineEventHandler(async (event) => {
  const id = parseIdParam(event)
  const existing = await prisma.experience.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Experience not found' })
  }
  await prisma.experience.delete({ where: { id } })
  clearSiteCache()
  return { ok: true }
})
