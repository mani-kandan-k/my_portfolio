// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
    '@nuxt/image',
    '@nuxtjs/seo',
    '@vueuse/nuxt',
    '@nuxt/eslint',
  ],

  // @nuxtjs/seo (PUB-6): per-page title/description/OG come from SiteSettings via
  // useSeoMeta at runtime; name/description here are just pre-fetch fallbacks.
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'Portfolio',
    description: 'Personal portfolio',
  },

  // Link checker should not treat API endpoints (OAuth/logout etc.) as pages.
  linkChecker: {
    excludeLinks: ['/api/**'],
  },

  // Admin pages are robots=noindex already; keep them out of the sitemap too.
  // Project detail URLs come from server/api/_sitemap/urls.ts (8.2).
  sitemap: {
    exclude: ['/admin/**'],
    sources: ['/api/_sitemap/urls'],
  },

  routeRules: {
    // 8.3: repo-committed assets are immutable per deploy — cache aggressively.
    '/assets/**': {
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
    },
    // 8.3/ADM-18: 5 s max so admin edits stay visible within seconds; SSR of
    // pages stays fully dynamic (no ISR/SWR on / or /projects/**).
    '/api/public/**': {
      cache: { maxAge: 5 },
    },
    // Generated OG cards change only with page content/settings — cache a week.
    // (nuxt-og-image v6 serves them from /_og/, not /__og-image__/.)
    '/_og/**': {
      headers: { 'cache-control': 'public, max-age=604800' },
    },
  },

  runtimeConfig: {
    // M3 (AUTH-2): GitHub username of the single allowlisted admin.
    adminGithubUsername: process.env.ADMIN_GITHUB_USERNAME || '',
    // M7 (PUB-8/9): Resend delivery for contact-form messages. Empty key/to
    // → messages are stored but no email is attempted (emailDelivered=false).
    resendApiKey: process.env.RESEND_API_KEY || '',
    contactToEmail: process.env.CONTACT_TO_EMAIL || '',
    // M7 (ANA-1/4): HMAC salt seed for visitor hashes (the daily date suffix
    // rotates it) and pageview retention window.
    analyticsSalt: process.env.ANALYTICS_SALT || '',
    analyticsRetentionMonths: Number(process.env.ANALYTICS_RETENTION_MONTHS) || 12,
    oauth: {
      github: {
        // Map the plain GITHUB_CLIENT_ID/SECRET names from .env (DEV_PLAN §A) onto
        // the keys nuxt-auth-utils reads; NUXT_OAUTH_GITHUB_CLIENT_ID/SECRET still
        // override at runtime per Nuxt runtime-config conventions.
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      },
    },
  },
})
