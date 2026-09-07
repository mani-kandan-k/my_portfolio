// ADM-2/4: every section (visible + hidden) ordered, with parsed payload and a
// per-key item count for the dashboard.
export default defineEventHandler(async () => {
  const [sections, skillCount, experienceCount, projectCount, educationCount, socialLinkCount] =
    await Promise.all([
      prisma.section.findMany({ orderBy: { order: 'asc' } }),
      prisma.skill.count(),
      prisma.experience.count(),
      prisma.project.count(),
      prisma.education.count(),
      prisma.socialLink.count(),
    ])

  const itemCountByKey: Record<string, number> = {
    skills: skillCount,
    experience: experienceCount,
    projects: projectCount,
    education: educationCount,
    contact: socialLinkCount,
    footer: socialLinkCount,
  }

  return {
    sections: sections.map((section) => ({
      id: section.id,
      key: section.key,
      title: section.title,
      subtitle: section.subtitle,
      order: section.order,
      visible: section.visible,
      payload: parsePayload(section.payload),
      itemCount: itemCountByKey[section.key] ?? 0,
    })),
  }
})
