import { z } from 'zod'

export const skillCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  icon: z.string().trim().max(80).default(''),
  category: z.string().trim().min(1).max(80).default('General'),
  proficiency: z.number().int().min(1).max(5).default(3),
})
export const skillUpdateSchema = skillCreateSchema.partial()
export type SkillCreate = z.infer<typeof skillCreateSchema>
export type SkillUpdate = z.infer<typeof skillUpdateSchema>
