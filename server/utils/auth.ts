import type { H3Event } from 'h3'

/**
 * Server-side auth guards (AUTH-4). Client middleware is UX only — every
 * protected API route must go through one of these.
 *
 * CSRF note (AUTH-6): sessions are sealed, HTTP-only cookies with SameSite=lax
 * (nuxt-auth-utils default, see runtimeConfig.session.cookie in its module
 * source), so browsers never attach them to cross-site POSTs. The only
 * cookie-bearing entry points are GET redirects (OAuth start/callback, logout),
 * which are not state-changing beyond the session itself, and every mutating
 * route takes a zod-validated JSON body via fetch. That combination leaves no
 * cross-site form-post vector, so no separate CSRF token machinery is needed.
 */

/** Require any signed-in user; 401 when anonymous. */
export async function requireUser(event: H3Event) {
  const { user } = await requireUserSession(event)
  return user
}

/** Require the allowlisted admin; 401 anonymous, 403 signed-in non-admin (AUTH-2/4). */
export async function requireAdmin(event: H3Event) {
  const user = await requireUser(event)
  if (user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Forbidden — admin access required' })
  }
  return user
}
