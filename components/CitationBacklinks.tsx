import Link from 'next/link'
import { Link2 } from 'lucide-react'

interface CitationAuthor {
  name?: string | null
  email?: string | null
}

interface CitationBacklink {
  id: string
  title: string
  created_at: string
  author?: CitationAuthor | null
  quote_content?: string | null
}

interface CitationBacklinksProps {
  citations: CitationBacklink[]
}

export function CitationBacklinks({ citations }: CitationBacklinksProps) {
  if (citations.length === 0) return null

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link2 className="w-5 h-5 text-accent dark:text-accent-light" />
        <h3 className="font-display font-semibold text-lg text-primary dark:text-dark-text">
          Mentioned In ({citations.length})
        </h3>
      </div>

      <div className="space-y-3">
        {citations.map((citation) => (
          <Link
            key={citation.id}
            href={`/post/${citation.id}`}
            className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors group"
          >
            <h4 className="font-medium text-sm text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-accent-light transition-colors mb-1 line-clamp-2">
              {citation.title}
            </h4>
            {citation.quote_content && (
              <blockquote className="text-xs text-text-light dark:text-dark-text-muted italic border-l-2 border-gray-300 dark:border-dark-border pl-2 my-2 line-clamp-3">
                &quot;{citation.quote_content}&quot;
              </blockquote>
            )}
            <p className="text-xs text-text-light dark:text-dark-text-muted">
              By {citation.author?.name || citation.author?.email?.split('@')[0] || 'Anonymous'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
