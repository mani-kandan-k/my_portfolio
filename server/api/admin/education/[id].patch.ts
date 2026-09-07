import { educationUpdateSchema } from '~/shared/schemas/education'

export default defineEventHandler(async (event) => {
  const id = parseIdParam(event)
  const body = await readPatchBody(event, educationUpdateSchema)
  const existing = await prisma.education.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Education not found' })
  }
  const education = await prisma.education.update({ where: { id }, data: body })
  clearSiteCache()
  return { education }
})
