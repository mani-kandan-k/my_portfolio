import type { ProjectDetail } from '~/shared/types/site'

// Single project by slug, with parsed tech and live like/comment counts (soft-deleted
// comments excluded). No cache: detail pages must reflect engagement immediately (M6).
export default defineEventHandler(async (event): Promise<ProjectDetail> => {
  const slug = getRouterParam(event, 'slug')
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          reactions: true,
          comments: { where: { deletedAt: null } },
        },
      },
    },
  })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }
  return { ...serializeProject(project), description: project.description }
})
