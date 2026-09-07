import type { CommentsPage } from '~/shared/types/engagement'

const PAGE_SIZE = 20

// ENG-3: public, paginated (20/page), newest first, soft-deleted excluded.
// canDelete is session-aware, so this route is never cached.
export default defineEventHandler(async (event): Promise<CommentsPage> => {
  const slug = getRouterParam(event, 'slug')
  const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  const query = getQuery(event)
  const rawPage = Number.parseInt(String(query.page ?? '1'), 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1

  const where = { projectId: project.id, deletedAt: null }
  const [total, rows, { user }] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: commentUserSelect } },
    }),
    getUserSession(event),
  ])

  const isAdmin = user?.role === 'ADMIN'
  return {
    comments: rows.map((comment) =>
      serializeComment(comment, !!user && (isAdmin || comment.userId === user.id)),
    ),
    total,
    page,
    pageSize: PAGE_SIZE,
  }
})
