// ADM-10: list all education entries (ordered).
export default defineEventHandler(async () => {
  const education = await prisma.education.findMany({ orderBy: { order: 'asc' } })
  return { education }
})
