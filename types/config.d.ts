// Runtime config keys for M7 (Analytics & Contact). As with types/auth.d.ts,
// this augments '@nuxt/schema' — NOT 'nuxt/schema' (the latter silently fails
// on nuxt 3.21 under skipLibCheck; see the comment in types/auth.d.ts).
declare module '@nuxt/schema' {
  interface RuntimeConfig {
    /** Resend API key for contact-form delivery; empty = store only (PUB-8) */
    resendApiKey: string
    /** Owner inbox that receives contact-form emails (PUB-8) */
    contactToEmail: string
    /** HMAC salt seed for analytics visitor hashes; rotates daily (ANA-1) */
    analyticsSalt: string
    /** Months of PageView history to keep before purging (ANA-4) */
    analyticsRetentionMonths: number
  }
}

export {}
