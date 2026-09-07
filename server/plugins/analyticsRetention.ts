// ANA-4: analytics retention — purge PageView rows older than
// runtimeConfig.analyticsRetentionMonths once at startup, then every 24 h.
// The interval is unref'd so it never keeps a process alive; failures are
// logged, never thrown — this must not crash startup.
const DAY_MS = 24 * 60 * 60_000

export default defineNitroPlugin(() => {
  const months = useRuntimeConfig().analyticsRetentionMonths

  const purge = async () => {
    try {
      const count = await purgeOldPageViews(months)
      if (count > 0) console.info(`[analytics] retention purge removed ${count} pageviews older than ${months} months`)
    } catch (err) {
      console.error('[analytics] retention purge failed:', err)
    }
  }

  void purge()
  const timer = setInterval(() => void purge(), DAY_MS)
  timer.unref?.()
})
