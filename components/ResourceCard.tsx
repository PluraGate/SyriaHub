'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { FileText, Download, Calendar, Database, FileType, Wrench, Film, FileSpreadsheet, Link2, Clock, PenTool } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { TagChip } from './TagChip'
import { cn, getInitials, getAvatarGradient, inferResourceType } from '@/lib/utils'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface ResourceMetadata {
    url: string
    size: number
    mime_type: string
    original_name: string
    downloads: number
    license?: string
    resource_type?: 'dataset' | 'paper' | 'tool' | 'media' | 'template' | 'design'
}

interface ResourcePost {
    id: string
    title: string
    content: string
    created_at: string
    author?: {
        id?: string
        name?: string | null
        email?: string | null
        avatar_url?: string | null
    } | null
    author_id?: string
    tags?: string[]
    metadata: ResourceMetadata
    linked_posts_count?: number
}

interface ResourceCardProps {
    resource: ResourcePost
    preCalculatedType?: string
}

const RESOURCE_TYPE_CONFIG = {
    dataset: { icon: Database, label: 'Dataset', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    paper: { icon: FileType, label: 'Paper', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    tool: { icon: Wrench, label: 'Tool', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    media: { icon: Film, label: 'Media', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
    template: { icon: FileSpreadsheet, label: 'Template', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    design: { icon: PenTool, label: 'Design', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
    document: { icon: FileText, label: 'Resource', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}

export function ResourceCard({ resource, preCalculatedType }: ResourceCardProps) {
    const formatSize = (bytes: number) => {
        if (typeof bytes !== 'number' || bytes <= 0) return null
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const displayAuthor = resource.author?.name || resource.author?.email?.split('@')[0] || 'Anonymous'
    const metadata = resource.metadata || {}

    // Prioritize pre-calculated type from server, then fallback to client inference or default
    const resourceType = (preCalculatedType?.toLowerCase() as keyof typeof RESOURCE_TYPE_CONFIG) ||
        (metadata.resource_type?.toLowerCase() as keyof typeof RESOURCE_TYPE_CONFIG) ||
        (inferResourceType(metadata.mime_type, metadata.original_name, resource.title) as keyof typeof RESOURCE_TYPE_CONFIG) ||
        'document'

    const typeConfig = RESOURCE_TYPE_CONFIG[resourceType]
    const TypeIcon = typeConfig?.icon || FileText

    const sizeDisplay = formatSize(metadata.size)

    const { formatDate } = useDateFormatter()

    const t = useTranslations('Common')
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
                            <h3 className="text-xl font-bold text-text dark:text-dark-text truncate" title={resource.title}>
                                {resource.title}
                            </h3>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {typeConfig && (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeConfig.color}`}>
                                {typeConfig.label}
                            </span>
                        )}
                        {sizeDisplay && (
                            <span className="text-[10px] font-mono font-bold bg-primary/5 dark:bg-primary/20 border border-primary/10 dark:border-primary/30 px-2 py-1 rounded text-primary dark:text-secondary-light transition-colors">
                                {sizeDisplay}
                            </span>
                        )}
                    </div>
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
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            {resource.author?.avatar_url ? (
                                <Image
                                    src={resource.author.avatar_url}
                                    alt={displayAuthor}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            ) : (
                                <div className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white',
                                    getAvatarGradient(resource.author?.id || undefined)
                                )}>
                                    {getInitials(resource.author?.name || undefined)}
                                </div>
                            )}
                            <span className="hover:text-primary dark:hover:text-accent-light transition-colors whitespace-nowrap">
                                {displayAuthor}
                            </span>
                        </div>

                        <span className="text-text-muted/50">·</span>

                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{formatDate(resource.created_at, 'distance')}</span>
                        </div>

                        {metadata.license && (
                            <>
                                <span className="text-text-muted/50">·</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/10 dark:bg-secondary/20 text-secondary-dark dark:text-secondary-light border border-secondary/20 dark:border-secondary/40 text-[10px] font-bold uppercase tracking-tight">
                                    <span>{tLicenses(metadata.license.replace(/\./g, '_'))}</span>
                                </div>
                            </>
                        )}
                        {(resource.linked_posts_count ?? 0) > 0 && (
                            <>
                                <span className="text-text-muted/50">·</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                                    <Link2 className="w-3 h-3" />
                                    <span>Used in {resource.linked_posts_count} post{resource.linked_posts_count !== 1 ? 's' : ''}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-primary dark:text-secondary-light font-bold text-[10px] uppercase tracking-wider">
                        <Download className="w-3.5 h-3.5" />
                        <span>{metadata.downloads || 0} {t('downloads')}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

