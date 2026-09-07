import { z } from 'zod'
import { isValidHex } from '../colors'

export const hexColor = z
  .string()
  .refine(isValidHex, { message: 'Must be a hex color like #4f46e5' })

// Assets are either committed under public/assets/ and referenced by path
// (PRD §13.2), or admin-uploaded images served from the Media table.
export const assetPath = z
  .string()
  .max(300)
  .refine((p) => p === '' || /^\/assets\/[\w./-]+$/.test(p) || /^\/api\/media\/\d+$/.test(p), {
    message: 'Must be empty, a path under /assets/, or an uploaded image URL (/api/media/<id>)',
  })

export const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Lowercase letters, numbers and dashes only' })

export const stringList = z.array(z.string().trim().min(1).max(200)).max(50)

export const userRole = z.enum(['ADMIN', 'USER'])
