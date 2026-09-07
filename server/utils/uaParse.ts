// ANA-1: hand-rolled UA parsing for analytics — device class + browser family.
// Deliberately small: we only need a coarse label per pageview, not full
// capability detection, so no dependency is pulled in for this.

export type DeviceKind = 'mobile' | 'tablet' | 'desktop' | 'bot'

export interface UaInfo {
  device: DeviceKind
  browser: string
}

// Order matters — first match wins (Edge's UA contains "Chrome", etc.).
const BROWSER_RULES: [RegExp, string][] = [
  [/edg(?:e|ios|a)?\//i, 'Edge'],
  [/opr\/|opera/i, 'Opera'],
  [/vivaldi/i, 'Vivaldi'],
  [/brave\//i, 'Brave'],
  [/firefox|fxios/i, 'Firefox'],
  [/crios|chrome\//i, 'Chrome'],
  [/version\/[\d.]+.*safari|safari\//i, 'Safari'],
  [/msie |trident\//i, 'IE'],
]

const BOT_RE = /bot|crawler|spider|crawling|slurp|baidu|yandex|duckduck|sogou|ia_archiver|facebookexternalhit|pingdom|uptimerobot|headless|curl|wget|python-requests|httpclient/i

export function parseUserAgent(ua: string): UaInfo {
  const raw = ua || ''
  if (!raw || BOT_RE.test(raw)) return { device: 'bot', browser: 'Bot' }

  let browser = 'Other'
  for (const [re, name] of BROWSER_RULES) {
    if (re.test(raw)) {
      browser = name
      break
    }
  }

  let device: DeviceKind = 'desktop'
  if (/ipad|tablet|kindle|playbook|silk|nexus 7|nexus 10/i.test(raw)) {
    device = 'tablet'
  } else if (/mobile|iphone|ipod|android(?!.*tablet)|windows phone|blackberry|opera mini|opera mobi/i.test(raw)) {
    device = 'mobile'
  }
  // Android phones say "Mobile", Android tablets say "Android" without it.
  if (device === 'desktop' && /android/i.test(raw) && !/mobile/i.test(raw)) {
    device = 'tablet'
  }

  return { device, browser }
}
