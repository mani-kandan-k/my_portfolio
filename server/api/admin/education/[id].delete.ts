export default defineEventHandler(async (event) => {
  const id = parseIdParam(event)
  const existing = await prisma.education.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Education not found' })
  }
  await prisma.education.delete({ where: { id } })
  clearSiteCache()
  return { ok: true }
})
