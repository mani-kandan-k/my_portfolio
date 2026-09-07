import type { Experience, Project } from '@prisma/client'
import type { H3Event } from 'h3'
import type { z } from 'zod'

// Shared helpers for the /api/admin/** CRUD endpoints (M4.2). Auth is already
// enforced by server/middleware/admin.ts; these cover id parsing, reorder
// validation and JSON-text column serialization.

/** Route param `id` as a positive integer; 400 otherwise. */
export function parseIdParam(event: H3Event): number {
  const raw = getRouterParam(event, 'id')
  if (!raw || !/^\d+$/.test(raw)) {
    throw createError({ statusCode: 400, message: 'Invalid id' })
  }
  const id = Number(raw)
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, message: 'Invalid id' })
  }
  return id
}

/**
 * Body parsing for PATCH endpoints. zod v4 keeps applying a field's `.default()`
 * when the key is absent, even through `.partial()` — so a naive parse would
 * silently reset every untouched defaulted column. After validation we drop any
 * key the client did not actually send, keeping "only provided fields updated".
 */
export async function readPatchBody<S extends z.ZodType>(
  event: H3Event,
  schema: S,
): Promise<z.output<S>> {
  const { raw, value } = await readValidatedBody(event, (data) => ({
    raw: data,
    value: schema.parse(data) as Record<string, unknown>,
  }))
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw createError({ statusCode: 400, message: 'Invalid body' })
  }
  const sentKeys = new Set(Object.keys(raw))
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => sentKeys.has(key)),
  ) as z.output<S>
}

/**
 * Guard for reorder endpoints: the submitted ids must be exactly the entity's
 * current id set — same size, no duplicates, no unknown ids — or 400.
 */
export function validateIdsPresent(rows: { id: number }[], ids: number[]): void {
  const present = new Set(rows.map((row) => row.id))
  const submitted = new Set(ids)
  const exact =
    submitted.size === ids.length &&
    ids.length === present.size &&
    ids.every((id) => present.has(id))
  if (!exact) {
    throw createError({ statusCode: 400, message: 'Unknown ids' })
  }
}

/** Experience row with JSON-text bullets/tech parsed to string arrays. */
export function serializeExperienceAdmin(row: Experience) {
  return {
    ...row,
    bullets: parseStringArray(row.bullets),
    tech: parseStringArray(row.tech),
  }
}

/** Project row with JSON-text tech parsed to a string array (all columns kept). */
export function serializeProjectAdmin(row: Project) {
  return { ...row, tech: parseStringArray(row.tech) }
}
