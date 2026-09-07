export default defineEventHandler(async (event) => {
  const id = parseIdParam(event)
  const existing = await prisma.skill.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Skill not found' })
  }
  await prisma.skill.delete({ where: { id } })
  clearSiteCache()
  return { ok: true }
})
