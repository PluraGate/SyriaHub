import { Link } from '@/navigation'
import { FileText, Download, Database, FileType, Wrench, Film, FileSpreadsheet, Link2, ExternalLink } from 'lucide-react'

interface ResourceMetadata {
    url?: string
    size?: number
    mime_type?: string
    original_name?: string
    downloads?: number
    license?: string
    resource_type?: 'dataset' | 'paper' | 'tool' | 'media' | 'template'
}

interface LinkedResource {
    id: string
    title: string
    metadata: ResourceMetadata
    created_at: string
}

interface LinkedResourcesSectionProps {
    resources: LinkedResource[]
}

const RESOURCE_TYPE_ICONS = {
    dataset: Database,
    paper: FileType,
    tool: Wrench,
    media: Film,
    template: FileSpreadsheet,
}

const RESOURCE_TYPE_COLORS = {
    dataset: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    paper: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    tool: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    media: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    template: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export function LinkedResourcesSection({ resources }: LinkedResourcesSectionProps) {
    if (!resources || resources.length === 0) return null

    const formatSize = (bytes?: number) => {
        if (!bytes) return ''
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const getResourceIcon = (resourceType?: string) => {
        const IconComponent = resourceType
            ? RESOURCE_TYPE_ICONS[resourceType as keyof typeof RESOURCE_TYPE_ICONS]
            : FileText
        return IconComponent || FileText
    }

    const getResourceColor = (resourceType?: string) => {
        return resourceType
            ? RESOURCE_TYPE_COLORS[resourceType as keyof typeof RESOURCE_TYPE_COLORS]
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-text-light dark:text-dark-text-muted mb-4 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Linked Resources
            </h3>
            <div className="space-y-3">
                {resources.map(resource => {
                    const Icon = getResourceIcon(resource.metadata?.resource_type)
                    const colorClass = getResourceColor(resource.metadata?.resource_type)

                    return (
                        <Link
                            key={resource.id}
                            href={`/resources/${resource.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-surface-hover hover:bg-gray-100 dark:hover:bg-dark-border transition-colors group"
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-text dark:text-dark-text text-sm line-clamp-1 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                                    {resource.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-text-muted dark:text-dark-text-muted">
                                    {resource.metadata?.resource_type && (
                                        <span className="capitalize">{resource.metadata.resource_type}</span>
                                    )}
                                    {resource.metadata?.size && (
                                        <>
                                            <span>•</span>
                                            <span>{formatSize(resource.metadata.size)}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-text-muted dark:text-dark-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    )
                })}
            </div>

            {resources.length > 0 && resources[0].metadata?.url && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                    <a
                        href={resources[0].metadata.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download Primary Resource
                    </a>
                </div>
            )}
        </div>
    )
}
