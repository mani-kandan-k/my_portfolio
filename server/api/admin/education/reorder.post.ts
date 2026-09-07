import { reorderSchema } from '~/shared/schemas/section'

export default defineEventHandler(async (event) => {
  const { ids } = await readValidatedBody(event, (data) => reorderSchema.parse(data))
  const rows = await prisma.education.findMany({ select: { id: true } })
  validateIdsPresent(rows, ids)
  await prisma.$transaction(
    ids.map((id, index) => prisma.education.update({ where: { id }, data: { order: index } })),
  )
  clearSiteCache()
  return { ok: true }
})
