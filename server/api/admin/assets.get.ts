import { existsSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { assetPath } from '~/shared/schemas/common'

// ADM-14: existence check for AssetPathInput — ?path=/assets/resume.pdf or
// ?path=/api/media/12. Only answers whether the asset exists; never serves contents.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const raw = Array.isArray(query.path) ? (query.path[0] ?? '') : (query.path ?? '')
  if (raw === '') return { exists: false }

  const parsed = assetPath.safeParse(raw)
  if (!parsed.success || parsed.data === '') {
    throw createError({ statusCode: 400, message: 'Invalid asset path' })
  }

  // Uploaded images live in the Media table.
  const mediaMatch = /^\/api\/media\/(\d+)$/.exec(parsed.data)
  if (mediaMatch) {
    const id = Number.parseInt(mediaMatch[1] ?? '', 10)
    const row = await prisma.media.findUnique({ where: { id }, select: { id: true } })
    return { exists: row !== null }
  }

  // The assetPath regex allows dots, so "../" sequences can pass validation —
  // resolve and confirm the result stays inside public/.
  const publicDir = resolve(process.cwd(), 'public')
  const resolved = resolve(publicDir, `.${parsed.data}`)
  if (resolved !== publicDir && !resolved.startsWith(publicDir + sep)) {
    return { exists: false }
  }
  return { exists: existsSync(resolved) }
})
