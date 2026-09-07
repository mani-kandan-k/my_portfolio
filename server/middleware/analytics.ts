import { createHmac } from 'node:crypto'

// ANA-1/2/5: cookieless pageview tracking for public pages. Every guard below
// keeps this cheap and private:
// - GET/HEAD on public pages only — no /api, /admin, /_nuxt, /assets, files
// - honors DNT: 1, skips the admin's own session, stores no PII (visitorHash
//   is an HMAC of ip|UA keyed by a daily-rotated salt — ANA-2)
// - the insert is fire-and-forget so tracking never blocks a response (ANA-5)

const SKIP_PREFIXES = ['/api', '/admin', '/_nuxt', '/__', '/assets']

function isTrackablePage(method: string, pathname: string): boolean {
  if (method !== 'GET' && method !== 'HEAD') return false
  for (const prefix of SKIP_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return false
  }
  // File-like paths (favicon.ico, robots.txt, sitemap.xml, *.png, …): a dot
  // in the last segment means it's an asset, not a page.
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1)
  if (lastSegment.includes('.')) return false
  return true
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (!isTrackablePage(event.method, url.pathname)) return
  if (getRequestHeader(event, 'dnt') === '1') return

  // Capture request data now — the insert runs after the response is sent.
  const path = url.pathname
  const referrer = getRequestHeader(event, 'referer') || ''
  const ua = getRequestHeader(event, 'user-agent') || ''
  const ip = getRequestIP(event, { xForwardedFor: true }) || ''

  const work = (async () => {
    try {
      // Cheap sealed-cookie read; a bad cookie must never break tracking.
      const { user } = await getUserSession(event)
      if (user?.role === 'ADMIN') return
    } catch {
      // malformed session cookie → treat as anonymous
    }

    const config = useRuntimeConfig()
    const day = new Date().toISOString().slice(0, 10)
    const key = `${config.analyticsSalt || 'portfolio'}-${day}`
    const visitorHash = createHmac('sha256', key).update(`${ip}|${ua}`).digest('hex')
    const { device, browser } = parseUserAgent(ua)

    await prisma.pageView.create({
      data: { path, referrer, device, browser, visitorHash },
    })
  })()

  // Never await (ANA-5). Serverless presets expose waitUntil at runtime (not
  // present in h3's types) to keep the insert alive past the response; plain
  // node just floats the promise.
  const tracked = work.catch((err) => console.error('[analytics] track failed:', err))
  const waitUntil = (event as { waitUntil?: (promise: Promise<unknown>) => void }).waitUntil
  if (waitUntil) waitUntil.call(event, tracked)
})
