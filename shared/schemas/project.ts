import { z } from 'zod'
import { assetPath, slug, stringList } from './common'

export const projectCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug,
  summary: z.string().trim().max(300).default(''),
  description: z.string().trim().max(20000).default(''),
  heroImagePath: assetPath.default(''),
  tech: stringList.default([]),
  repoUrl: z.union([z.literal(''), z.string().trim().url().max(300)]).default(''),
  liveUrl: z.union([z.literal(''), z.string().trim().url().max(300)]).default(''),
  featured: z.boolean().default(false),
})
export const projectUpdateSchema = projectCreateSchema.partial()
export type ProjectCreate = z.infer<typeof projectCreateSchema>
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>
