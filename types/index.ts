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
  avatar_url?: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  tags?: string[]
  author_id: string
  created_at: string
  updated_at: string

  // Forum & Workflow fields
  content_type: 'article' | 'question' | 'answer'
  status: 'draft' | 'queued' | 'published' | 'archived'
  parent_id?: string | null
  forked_from_id?: string | null
  group_id?: string | null
  is_accepted?: boolean
  license?: string | null

  // Stats
  view_count?: number
  vote_count?: number
  comment_count?: number
  citation_count?: number

  // Optional relations
  author?: User
}



export interface PostVersion {
  id: string
  post_id: string
  version_number: number
  title: string
  content: string
  tags: string[]
  author_id: string | null
  editor_id: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface PostVote {
  id: string
  post_id: string
  voter_id: string
  value: 1 | -1
  created_at: string
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
  post_id: string | null
  comment_id: string | null
  reporter_id: string
  reason: string
  status: ReportStatus
  content_type: 'post' | 'comment'
  content_snapshot?: Record<string, any>
  moderation_data?: Record<string, any>
  reviewed_by?: string
  reviewed_at?: string
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
  post?: Post
  comment?: Comment
  reporter: User
  reviewer?: User
}

// Moderation types
export interface ModerationCategory {
  hate?: boolean
  'hate/threatening'?: boolean
  harassment?: boolean
  'harassment/threatening'?: boolean
  'self-harm'?: boolean
  'self-harm/intent'?: boolean
  'self-harm/instructions'?: boolean
  sexual?: boolean
  'sexual/minors'?: boolean
  violence?: boolean
  'violence/graphic'?: boolean
}

export interface ModerationResult {
  flagged: boolean
  categories: ModerationCategory
  categoryScores: Record<string, number>
  details?: string[]
}

export interface PlagiarismCheckResult {
  isPlagiarized: boolean
  similarityScore: number
  sources?: string[]
  details?: string
}

export interface ContentCheckResult {
  moderation: ModerationResult
  plagiarism: PlagiarismCheckResult
  shouldBlock: boolean
  warnings: string[]
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
  post_id?: string
  comment_id?: string
  content_type?: 'post' | 'comment'
  content_id?: string
  reason: string
}

export interface UpdateReportInput {
  status: ReportStatus
  action?: 'delete_content' | 'warn_user' | 'none'
  notes?: string
}

export interface UpdateUserProfileInput {
  name?: string
  bio?: string
  affiliation?: string
}

