import { z } from 'zod'

// Plain text only, trimmed (ENG-5); rendered escaped, never as HTML
export const commentCreateSchema = z.object({
  body: z.string().trim().min(1).max(1000),
})
export type CommentCreate = z.infer<typeof commentCreateSchema>

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(5000),
  // Honeypot — must stay empty (PUB-9)
  website: z.string().max(0).optional().default(''),
})
export type ContactMessageInput = z.infer<typeof contactMessageSchema>
