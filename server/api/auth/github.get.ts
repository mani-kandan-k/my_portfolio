// GitHub OAuth entry point + callback (AUTH-1/2/7/8). Minimal scope: read:user.
const oauthHandler = defineOAuthGitHubEventHandler({
  config: {
    scope: ['read:user'],
  },
  async onSuccess(event, { user: githubUser }) {
    // Role is recomputed on every login so the env allowlist stays the single
    // source of truth (demoting works by removing the username and re-logging).
    const adminUsername = useRuntimeConfig(event).adminGithubUsername
    const role: 'ADMIN' | 'USER' =
      adminUsername && githubUser.login.toLowerCase() === adminUsername.toLowerCase()
        ? 'ADMIN'
        : 'USER'

    const user = await prisma.user.upsert({
      where: { githubId: githubUser.id },
      update: { username: githubUser.login, avatarUrl: githubUser.avatar_url ?? '', role },
      create: {
        githubId: githubUser.id,
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url ?? '',
        role,
      },
    })

    await setUserSession(event, {
      user: {
        id: user.id,
        githubId: user.githubId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role,
      },
    })

    return sendRedirect(event, role === 'ADMIN' ? '/admin' : '/')
  },
  async onError(event, error) {
    console.error('[auth] GitHub OAuth failed:', error.message ?? error)
    return sendRedirect(event, '/?error=auth')
  },
})

export default defineEventHandler(async (event) => {
  // AUTH-9: throttle the OAuth start/callback endpoint per IP.
  await rateLimit(event, { key: 'auth', limit: 20, windowMs: 10 * 60 * 1000 })

  // Fail clearly while credentials are missing instead of redirecting into a
  // broken GitHub URL; the user fills .env (task 3.1) to enable sign-in.
  const { clientId, clientSecret } = useRuntimeConfig(event).oauth.github
  if (!clientId || !clientSecret) {
    throw createError({
      statusCode: 500,
      message:
        'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env, then restart the dev server.',
    })
  }

  return oauthHandler(event)
})
