// Database types for SyriaHub platform

export type UserRole = 'member' | 'researcher' | 'moderator' | 'admin'
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed'

// Epistemic Architecture Types
export type ContentType = 'article' | 'question' | 'answer' | 'resource' | 'event' | 'trace'
export type CitationType = 'supports' | 'disputes' | 'extends' | 'mentions'
export type ResearchGapStatus = 'identified' | 'investigating' | 'addressed' | 'closed'
export type ResearchGapPriority = 'low' | 'medium' | 'high' | 'critical'
export type ResearchGapType = 'topical' | 'data' | 'methodological' | 'population' | 'outdated'
export type ResearchGapSource = 'manual' | 'ai_suggested' | 'failed_query'
export type TraceArtifactType = 'photo' | 'audio' | 'document' | 'video' | 'handwritten'
export type TracePreservationStatus = 'original' | 'copy' | 'transcription'

// Metadata interfaces for specialized content types
export interface TraceMetadata {
  artifact_type: TraceArtifactType
  source_context?: string
  collection_date?: string
  preservation_status: TracePreservationStatus
  language?: string
  file_url?: string
  thumbnail_url?: string
}

export interface EventMetadata {
  start_time: string
  end_time?: string
  location?: string
  link?: string
  status?: 'scheduled' | 'cancelled' | 'postponed'
}

// Research Gap interface (The "Absence" Model)
export interface ResearchGap {
  id: string
  title: string
  description?: string
  discipline?: string
  status: ResearchGapStatus
  priority: ResearchGapPriority
  gap_type?: ResearchGapType
  is_strategic?: boolean
  source?: ResearchGapSource
  created_by?: string
  created_at: string
  updated_at: string
  claimed_by?: string
  claimed_at?: string
  addressed_by_post_id?: string
  addressed_at?: string
  upvote_count: number
  interest_count?: number
  temporal_context_start?: string
  temporal_context_end?: string
  spatial_context?: string
  tags?: string[]
  linked_failed_queries?: string[]
  // Relations
  creator?: User
  claimer?: User
  addressed_by_post?: Post
}

export interface ResearchGapUpvote {
  id: string
  gap_id: string
  user_id: string
  created_at: string
}

export interface ResearchGapInterest {
  id: string
  gap_id: string
  user_id: string
  note?: string
  created_at: string
  user?: User
}

export interface ResearchGapSuggestion {
  id: string
  gap_id: string
  suggested_by?: string
  title: string
  url?: string
  post_id?: string
  note?: string
  created_at: string
  suggestor?: User
  post?: Post
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  bio?: string
  affiliation?: string
  avatar_url?: string
  cover_image_url?: string
  reputation?: number
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
  content_type: ContentType
  status: 'draft' | 'queued' | 'published' | 'archived'
  parent_id?: string | null
  forked_from_id?: string | null
  group_id?: string | null
  is_accepted?: boolean
  accepted_answer_id?: string | null
  license?: string | null

  // Epistemic fields (temporal & spatial coverage)
  temporal_coverage_start?: string | null
  temporal_coverage_end?: string | null
  spatial_coverage?: string | null

  // Impact metrics (shift from gamification)
  academic_impact_score?: number
  reuse_count?: number

  // Metadata (structure varies by content_type: TraceMetadata | EventMetadata | generic)
  metadata?: Record<string, any>

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
  quote_content?: string
  citation_type: CitationType
  created_at: string
}

export interface Tag {
  id: string
  label: string
  discipline?: string
  color: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string
  criteria: Record<string, any>
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  awarded_at: string
  badge?: Badge
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
  parent_id?: string | null
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

