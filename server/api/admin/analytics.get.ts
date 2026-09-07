import type { AnalyticsSummary } from '~/shared/types/analytics'

// ANA-3 / ADM-20: aggregated pageview stats for the dashboard. Volumes are
// tiny (one portfolio), so rows are fetched and aggregated in JS — DB-agnostic
// and avoids Prisma groupBy/SQLite edge cases. Admin guard is global
// (server/middleware/admin.ts).

const RANGES = new Set([7, 30, 90])

function hostOf(referrer: string): string {
  if (!referrer) return 'Direct'
  try {
    return new URL(referrer).hostname || 'Direct'
  } catch {
    return referrer
  }
}

function sortedTop(counts: Map<string, number>, limit = 10): [string, number][] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}

export default defineEventHandler(async (event): Promise<AnalyticsSummary> => {
  const rawRange = String(getQuery(event).range ?? '30')
  const range = Number(rawRange)
  if (!RANGES.has(range)) {
    throw createError({ statusCode: 400, message: 'Invalid range — use 7, 30 or 90' })
  }

  // UTC day boundaries match the middleware's visitor-hash day rotation.
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  start.setUTCDate(start.getUTCDate() - (range - 1))

  const rows = await prisma.pageView.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true, path: true, referrer: true, device: true, browser: true, visitorHash: true },
  })

  const visitors = new Set<string>()
  const perDay = new Map<string, number>()
  const perPage = new Map<string, number>()
  const perReferrer = new Map<string, number>()
  const perDevice = new Map<string, number>()
  const perBrowser = new Map<string, number>()

  for (const row of rows) {
    const day = row.createdAt.toISOString().slice(0, 10)
    visitors.add(row.visitorHash)
    perDay.set(day, (perDay.get(day) ?? 0) + 1)
    perPage.set(row.path, (perPage.get(row.path) ?? 0) + 1)
    const ref = hostOf(row.referrer)
    perReferrer.set(ref, (perReferrer.get(ref) ?? 0) + 1)
    const device = row.device || 'unknown'
    perDevice.set(device, (perDevice.get(device) ?? 0) + 1)
    const browser = row.browser || 'Other'
    perBrowser.set(browser, (perBrowser.get(browser) ?? 0) + 1)
  }

  // Zero-fill every day of the range so the chart has a continuous axis.
  const viewsOverTime: AnalyticsSummary['viewsOverTime'] = []
  for (let i = 0; i < range; i++) {
    const day = new Date(start)
    day.setUTCDate(start.getUTCDate() + i)
    const key = day.toISOString().slice(0, 10)
    viewsOverTime.push({ date: key, views: perDay.get(key) ?? 0 })
  }

  return {
    range,
    totalViews: rows.length,
    uniqueVisitors: visitors.size,
    viewsOverTime,
    topPages: sortedTop(perPage).map(([path, views]) => ({ path, views })),
    topReferrers: sortedTop(perReferrer).map(([referrer, views]) => ({ referrer, views })),
    devices: sortedTop(perDevice).map(([device, views]) => ({ device, views })),
    browsers: sortedTop(perBrowser).map(([browser, views]) => ({ browser, views })),
  }
})
