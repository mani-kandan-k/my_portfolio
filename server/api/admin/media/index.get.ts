// List recent uploads (metadata only — image bytes are served by /api/media/[id]).
export default defineEventHandler(async () => {
  const media = await prisma.media.findMany({
    orderBy: { id: 'desc' },
    take: 50,
    select: { id: true, filename: true, contentType: true, sizeBytes: true, createdAt: true },
  })
  return { media: media.map((item) => ({ ...item, url: `/api/media/${item.id}` })) }
})
