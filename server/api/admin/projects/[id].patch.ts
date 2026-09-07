import { Prisma } from '@prisma/client'
import { projectUpdateSchema } from '~/shared/schemas/project'

export default defineEventHandler(async (event) => {
  const id = parseIdParam(event)
  const { tech, ...rest } = await readPatchBody(event, projectUpdateSchema)
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...rest,
        ...(tech !== undefined ? { tech: JSON.stringify(tech) } : {}),
      },
    })
    clearSiteCache()
    return { project: serializeProjectAdmin(project) }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createError({ statusCode: 409, message: 'Slug is already taken' })
    }
    throw error
  }
})
