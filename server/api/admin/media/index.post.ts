// Admin image upload: bytes are stored in the Media table (DB blob storage, so
// uploads survive serverless deploys where public/ is read-only). The returned
// /api/media/<id> URL is accepted by every asset-path field. 2 MB cap keeps
// requests comfortably under Vercel's 4.5 MB serverless body limit.
const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'])

export default defineEventHandler(async (event): Promise<{ id: number; url: string }> => {
  await rateLimit(event, { key: 'media-upload', limit: 30, windowMs: 60 * 60_000, withUser: true })

  const parts = await readMultipartFormData(event)
  const file = parts?.find((part) => part.name === 'file' && part.filename)
  if (!file?.filename) {
    throw createError({ statusCode: 400, message: 'Attach one image file as form field "file"' })
  }

  const contentType = file.type ?? ''
  if (!ALLOWED_TYPES.has(contentType)) {
    throw createError({
      statusCode: 400,
      message: 'Only PNG, JPEG, WebP, AVIF or GIF images are allowed',
    })
  }
  if (file.data.length > MAX_BYTES) {
    throw createError({ statusCode: 400, message: 'Image is too large — 2 MB max' })
  }

  const media = await prisma.media.create({
    data: {
      filename: file.filename.slice(0, 200),
      contentType,
      sizeBytes: file.data.length,
      data: new Uint8Array(file.data),
    },
  })

  setResponseStatus(event, 201)
  return { id: media.id, url: `/api/media/${media.id}` }
})
