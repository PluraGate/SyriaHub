import Link from 'next/link'
import { Clock, User } from 'lucide-react'
import { TagChip } from './TagChip'

interface PostAuthor {
  id?: string
  name?: string | null
  email?: string | null
}

interface PostCardData {
  id: string
  title: string
  content: string
  created_at: string
  author_id?: string
  tags?: string[]
  author?: PostAuthor | null
}

interface PostCardProps {
  post: PostCardData
  showAuthor?: boolean
}

export function PostCard({ post, showAuthor = true }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
      }
      return `${diffInHours}h ago`
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  const getExcerpt = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + '...'
  }

  const displayAuthor =
    post.author?.name ||
    post.author?.email?.split('@')[0] ||
    'Anonymous'

  return (
    <article className="card card-hover p-6 group">
      <Link 
        href={`/post/${post.id}`}
        className="focus-ring rounded-lg"
      >
        {/* Post Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-display font-semibold text-xl text-primary dark:text-dark-text group-hover:text-accent dark:group-hover:text-accent-light transition-colors line-clamp-2">
            {post.title}
          </h3>
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
        <div className="flex items-center gap-4 text-sm text-text-light dark:text-dark-text-muted">
          {showAuthor && (
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" aria-hidden="true" />
              <span className="hover:text-primary dark:hover:text-accent-light transition-colors">
                {displayAuthor}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <time dateTime={post.created_at}>
              {formatDate(post.created_at)}
            </time>
          </div>
        </div>
      </Link>
    </article>
  )
}
