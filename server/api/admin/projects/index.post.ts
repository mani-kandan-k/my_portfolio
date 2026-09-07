import { Prisma } from '@prisma/client'
import { projectCreateSchema } from '~/shared/schemas/project'

export default defineEventHandler(async (event) => {
  const { tech, ...rest } = await readValidatedBody(event, (data) => projectCreateSchema.parse(data))
  const max = await prisma.project.aggregate({ _max: { order: true } })
  try {
    const project = await prisma.project.create({
      data: { ...rest, tech: JSON.stringify(tech), order: (max._max.order ?? -1) + 1 },
    })
    clearSiteCache()
    setResponseStatus(event, 201)
    return { project: serializeProjectAdmin(project) }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createError({ statusCode: 409, message: 'Slug is already taken' })
    }
    throw error
  }
})
