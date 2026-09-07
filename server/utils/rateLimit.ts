import type { H3Event } from 'h3'

interface RateLimitOptions {
  /** Logical bucket name, e.g. 'auth' or 'comments' — keeps limits independent per route group. */
  key: string
  /** Max requests allowed per window. */
  limit: number
  /** Window size in milliseconds (bucket refills continuously at limit/windowMs). */
  windowMs: number
  /** Also key by session user id when logged in, so limits follow the account. */
  withUser?: boolean
}

interface Bucket {
  tokens: number
  updatedAt: number
  windowMs: number
}

// In-memory token bucket (DEV_PLAN §C). Single-instance only: state lives in the
// Nitro process and resets on restart / cold start. Upgrade path for multi-region
// prod: swap the Map for a KV store (e.g. Vercel KV / Upstash) with the same
// rateLimit() signature — call sites don't change.
const buckets = new Map<string, Bucket>()

// Bound memory: once the map grows past this, drop buckets that would be fully
// refilled anyway (idle for longer than their window).
const SWEEP_THRESHOLD = 5000

function maybeSweep(now: number) {
  if (buckets.size < SWEEP_THRESHOLD) return
  for (const [key, bucket] of buckets) {
    if (now - bucket.updatedAt > bucket.windowMs) buckets.delete(key)
  }
}

export async function rateLimit(event: H3Event, options: RateLimitOptions) {
  const { key, limit, windowMs, withUser } = options

  let identity = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (withUser) {
    const { user } = await getUserSession(event)
    if (user?.id) identity += `:u${user.id}`
  }
  const bucketKey = `${key}:${identity}`

  const now = Date.now()
  maybeSweep(now)

  const refillPerMs = limit / windowMs
  let bucket = buckets.get(bucketKey)
  if (!bucket) {
    bucket = { tokens: limit, updatedAt: now, windowMs }
    buckets.set(bucketKey, bucket)
  }
  bucket.tokens = Math.min(limit, bucket.tokens + (now - bucket.updatedAt) * refillPerMs)
  bucket.updatedAt = now

  if (bucket.tokens < 1) {
    const retryAfterSec = Math.max(1, Math.ceil((1 - bucket.tokens) / refillPerMs / 1000))
    setResponseHeader(event, 'Retry-After', retryAfterSec)
    throw createError({
      statusCode: 429,
      message: 'Too many requests — please slow down and try again later.',
    })
  }
  bucket.tokens -= 1
}
