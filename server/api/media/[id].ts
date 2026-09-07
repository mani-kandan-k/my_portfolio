// Admin-uploaded images from the Media table. Content is immutable per id — a
// new upload is always a new row/URL — so responses are cached for a year.
// Handles GET and HEAD (CDN/cache validators); everything else is a 405.
export default defineEventHandler(async (event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') {
    setResponseHeader(event, 'allow', 'GET, HEAD')
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const id = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 404, statusMessage: 'Media not found' })
  }

  const media = await prisma.media.findUnique({ where: { id } })
  if (!media) {
    throw createError({ statusCode: 404, statusMessage: 'Media not found' })
  }

  setResponseHeaders(event, {
    'content-type': media.contentType,
    'content-length': media.sizeBytes,
    'cache-control': 'public, max-age=31536000, immutable',
    etag: `W/"media-${media.id}-${media.sizeBytes}"`,
    'last-modified': media.createdAt.toUTCString(),
  })

  if (event.method === 'HEAD') {
    // End via the raw response: returning null would make h3 rewrite the status
    // to 204 and strip content-length/last-modified.
    event.node.res.end()
    return
  }
  return Buffer.from(media.data)
})
