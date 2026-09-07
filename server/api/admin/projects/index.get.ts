// ADM-9: list all projects (ordered) with JSON-text tech parsed.
export default defineEventHandler(async () => {
  const rows = await prisma.project.findMany({ orderBy: { order: 'asc' } })
  return { projects: rows.map(serializeProjectAdmin) }
})
