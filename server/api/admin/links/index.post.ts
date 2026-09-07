import { socialLinkCreateSchema } from '~/shared/schemas/socialLink'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (data) => socialLinkCreateSchema.parse(data))
  const max = await prisma.socialLink.aggregate({ _max: { order: true } })
  const link = await prisma.socialLink.create({
    data: { ...body, order: (max._max.order ?? -1) + 1 },
  })
  clearSiteCache()
  setResponseStatus(event, 201)
  return { link }
})
