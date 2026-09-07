// ADM-7: list all skills (ordered) for the admin panel.
export default defineEventHandler(async () => {
  const skills = await prisma.skill.findMany({ orderBy: { order: 'asc' } })
  return { skills }
})
