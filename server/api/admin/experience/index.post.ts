import { experienceCreateSchema } from '~/shared/schemas/experience'

export default defineEventHandler(async (event) => {
  const { bullets, tech, ...rest } = await readValidatedBody(event, (data) =>
    experienceCreateSchema.parse(data),
  )
  const max = await prisma.experience.aggregate({ _max: { order: true } })
  const experience = await prisma.experience.create({
    data: {
      ...rest,
      bullets: JSON.stringify(bullets),
      tech: JSON.stringify(tech),
      order: (max._max.order ?? -1) + 1,
    },
  })
  clearSiteCache()
  setResponseStatus(event, 201)
  return { experience: serializeExperienceAdmin(experience) }
})
