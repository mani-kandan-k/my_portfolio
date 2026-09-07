// ADM-11: list all social links (ordered).
export default defineEventHandler(async () => {
  const links = await prisma.socialLink.findMany({ orderBy: { order: 'asc' } })
  return { links }
})
