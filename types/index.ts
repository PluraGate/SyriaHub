// Database types for SyriaHub platform

export type UserRole = 'researcher' | 'moderator' | 'admin'
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  bio?: string
  affiliation?: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  tags: string[]
  author_id: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  content: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Report {
  id: string
  post_id: string
  reporter_id: string
  reason: string
  status: ReportStatus
  created_at: string
}

export interface Role {
  id: string
  name: string
  permissions: Record<string, any>
}

export interface Citation {
  id: string
  source_post_id: string
  target_post_id: string
  created_at: string
}

export interface Tag {
  id: string
  label: string
  discipline?: string
  color: string
}

// Extended types with relations
export interface PostWithAuthor extends Post {
  author: User
}

export interface PostWithStats extends Post {
  author_name: string
  comment_count: number
  citation_count: number
}

export interface CommentWithUser extends Comment {
  user: User
}

export interface ReportWithDetails extends Report {
  post: Post
  reporter: User
}

// Form types
export interface CreatePostInput {
  title: string
  content: string
  tags: string[]
}

export interface UpdatePostInput {
  title?: string
  content?: string
  tags?: string[]
}

export interface CreateCommentInput {
  content: string
  post_id: string
}

export interface CreateReportInput {
  post_id: string
  reason: string
}

export interface UpdateUserProfileInput {
  name?: string
  bio?: string
  affiliation?: string
}

