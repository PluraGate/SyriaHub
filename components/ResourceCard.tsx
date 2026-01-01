import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FileText, Download, User, Calendar, Database, FileType, Wrench, Film, FileSpreadsheet, Link2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { TagChip } from './TagChip'

interface ResourceMetadata {
    url: string
    size: number
    mime_type: string
    original_name: string
    downloads: number
    license?: string
    resource_type?: 'dataset' | 'paper' | 'tool' | 'media' | 'template'
}

interface ResourcePost {
    id: string
    title: string
    content: string
    created_at: string
    author?: { name?: string | null, email?: string | null } | null
    tags?: string[]
    metadata: ResourceMetadata
    linked_posts_count?: number
}

interface ResourceCardProps {
    resource: ResourcePost
}

const RESOURCE_TYPE_CONFIG = {
    dataset: { icon: Database, label: 'Dataset', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    paper: { icon: FileType, label: 'Paper', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    tool: { icon: Wrench, label: 'Tool', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    media: { icon: Film, label: 'Media', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
    template: { icon: FileSpreadsheet, label: 'Template', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
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
    const metadata = resource.metadata || {}
    const resourceType = metadata.resource_type
    const typeConfig = resourceType ? RESOURCE_TYPE_CONFIG[resourceType] : null
    const TypeIcon = typeConfig?.icon || FileText

    const tLicenses = useTranslations('Licenses')

    return (
        <div className="card hover:border-primary/50 transition-colors group p-6 flex gap-6">
            <div className="flex-shrink-0">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${typeConfig ? typeConfig.color : 'bg-primary/10 dark:bg-primary/20 text-primary'
                    }`}>
                    <TypeIcon className="w-8 h-8" />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href={`/resources/${resource.id}`} className="group-hover:text-primary transition-colors min-w-0">
                            <h3 className="text-xl font-bold text-text dark:text-dark-text truncate">
                                {resource.title}
                            </h3>
                        </Link>
                        {typeConfig && (
                            <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${typeConfig.color}`}>
                                {typeConfig.label}
                            </span>
                        )}
                    </div>
                    <span className="flex-shrink-0 text-xs font-mono bg-gray-100 dark:bg-dark-surface-hover px-2 py-1 rounded text-text-light dark:text-dark-text-muted">
                        {formatSize(metadata.size || 0)}
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
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            <span>{displayAuthor}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
                        </div>
                        {metadata.license && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-surface-hover text-xs font-medium">
                                <span>{tLicenses(metadata.license.replace(/\./g, '_'))}</span>
                            </div>
                        )}
                        {(resource.linked_posts_count ?? 0) > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                                <Link2 className="w-3 h-3" />
                                <span>Used in {resource.linked_posts_count} post{resource.linked_posts_count !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-primary font-medium">
                        <Download className="w-4 h-4" />
                        <span>{metadata.downloads || 0} Downloads</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

