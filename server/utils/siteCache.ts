import type { Project } from '@prisma/client'
import type {
  EducationItem,
  ExperienceItem,
  PageSeoOverride,
  ProjectItem,
  PublicSection,
  PublicSectionItem,
  PublicSitePayload,
  SiteSettingsPublic,
  SkillItem,
  SocialLinkItem,
} from '~/shared/types/site'

// Short-TTL in-memory cache for the full public site payload (pattern: server/utils/themeCache.ts).
// Admin writes bust it via clearSiteCache() (M4.9); TTL alone keeps edits visible within seconds.
let cache: PublicSitePayload | null = null
let cachedAt = 0
const TTL_MS = 5_000

export function parseStringArray(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function parsePayload(json: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(json)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

// SiteSettings.seoOverrides (JSON text) → typed map; non-object entries and
// non-string fields are dropped defensively.
export function parseSeoOverrides(json: string): Record<string, PageSeoOverride> {
  const raw = parsePayload(json)
  const overrides: Record<string, PageSeoOverride> = {}
  for (const [path, value] of Object.entries(raw)) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) continue
    const entry = value as Record<string, unknown>
    const override: PageSeoOverride = {}
    if (typeof entry.title === 'string') override.title = entry.title
    if (typeof entry.description === 'string') override.description = entry.description
    if (typeof entry.ogImagePath === 'string') override.ogImagePath = entry.ogImagePath
    overrides[path] = override
  }
  return overrides
}

export type ProjectWithCounts = Project & { _count: { reactions: number; comments: number } }

export function serializeProject(project: ProjectWithCounts): ProjectItem {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    heroImagePath: project.heroImagePath,
    tech: parseStringArray(project.tech),
    repoUrl: project.repoUrl,
    liveUrl: project.liveUrl,
    featured: project.featured,
    likeCount: project._count.reactions,
    commentCount: project._count.comments,
  }
}

export const projectWithCountsArgs = {
  orderBy: { order: 'asc' as const },
  include: {
    _count: {
      select: {
        reactions: true,
        comments: { where: { deletedAt: null } },
      },
    },
  },
}

export async function getPublicSite(): Promise<PublicSitePayload> {
  if (cache && Date.now() - cachedAt < TTL_MS) return cache

  const [
    settingsRow,
    sectionRows,
    skillRows,
    experienceRows,
    projectRows,
    educationRows,
    socialLinkRows,
  ] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    prisma.section.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
    prisma.skill.findMany({ orderBy: { order: 'asc' } }),
    prisma.experience.findMany({ orderBy: { order: 'asc' } }),
    prisma.project.findMany(projectWithCountsArgs),
    prisma.education.findMany({ orderBy: { order: 'asc' } }),
    prisma.socialLink.findMany({ orderBy: { order: 'asc' } }),
  ])

  const settings: SiteSettingsPublic = {
    name: settingsRow?.name ?? '',
    role: settingsRow?.role ?? '',
    tagline: settingsRow?.tagline ?? '',
    avatarPath: settingsRow?.avatarPath ?? '',
    faviconPath: settingsRow?.faviconPath ?? '',
    resumePath: settingsRow?.resumePath ?? '',
    contactEmail: settingsRow?.contactEmail ?? '',
    seoTitle: settingsRow?.seoTitle ?? '',
    seoDescription: settingsRow?.seoDescription ?? '',
    seoOgImagePath: settingsRow?.seoOgImagePath ?? '',
    seoOverrides: parseSeoOverrides(settingsRow?.seoOverrides ?? '{}'),
  }

  const skills: SkillItem[] = skillRows.map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    category: s.category,
    proficiency: s.proficiency,
  }))
  const experiences: ExperienceItem[] = experienceRows.map((e) => ({
    id: e.id,
    company: e.company,
    role: e.role,
    location: e.location,
    startDate: e.startDate,
    endDate: e.endDate,
    bullets: parseStringArray(e.bullets),
    tech: parseStringArray(e.tech),
    logoPath: e.logoPath,
  }))
  const projects: ProjectItem[] = projectRows.map(serializeProject)
  const educations: EducationItem[] = educationRows.map((e) => ({
    id: e.id,
    institution: e.institution,
    degree: e.degree,
    startDate: e.startDate,
    endDate: e.endDate,
    notes: e.notes,
  }))
  const socialLinks: SocialLinkItem[] = socialLinkRows.map((l) => ({
    id: l.id,
    label: l.label,
    url: l.url,
    icon: l.icon,
  }))

  const itemsByKey: Record<string, PublicSectionItem[]> = {
    skills,
    experience: experiences,
    projects,
    education: educations,
    contact: socialLinks,
    footer: socialLinks,
  }

  const sections: PublicSection[] = sectionRows.map((s) => ({
    key: s.key,
    title: s.title,
    subtitle: s.subtitle,
    order: s.order,
    payload: parsePayload(s.payload),
    items: itemsByKey[s.key] ?? [],
  }))

  cache = { settings, sections }
  cachedAt = Date.now()
  return cache
}

export function clearSiteCache() {
  cache = null
  cachedAt = 0
}
