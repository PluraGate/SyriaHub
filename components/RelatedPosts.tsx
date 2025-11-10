import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { TagChip } from './TagChip'

interface RelatedPost {
  id: string
  title: string
  tags?: string[]
  created_at: string
  author_email?: string
}

interface RelatedPostsProps {
  posts: RelatedPost[]
  title?: string
}

export function RelatedPosts({ posts, title = 'Related Research' }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-primary dark:text-accent-light" />
        <h3 className="font-display font-semibold text-lg text-primary dark:text-dark-text">
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors group"
          >
            <h4 className="font-medium text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-accent-light transition-colors mb-2 line-clamp-2">
              {post.title}
            </h4>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <TagChip key={tag} tag={tag} size="sm" />
                ))}
              </div>
            )}

            <p className="text-xs text-text-light dark:text-dark-text-muted">
              {post.author_email?.split('@')[0] || 'Anonymous'} •{' '}
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
