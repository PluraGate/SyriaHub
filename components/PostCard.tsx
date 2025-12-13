import Link from 'next/link'
import { MessageSquare, Quote, Calendar, User, Tag, GitFork } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { TagChip } from './TagChip'
import { ReportButton } from '@/components/ReportButton'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ReviewBadgeInline } from '@/components/ReviewBadge'
import { PlagiarismDetails } from '@/components/PlagiarismDetails'
import { Post } from '@/types'

interface PostCardProps {
  post: Post & {
    author?: {
      name?: string
      full_name?: string
      email?: string
      is_verified_author?: boolean
    } | null
    approval_status?: 'pending' | 'approved' | 'flagged' | 'rejected'
    approved_by_role?: 'moderator' | 'admin' | null
  }
  showAuthor?: boolean
}

export function PostCard({ post, showAuthor = true }: PostCardProps) {
  const getExcerpt = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + '...'
  }

  const displayAuthor =
    post.author?.name ||
    post.author?.full_name ||
    post.author?.email?.split('@')[0] ||
    'Anonymous'

  return (
    <article className="card card-premium card-glow card-hover p-6 group">
      <Link
        href={`/post/${post.id}`}
        className="focus-ring rounded-lg block"
      >
        {/* Post Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            {post.forked_from_id && (
              <span className="text-xs text-text-light dark:text-dark-text-muted flex items-center gap-1 mb-1">
                <GitFork className="w-3 h-3" />
                Forked
              </span>
            )}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-semibold text-xl text-primary dark:text-dark-text group-hover:text-secondary dark:group-hover:text-secondary-light transition-colors line-clamp-2">
                {post.title}
              </h3>
              <ReviewBadgeInline
                status={post.approval_status}
                approverRole={post.approved_by_role}
                isVerifiedAuthor={post.author?.is_verified_author}
              />
            </div>
          </div>
          {post.license && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-surface text-text-light dark:text-dark-text-muted border border-gray-200 dark:border-dark-border whitespace-nowrap">
              {post.license}
            </span>
          )}
        </div>

        {/* Post Content Preview */}
        <p className="text-text-light dark:text-dark-text-muted leading-relaxed line-clamp-3 mb-4">
          {getExcerpt(post.content)}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <TagChip key={tag} tag={tag} size="sm" />
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-text-light dark:text-dark-text-muted">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Post Meta */}
        <div className="flex items-center gap-4 text-sm text-text-light dark:text-dark-text-muted mb-4">
          {showAuthor && (
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" aria-hidden="true" />
              <span className="hover:text-primary dark:hover:text-accent-light transition-colors">
                {displayAuthor}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <time dateTime={post.created_at}>
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </time>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
        <div className="flex items-center gap-4">
          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 text-sm text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comment_count || 0} Comments</span>
          </Link>
          <div className="flex items-center gap-1.5 text-sm text-text-light dark:text-dark-text-muted">
            <Quote className="w-4 h-4" />
            <span>{post.citation_count || 0} Citations</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <BookmarkButton postId={post.id} />
          <ReportButton postId={post.id} />
        </div>
      </div>
    </article>
  )
}
