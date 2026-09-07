import type { MaybeRefOrGetter } from 'vue'
import type { PageSeoOverride } from '~/shared/types/site'

// Per-page SEO overrides from SiteSettings.seoOverrides (ADM-13).
// const override = useSeoOverride('/') — then `override.value?.title || fallback`.
export function useSeoOverride(path: MaybeRefOrGetter<string>) {
  const { settings } = useSite()
  return computed<PageSeoOverride | undefined>(() => settings.value?.seoOverrides?.[toValue(path)])
}
