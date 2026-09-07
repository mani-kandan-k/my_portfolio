import type { Comment, Project, User } from '@prisma/client'
import type { AdminCommentItem, CommentItem } from '~/shared/types/engagement'

export type CommentWithUser = Comment & { user: Pick<User, 'username' | 'avatarUrl'> }
export type AdminCommentRow = CommentWithUser & {
  project: Pick<Project, 'id' | 'title' | 'slug'>
}

// Select fragment shared by every comment query.
export const commentUserSelect = { username: true, avatarUrl: true } as const

// Comment bodies are plain text by contract (ENG-5) — they are rendered with
// {{ }} interpolation on the client, never v-html, so no escaping happens here.
export function serializeComment(comment: CommentWithUser, canDelete: boolean): CommentItem {
  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    user: { username: comment.user.username, avatarUrl: comment.user.avatarUrl },
    canDelete,
  }
}

// ADM-19: moderation always allows delete, and surfaces soft-delete state + project.
export function serializeAdminComment(comment: AdminCommentRow): AdminCommentItem {
  return {
    ...serializeComment(comment, true),
    deletedAt: comment.deletedAt?.toISOString() ?? null,
    project: {
      id: comment.project.id,
      title: comment.project.title,
      slug: comment.project.slug,
    },
  }
}
