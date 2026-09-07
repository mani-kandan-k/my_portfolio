// Brand colors for non-style contexts (8.2: OG card themeColor). The visual
// theme itself is injected by plugins/theme.server.ts; this shares the same
// tiny public payload with pages that need the raw hex values.
export function useBrandColors() {
  return useFetch<{ primaryColor: string; accentColor: string }>('/api/public/theme', {
    key: 'public-theme',
    default: () => null,
  })
}
