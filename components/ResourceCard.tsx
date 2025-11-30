import Link from 'next/link'
import { FileText, Download, User, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { TagChip } from './TagChip'

interface ResourceMetadata {
    url: string
    size: number
    mime_type: string
    original_name: string
    downloads: number
    license?: string
}

interface ResourcePost {
    id: string
    title: string
    content: string
    created_at: string
    author?: { name?: string | null, email?: string | null } | null
    tags?: string[]
    metadata: ResourceMetadata
}

interface ResourceCardProps {
    resource: ResourcePost
}

export function ResourceCard({ resource }: ResourceCardProps) {
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const displayAuthor = resource.author?.name || resource.author?.email?.split('@')[0] || 'Anonymous'

    return (
        <div className="card hover:border-primary/50 transition-colors group p-6 flex gap-6">
            <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                    <FileText className="w-8 h-8" />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <Link href={`/resources/${resource.id}`} className="group-hover:text-primary transition-colors">
                        <h3 className="text-xl font-bold text-text dark:text-dark-text truncate">
                            {resource.title}
                        </h3>
                    </Link>
                    <span className="text-xs font-mono bg-gray-100 dark:bg-dark-surface-hover px-2 py-1 rounded text-text-light dark:text-dark-text-muted">
                        {formatSize(resource.metadata.size)}
                    </span>
                </div>

                <p className="text-text-light dark:text-dark-text-muted line-clamp-2 mb-4 text-sm">
                    {resource.content}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {resource.tags?.map(tag => (
                        <TagChip key={tag} tag={tag} size="sm" />
                    ))}
                </div>

                <div className="flex items-center justify-between text-sm text-text-light dark:text-dark-text-muted border-t border-gray-100 dark:border-dark-border pt-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            <span>{displayAuthor}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
                        </div>
                        {resource.metadata.license && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-surface-hover text-xs font-medium">
                                <span>{resource.metadata.license}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-primary font-medium">
                        <Download className="w-4 h-4" />
                        <span>{resource.metadata.downloads || 0} Downloads</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
