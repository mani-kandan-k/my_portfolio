export type ThemeName = 'portfolio' | 'portfolio-dark'

// Light/dark toggle (PUB-4). The initial theme is applied pre-paint by an inline
// script in app.vue; here we sync with it and persist user choices to localStorage.
export function useTheme() {
  const theme = useState<ThemeName>('app-theme', () => 'portfolio')

  if (import.meta.client) {
    const current = document.documentElement.dataset.theme
    if (current === 'portfolio' || current === 'portfolio-dark') theme.value = current
  }

  function setTheme(next: ThemeName) {
    theme.value = next
    if (import.meta.client) {
      document.documentElement.dataset.theme = next
      try {
        localStorage.setItem('theme', next)
      } catch {
        // private mode etc. — theme still applies for this session
      }
    }
  }

  function toggle() {
    setTheme(theme.value === 'portfolio' ? 'portfolio-dark' : 'portfolio')
  }

  return { theme, setTheme, toggle }
}
