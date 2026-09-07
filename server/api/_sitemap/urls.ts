// PUB-6/8.2: dynamic sitemap source — every project detail page (/projects/<slug>).
// @nuxtjs/sitemap merges this with the auto-discovered static routes (/).
export default defineSitemapEventHandler(async () => {
  const projects = await prisma.project.findMany({
    select: { slug: true },
    orderBy: { order: 'asc' },
  })
  return projects.map((project) => ({ loc: `/projects/${project.slug}` }))
})
