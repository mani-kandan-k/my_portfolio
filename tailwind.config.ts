import daisyui from 'daisyui'
import type { Config } from 'tailwindcss'

// Two-color system (PRD §7.2): `primary` + `accent` are the only brand colors.
// Admin-set values override these at runtime via CSS custom properties (plugins/theme.server.ts),
// so the values here are just build-time defaults.
// base-*/neutral stay neutral grays in both modes.
export default <Partial<Config>>{
  plugins: [daisyui],
  daisyui: {
    darkTheme: 'portfolio-dark',
    themes: [
      {
        portfolio: {
          primary: '#4f46e5',
          'primary-content': '#ffffff',
          secondary: '#6b7280',
          'secondary-content': '#ffffff',
          accent: '#f59e0b',
          'accent-content': '#1c1917',
          neutral: '#1f2937',
          'neutral-content': '#f9fafb',
          'base-100': '#ffffff',
          'base-200': '#f3f4f6',
          'base-300': '#e5e7eb',
          'base-content': '#111827',
          info: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      {
        'portfolio-dark': {
          primary: '#818cf8',
          'primary-content': '#1e1b4b',
          secondary: '#9ca3af',
          'secondary-content': '#111827',
          accent: '#fbbf24',
          'accent-content': '#1c1917',
          neutral: '#374151',
          'neutral-content': '#f3f4f6',
          'base-100': '#111827',
          'base-200': '#1f2937',
          'base-300': '#374151',
          'base-content': '#f3f4f6',
          info: '#60a5fa',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
    ],
  },
}
