import type { AdminCommentItem } from '~/shared/types/engagement'

// ADM-19: moderation list — newest first, includes soft-deleted comments,
// optional ?projectId=<id> filter. Admin guard is global (server/middleware/admin.ts).
export default defineEventHandler(async (event): Promise<{ comments: AdminCommentItem[] }> => {
  const query = getQuery(event)
  const rawProjectId = Number.parseInt(String(query.projectId ?? ''), 10)
  const projectId = Number.isInteger(rawProjectId) && rawProjectId > 0 ? rawProjectId : undefined

  const rows = await prisma.comment.findMany({
    where: projectId ? { projectId } : {},
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: {
      user: { select: commentUserSelect },
      project: { select: { id: true, title: true, slug: true } },
    },
  })

  return { comments: rows.map(serializeAdminComment) }
})
