import { z } from 'zod'
import { assetPath } from '~/shared/schemas/common'
import { settingsUpdateSchema } from '~/shared/schemas/settings'

// ADM-13: per-page SEO overrides — map of path → partial SEO fields.
const pageSeoSchema = z.object({
  title: z.string().trim().max(120).optional(),
  description: z.string().trim().max(300).optional(),
  ogImagePath: assetPath.optional(),
})

const settingsPatchSchema = settingsUpdateSchema.partial().extend({
  seoOverrides: z.record(z.string(), pageSeoSchema).optional(),
})

export default defineEventHandler(async (event) => {
  const { seoOverrides, ...scalars } = await readPatchBody(event, settingsPatchSchema)
  const data = {
    ...scalars,
    ...(seoOverrides !== undefined ? { seoOverrides: JSON.stringify(seoOverrides) } : {}),
  }
  // Row id=1 is seeded; the create branch only fires if the DB was never seeded.
  const row = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data, name: data.name ?? '' },
  })
  clearSiteCache()
  clearThemeCache()
  return { settings: { ...row, seoOverrides: parseSeoOverrides(row.seoOverrides) } }
})
