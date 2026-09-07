import { socialLinkUpdateSchema } from '~/shared/schemas/socialLink'

export default defineEventHandler(async (event) => {
  const id = parseIdParam(event)
  const body = await readPatchBody(event, socialLinkUpdateSchema)
  const existing = await prisma.socialLink.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Link not found' })
  }
  const link = await prisma.socialLink.update({ where: { id }, data: body })
  clearSiteCache()
  return { link }
})
