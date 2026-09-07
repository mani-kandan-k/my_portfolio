import { z } from 'zod'

export const educationCreateSchema = z.object({
  institution: z.string().trim().min(1).max(160),
  degree: z.string().trim().min(1).max(160),
  startDate: z.string().trim().min(1).max(20),
  endDate: z.string().trim().max(20).nullable().default(null),
  notes: z.string().trim().max(2000).default(''),
})
export const educationUpdateSchema = educationCreateSchema.partial()
export type EducationCreate = z.infer<typeof educationCreateSchema>
export type EducationUpdate = z.infer<typeof educationUpdateSchema>
