import { z } from 'zod'
import { assetPath, hexColor } from './common'

export const settingsUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  role: z.string().trim().max(120),
  tagline: z.string().trim().max(300),
  avatarPath: assetPath,
  faviconPath: assetPath,
  resumePath: assetPath,
  contactEmail: z.union([z.literal(''), z.string().trim().email().max(200)]),
  primaryColor: hexColor,
  accentColor: hexColor,
  seoTitle: z.string().trim().max(120),
  seoDescription: z.string().trim().max(300),
  seoOgImagePath: assetPath,
})
export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>

export const themeUpdateSchema = z.object({
  primaryColor: hexColor,
  accentColor: hexColor,
})
export type ThemeUpdate = z.infer<typeof themeUpdateSchema>
