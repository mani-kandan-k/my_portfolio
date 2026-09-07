import type { AdminMessageItem } from '~/shared/types/engagement'

// ADM-21: contact inbox — newest first, includes read/unread state and
// whether Resend delivery succeeded. Admin guard is global
// (server/middleware/admin.ts).
export default defineEventHandler(async (): Promise<{ messages: AdminMessageItem[] }> => {
  const rows = await prisma.contactMessage.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
  const messages: AdminMessageItem[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    emailDelivered: row.emailDelivered,
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt ? row.readAt.toISOString() : null,
  }))
  return { messages }
})
