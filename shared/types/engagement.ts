// Engagement API payload types (DEV_PLAN M6, PRD §6.4) — shared by the public
// comment/like endpoints, the admin moderation endpoints, and the client UI.
// Dates cross the wire as ISO strings.

export interface CommentUser {
  username: string
  avatarUrl: string
}

export interface CommentItem {
  id: number
  body: string
  createdAt: string
  user: CommentUser
  /** Session-aware: true when the requester is the author or an admin (ENG-4). */
  canDelete: boolean
}

export interface CommentsPage {
  comments: CommentItem[]
  total: number
  page: number
  pageSize: number
}

// ADM-19 moderation rows: include soft-deleted comments and their project.
export interface AdminCommentItem extends CommentItem {
  deletedAt: string | null
  project: {
    id: number
    title: string
    slug: string
  }
}

export interface LikeToggleResponse {
  liked: boolean
  likeCount: number
}

export interface LikedProjectsResponse {
  likedProjectIds: number[]
}

// ADM-21 inbox rows (PUB-8 stores these from the public contact form).
export interface AdminMessageItem {
  id: number
  name: string
  email: string
  message: string
  emailDelivered: boolean
  createdAt: string
  readAt: string | null
}
