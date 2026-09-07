export default defineEventHandler(async (event) => {
  const id = parseIdParam(event)
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }
  await prisma.project.delete({ where: { id } })
  clearSiteCache()
  return { ok: true }
})
