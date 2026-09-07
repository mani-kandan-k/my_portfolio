// Short-TTL in-memory cache for brand colors; admin theme saves bust it (M5.3).
let cache: { primaryColor: string; accentColor: string } | null = null
let cachedAt = 0
const TTL_MS = 5_000

export async function getThemeColors() {
  if (cache && Date.now() - cachedAt < TTL_MS) return cache
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
    select: { primaryColor: true, accentColor: true },
  })
  cache = {
    primaryColor: settings?.primaryColor ?? '#4f46e5',
    accentColor: settings?.accentColor ?? '#f59e0b',
  }
  cachedAt = Date.now()
  return cache
}

export function clearThemeCache() {
  cache = null
}
