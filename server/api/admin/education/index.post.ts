import { educationCreateSchema } from '~/shared/schemas/education'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (data) => educationCreateSchema.parse(data))
  const max = await prisma.education.aggregate({ _max: { order: true } })
  const education = await prisma.education.create({
    data: { ...body, order: (max._max.order ?? -1) + 1 },
  })
  clearSiteCache()
  setResponseStatus(event, 201)
  return { education }
})
