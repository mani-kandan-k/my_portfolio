// ANA-4: purge raw pageviews older than the configured retention window.
// Extracted from the Nitro plugin so the purge logic can be invoked (and
// verified) outside server startup.
export async function purgeOldPageViews(retentionMonths: number): Promise<number> {
  const cutoff = new Date()
  cutoff.setUTCMonth(cutoff.getUTCMonth() - retentionMonths)
  const { count } = await prisma.pageView.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })
  return count
}
