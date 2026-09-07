// Injects admin-configured Primary/Accent colors as daisyUI CSS-var overrides during SSR,
// so theme changes apply without a rebuild (PRD §7.2). Admin saves also patch the
// `#brand-colors` style tag client-side for instant feedback (M5.3).
import { buildBrandCss, isValidHex } from '~/shared/colors'

export default defineNuxtPlugin(async () => {
  const { primaryColor, accentColor } = await $fetch('/api/public/theme')
  if (!isValidHex(primaryColor) || !isValidHex(accentColor)) return

  useHead({
    style: [{ key: 'brand-colors', id: 'brand-colors', innerHTML: buildBrandCss(primaryColor, accentColor) }],
  })
})
