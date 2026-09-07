import { skillUpdateSchema } from '~/shared/schemas/skill'

export default defineEventHandler(async (event) => {
  const id = parseIdParam(event)
  const body = await readPatchBody(event, skillUpdateSchema)
  const existing = await prisma.skill.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Skill not found' })
  }
  const skill = await prisma.skill.update({ where: { id }, data: body })
  clearSiteCache()
  return { skill }
})
