import type { z } from 'zod'
import type { userRole } from '../schemas/common'

// Shape stored in the sealed session cookie (AUTH-3/8) and returned by
// GET /api/auth/session. Keep it minimal: only public, non-sensitive fields.
export interface SessionUser {
  id: number
  githubId: number
  username: string
  avatarUrl: string
  role: z.infer<typeof userRole>
}
