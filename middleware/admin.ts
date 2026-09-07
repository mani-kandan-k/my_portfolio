// ADM-1: client guard for /admin/** pages (named, applied via definePageMeta).
// Anon → full redirect into the GitHub OAuth flow; signed-in non-admin → 403 view.
// The authoritative check stays server-side in server/middleware/admin.ts (AUTH-4).
export default defineNuxtRouteMiddleware(async () => {
  const { ready, loggedIn, user, fetch } = useUserSession()
  if (!ready.value) await fetch()

  if (!loggedIn.value) {
    // eslint-disable-next-line link-checker/valid-route, link-checker/valid-sitemap-link -- OAuth endpoint, not a page route
    return navigateTo('/api/auth/github', { external: true })
  }
  if (user.value?.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'This area is restricted to the site admin.',
    })
  }
})
