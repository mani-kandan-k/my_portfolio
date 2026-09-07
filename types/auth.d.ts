import type { SessionUser } from '~/shared/types/auth'

// Type augmentation for nuxt-auth-utils: makes useUserSession().user,
// getUserSession() and requireUserSession() return our SessionUser shape.
declare module '#auth-utils' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmentation must stay an interface
  interface User extends SessionUser {}
}

// Runtime config keys wired in nuxt.config.ts (plain GITHUB_CLIENT_ID/SECRET
// mapped onto the keys nuxt-auth-utils reads).
// NOTE: this augments '@nuxt/schema' (the real declaration site) rather than
// 'nuxt/schema' — with nuxt@3.21 the generated .nuxt/types/schema.d.ts
// self-augmentation of 'nuxt/schema' (a bare `export * from '@nuxt/schema'`)
// is circular and silently dropped under skipLibCheck, so keys declared there
// never reach useRuntimeConfig(). Augmenting '@nuxt/schema' merges directly.
declare module '@nuxt/schema' {
  interface RuntimeConfig {
    /** GitHub username of the single allowlisted admin (AUTH-2) */
    adminGithubUsername: string
    oauth: {
      github: {
        clientId: string
        clientSecret: string
        redirectURL: string
      }
    }
  }
}
