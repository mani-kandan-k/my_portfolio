import { experienceUpdateSchema } from '~/shared/schemas/experience'

export default defineEventHandler(async (event) => {
  const id = parseIdParam(event)
  const { bullets, tech, ...rest } = await readPatchBody(event, experienceUpdateSchema)
  const existing = await prisma.experience.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Experience not found' })
  }
  const experience = await prisma.experience.update({
    where: { id },
    data: {
      ...rest,
      ...(bullets !== undefined ? { bullets: JSON.stringify(bullets) } : {}),
      ...(tech !== undefined ? { tech: JSON.stringify(tech) } : {}),
    },
  })
  clearSiteCache()
  return { experience: serializeExperienceAdmin(experience) }
})
