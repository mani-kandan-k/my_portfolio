// ADM-3/13: full SiteSettings row (id=1) with seoOverrides parsed to an object.
export default defineEventHandler(async () => {
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  if (!row) {
    throw createError({ statusCode: 404, message: 'Settings not found' })
  }
  return { settings: { ...row, seoOverrides: parseSeoOverrides(row.seoOverrides) } }
})
