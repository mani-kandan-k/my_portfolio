import { z } from 'zod'

export const socialLinkCreateSchema = z.object({
  label: z.string().trim().min(1).max(60),
  url: z
    .string()
    .trim()
    .max(300)
    .refine((u) => /^https?:\/\//.test(u) || u.startsWith('mailto:'), {
      message: 'Must be an http(s) or mailto: URL',
    }),
  icon: z.string().trim().max(60).default(''),
})
export const socialLinkUpdateSchema = socialLinkCreateSchema.partial()
export type SocialLinkCreate = z.infer<typeof socialLinkCreateSchema>
export type SocialLinkUpdate = z.infer<typeof socialLinkUpdateSchema>
