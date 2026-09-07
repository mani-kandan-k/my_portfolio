// Public API payload types (PRD §8.3 — GET /api/public/site).
// JSON-text columns (Section.payload, Experience.bullets/tech, Project.tech)
// are parsed server-side before they reach the client.

// Per-page SEO override (ADM-13) — value shape of SiteSettings.seoOverrides.
export interface PageSeoOverride {
  title?: string
  description?: string
  ogImagePath?: string
}

export interface SiteSettingsPublic {
  name: string
  role: string
  tagline: string
  avatarPath: string
  faviconPath: string
  resumePath: string
  contactEmail: string
  seoTitle: string
  seoDescription: string
  seoOgImagePath: string
  seoOverrides: Record<string, PageSeoOverride>
}

export interface SkillItem {
  id: number
  name: string
  icon: string
  category: string
  proficiency: number
}

export interface ExperienceItem {
  id: number
  company: string
  role: string
  location: string
  startDate: string
  endDate: string | null
  bullets: string[]
  tech: string[]
  logoPath: string
}

export interface ProjectItem {
  id: number
  title: string
  slug: string
  summary: string
  heroImagePath: string
  tech: string[]
  repoUrl: string
  liveUrl: string
  featured: boolean
  likeCount: number
  commentCount: number
}

export interface ProjectDetail extends ProjectItem {
  description: string
}

export interface EducationItem {
  id: number
  institution: string
  degree: string
  startDate: string
  endDate: string | null
  notes: string
}

export interface SocialLinkItem {
  id: number
  label: string
  url: string
  icon: string
}

export type PublicSectionItem =
  SkillItem | ExperienceItem | ProjectItem | EducationItem | SocialLinkItem

export interface HeroCta {
  label: string
  url: string
}

export interface HeroPayload {
  greeting?: string
  subHeadline?: string
  primaryCta?: HeroCta
  secondaryCta?: HeroCta
  // Up to 3 portrait-orientation images shown as a strip below the CTAs.
  images?: string[]
}

export interface AboutStat {
  label: string
  value: string
}

export interface AboutPayload {
  bio?: string
  portraitPath?: string
  stats?: AboutStat[]
}

export interface ContactPayload {
  blurb?: string
}

export interface FooterPayload {
  text?: string
}

export interface PublicSection {
  key: string
  title: string
  subtitle: string
  order: number
  payload: Record<string, unknown>
  items: PublicSectionItem[]
}

export interface PublicSitePayload {
  settings: SiteSettingsPublic
  sections: PublicSection[]
}
