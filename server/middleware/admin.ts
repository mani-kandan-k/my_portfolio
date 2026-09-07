// AUTH-4: server-side guard for every /api/admin/** route. Never rely on the
// client middleware alone — this runs before any admin API handler.
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (path !== '/api/admin' && !path.startsWith('/api/admin/')) return
  await requireAdmin(event)
})
