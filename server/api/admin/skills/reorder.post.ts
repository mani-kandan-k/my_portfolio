import { reorderSchema } from '~/shared/schemas/section'

// Swap-based reorder: ids must be exactly the current skill id set; each skill's
// order becomes its index in the submitted array.
export default defineEventHandler(async (event) => {
  const { ids } = await readValidatedBody(event, (data) => reorderSchema.parse(data))
  const rows = await prisma.skill.findMany({ select: { id: true } })
  validateIdsPresent(rows, ids)
  await prisma.$transaction(
    ids.map((id, index) => prisma.skill.update({ where: { id }, data: { order: index } })),
  )
  clearSiteCache()
  return { ok: true }
})
