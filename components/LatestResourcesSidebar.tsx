'use client'

import { Link } from '@/navigation'
import { Database, FileText, Wrench, Film, FileSpreadsheet, PenTool, File, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

interface Resource {
    id: string
    title: string
    slug: string
    created_at: string
    metadata?: {
        resource_type?: string
    }
    author?: {
        name?: string
    }
}

interface LatestResourcesSidebarProps {
    resources: Resource[]
    locale: string
}

const getIconForType = (type: string | undefined) => {
    switch (type) {
        case 'dataset': return Database
        case 'paper': return FileText
        case 'tool': return Wrench
        case 'media': return Film
        case 'template': return FileSpreadsheet
        case 'design': return PenTool
        default: return File
    }
}

const getColorForType = (type: string | undefined) => {
    switch (type) {
        case 'dataset': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
        case 'paper': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
        case 'tool': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
        case 'media': return 'text-pink-500 bg-pink-50 dark:bg-pink-900/20'
        case 'template': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
        case 'design': return 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
        default: return 'text-gray-500 bg-gray-50 dark:bg-gray-800'
    }
}

export function LatestResourcesSidebar({ resources, locale }: LatestResourcesSidebarProps) {
    const t = useTranslations('Landing')

    if (!resources || resources.length === 0) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wide">
                    {t('latestResources')}
                </h3>
                <Link
                    href="/resources"
                    className="text-xs text-primary hover:text-primary-dark dark:text-primary-light transition-colors flex items-center gap-1"
                >
                    {t('viewAll')}
                    <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-3">
                {resources.map((resource) => {
                    const type = resource.metadata?.resource_type
                    const Icon = getIconForType(type)
                    const colorClass = getColorForType(type)

                    return (
                        <div
                            key={resource.id}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors group"
                        >
                            <div className={`p-2 rounded-md ${colorClass} shrink-0`}>
                                <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0 pt-0.5">
                                <Link href={`/resources/${resource.slug}`} className="block">
                                    <h4 className="text-sm font-medium text-text dark:text-dark-text truncate group-hover:text-primary transition-colors">
                                        {resource.title}
                                    </h4>
                                </Link>

                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-text-light dark:text-dark-text-muted truncate">
                                        {resource.author?.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-600">•</span>
                                    <span className="text-xs text-text-light dark:text-dark-text-muted">
                                        {formatDistanceToNow(new Date(resource.created_at), {
                                            addSuffix: true,
                                            locale: locale === 'ar' ? ar : enUS
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
