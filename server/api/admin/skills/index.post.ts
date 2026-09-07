import { skillCreateSchema } from '~/shared/schemas/skill'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (data) => skillCreateSchema.parse(data))
  const max = await prisma.skill.aggregate({ _max: { order: true } })
  const skill = await prisma.skill.create({
    data: { ...body, order: (max._max.order ?? -1) + 1 },
  })
  clearSiteCache()
  setResponseStatus(event, 201)
  return { skill }
})
