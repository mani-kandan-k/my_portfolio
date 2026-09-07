import { z } from 'zod'
import type { AdminMessageItem } from '~/shared/types/engagement'

// ADM-21: mark a message read (sets readAt) or unread (clears it).
const patchSchema = z.object({ read: z.boolean() })

export default defineEventHandler(async (event): Promise<{ message: AdminMessageItem }> => {
  const id = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  }

  const { read } = await readValidatedBody(event, (payload) => patchSchema.parse(payload))

  const existing = await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  }

  const row = await prisma.contactMessage.update({
    where: { id },
    data: { readAt: read ? new Date() : null },
  })

  return {
    message: {
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      emailDelivered: row.emailDelivered,
      createdAt: row.createdAt.toISOString(),
      readAt: row.readAt ? row.readAt.toISOString() : null,
    },
  }
})
