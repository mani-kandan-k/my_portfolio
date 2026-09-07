import type { PublicSection, PublicSitePayload } from '~/shared/types/site'

// Shared site state: one fetch of /api/public/site serves navbar, page and all sections.
export function useSite() {
  const site = useState<PublicSitePayload | null>('public-site', () => null)

  const fetchResult = useFetch('/api/public/site', {
    key: 'public-site',
    default: () => null,
    onResponse({ response }) {
      site.value = (response._data as PublicSitePayload | null) ?? null
    },
  })

  const settings = computed(() => site.value?.settings ?? null)
  const sections = computed(() => site.value?.sections ?? [])
  const section = (key: string): PublicSection | undefined =>
    sections.value.find((s) => s.key === key)

  // `ready` lets pages await the shared payload during setup (needed by 8.2 to
  // decide between a static OG image and the generated card with real values).
  return { site, settings, sections, section, refresh: fetchResult.refresh, ready: fetchResult }
}
