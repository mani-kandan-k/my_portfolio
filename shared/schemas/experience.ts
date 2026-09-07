import { z } from 'zod'
import { assetPath, stringList } from './common'

export const experienceCreateSchema = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).default(''),
  startDate: z.string().trim().min(1).max(20),
  endDate: z.string().trim().max(20).nullable().default(null),
  bullets: stringList.default([]),
  tech: stringList.default([]),
  logoPath: assetPath.default(''),
})
export const experienceUpdateSchema = experienceCreateSchema.partial()
export type ExperienceCreate = z.infer<typeof experienceCreateSchema>
export type ExperienceUpdate = z.infer<typeof experienceUpdateSchema>
