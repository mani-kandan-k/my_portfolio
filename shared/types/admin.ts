// Admin API payload types (DEV_PLAN M4) — responses of /api/admin/**.
// Item types reuse the public shapes where they match and add the admin-only
// `order` column; AdminProject stands alone because the public ProjectItem
// carries computed like/comment counts that admin rows don't have.
import type {
  EducationItem,
  ExperienceItem,
  SiteSettingsPublic,
  SkillItem,
  SocialLinkItem,
} from './site'

export interface AdminSection {
  id: number
  key: string
  title: string
  subtitle: string
  order: number
  visible: boolean
  payload: Record<string, unknown>
  itemCount: number
}

export interface AdminSettings extends SiteSettingsPublic {
  id: number
  primaryColor: string
  accentColor: string
  updatedAt: string
}

export interface AdminSkill extends SkillItem {
  order: number
}

export interface AdminExperience extends ExperienceItem {
  order: number
}

export interface AdminProject {
  id: number
  title: string
  slug: string
  summary: string
  description: string
  heroImagePath: string
  tech: string[]
  repoUrl: string
  liveUrl: string
  featured: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface AdminEducation extends EducationItem {
  order: number
}

export interface AdminLink extends SocialLinkItem {
  order: number
}
