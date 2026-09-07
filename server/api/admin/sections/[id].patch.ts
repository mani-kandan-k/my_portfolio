import { sectionUpdateSchema } from '~/shared/schemas/section'

// ADM-4/5/6: edit title/subtitle/visibility/payload of one section.
export default defineEventHandler(async (event) => {
  const id = parseIdParam(event)
  const { payload, ...rest } = await readPatchBody(event, sectionUpdateSchema)
  const existing = await prisma.section.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Section not found' })
  }
  const section = await prisma.section.update({
    where: { id },
    data: {
      ...rest,
      ...(payload !== undefined ? { payload: JSON.stringify(payload) } : {}),
    },
  })
  clearSiteCache()
  return {
    section: {
      id: section.id,
      key: section.key,
      title: section.title,
      subtitle: section.subtitle,
      order: section.order,
      visible: section.visible,
      payload: parsePayload(section.payload),
    },
  }
})
