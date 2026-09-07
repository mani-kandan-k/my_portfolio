import { z } from 'zod'

export const sectionUpdateSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  subtitle: z.string().trim().max(200).optional(),
  visible: z.boolean().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
})
export type SectionUpdate = z.infer<typeof sectionUpdateSchema>

// Swap-based reorder: ordered list of section ids
export const reorderSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
})
export type Reorder = z.infer<typeof reorderSchema>
