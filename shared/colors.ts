// Color math for the two-color theme system (PRD §7).
// daisyUI v4 stores theme colors as oklch triplets in CSS vars: `--p: 49.12% 0.3096 275.75`.
// Admin colors are stored as hex in SiteSettings and converted at runtime.

export function isValidHex(hex: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim())
}

export function normalizeHex(hex: string): string {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('')
  return `#${h.toLowerCase()}`
}

function hexToLinearSrgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex)
  const toLinear = (v: number) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return [
    toLinear(parseInt(h.slice(1, 3), 16)),
    toLinear(parseInt(h.slice(3, 5), 16)),
    toLinear(parseInt(h.slice(5, 7), 16)),
  ]
}

export function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const [r, g, b] = hexToLinearSrgb(hex)
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const l = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const bOk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
  const c = Math.sqrt(a * a + bOk * bOk)
  let h = (Math.atan2(bOk, a) * 180) / Math.PI
  if (h < 0) h += 360
  return { l, c, h: c < 0.0001 ? 0 : h }
}

export function oklchToHex(l: number, c: number, h: number): string {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const bOk = c * Math.sin(hRad)
  const l_ = Math.pow(l + 0.3963377774 * a + 0.2158037573 * bOk, 3)
  const m_ = Math.pow(l - 0.1055613458 * a - 0.0638541728 * bOk, 3)
  const s_ = Math.pow(l - 0.0894841775 * a - 1.291485548 * bOk, 3)
  const toSrgb = (v: number) => {
    const x = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
    return Math.round(Math.min(1, Math.max(0, x)) * 255)
  }
  const r = toSrgb(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_)
  const g = toSrgb(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_)
  const b = toSrgb(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_)
  const hex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

// daisyUI v4 CSS-variable format: "<L>% <C> <H>"
export function hexToDaisyVar(hex: string): string {
  const { l, c, h } = hexToOklch(hex)
  return `${(l * 100).toFixed(2)}% ${c.toFixed(4)} ${h.toFixed(2)}`
}

// Dark mode keeps hue/chroma but lifts lightness for contrast (PRD §7.1)
export function darkVariantHex(hex: string): string {
  const { l, c, h } = hexToOklch(hex)
  return oklchToHex(Math.min(0.9, l + 0.18), c, h)
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToLinearSrgb(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// WCAG contrast ratio 1–21; AA text requires ≥ 4.5 (PRD §7.3)
export function contrastRatio(hexA: string, hexB: string): number {
  const [l1, l2] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a)
  return (l1 + 0.05) / (l2 + 0.05)
}

// Base backgrounds per theme mode (from tailwind.config.ts) — contrast guard targets.
export const THEME_BASE_BG = { light: '#ffffff', dark: '#111827' } as const

// daisyUI CSS-var overrides for both modes (SSR style tag + post-save client patch).
export function buildBrandCss(primaryColor: string, accentColor: string): string {
  return [
    ':root, [data-theme=portfolio] {',
    `  --p: ${hexToDaisyVar(primaryColor)};`,
    `  --a: ${hexToDaisyVar(accentColor)};`,
    '}',
    '[data-theme=portfolio-dark] {',
    `  --p: ${hexToDaisyVar(darkVariantHex(primaryColor))};`,
    `  --a: ${hexToDaisyVar(darkVariantHex(accentColor))};`,
    '}',
  ].join('\n')
}
