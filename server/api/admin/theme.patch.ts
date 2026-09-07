import { themeUpdateSchema } from '~/shared/schemas/settings'
import { normalizeHex } from '~/shared/colors'

// M5.1 (ADM-12): persist Primary/Accent to SiteSettings. Guarded by
// server/middleware/admin.ts. Busts both caches so the next public render
// (SSR style tag) and payload reflect the new colors within seconds (ADM-18).
export default defineEventHandler(async (event) => {
  const { primaryColor, accentColor } = await readValidatedBody(event, (d) =>
    themeUpdateSchema.parse(d),
  )
  const settings = await prisma.siteSettings.update({
    where: { id: 1 },
    data: { primaryColor: normalizeHex(primaryColor), accentColor: normalizeHex(accentColor) },
  })
  clearThemeCache()
  clearSiteCache()
  return { primaryColor: settings.primaryColor, accentColor: settings.accentColor }
})
