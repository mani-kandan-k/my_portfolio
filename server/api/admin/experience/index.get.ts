// ADM-8: list all experience entries (ordered) with JSON-text fields parsed.
export default defineEventHandler(async () => {
  const rows = await prisma.experience.findMany({ orderBy: { order: 'asc' } })
  return { experience: rows.map(serializeExperienceAdmin) }
})
