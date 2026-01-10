'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
    FolderKanban,
    Users,
    FileText,
    Calendar,
    Eye,
    Lock,
    Globe,
    ChevronRight,
    Plus
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Project {
    id: string
    title: string
    description: string | null
    cover_image_url: string | null
    status: 'draft' | 'active' | 'completed' | 'archived'
    visibility: 'public' | 'private' | 'members_only'
    created_at: string
    post_count: number
    member_count: number
    view_count: number
    tags: string[]
    created_by: {
        name?: string
        email?: string
    } | null
}

interface ProjectCardProps {
    project: Project
    variant?: 'default' | 'compact'
}

export function ProjectCard({ project, variant = 'default' }: ProjectCardProps) {
    const creatorName = project.created_by?.name ||
        project.created_by?.email?.split('@')[0] ||
        'Unknown'

    const statusColors = {
        draft: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        archived: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    }

    const visibilityIcons = {
        public: Globe,
        private: Lock,
        members_only: Users,
    }
    const VisibilityIcon = visibilityIcons[project.visibility]

    if (variant === 'compact') {
        return (
            <Link
                href={`/project/${project.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-dark-border hover:border-primary dark:hover:border-primary-light transition-colors"
            >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text dark:text-dark-text truncate">
                        {project.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-text-light dark:text-dark-text-muted">
                        <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {project.post_count}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {project.member_count}
                        </span>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
            </Link>
        )
    }

    return (
        <Link
            href={`/project/${project.id}`}
            className="group block card card-hover overflow-hidden"
        >
            {/* Cover Image */}
            {project.cover_image_url ? (
                <div className="relative h-40 bg-gray-100 dark:bg-dark-surface overflow-hidden">
                    <Image
                        src={project.cover_image_url}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                            {project.status}
                        </span>
                        <span className="p-1 rounded-full bg-black/30 text-white" title={project.visibility}>
                            <VisibilityIcon className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </div>
            ) : (
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <FolderKanban className="w-16 h-16 text-primary/50" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                            {project.status}
                        </span>
                        <span className="p-1 rounded-full bg-white/50 dark:bg-black/30 text-text-light dark:text-dark-text-muted" title={project.visibility}>
                            <VisibilityIcon className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-lg text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-1">
                    {project.title}
                </h3>

                {project.description && (
                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1 line-clamp-2">
                        {project.description}
                    </p>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {project.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-dark-surface text-xs text-text-light dark:text-dark-text-muted rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                        {project.tags.length > 3 && (
                            <span className="text-xs text-text-light dark:text-dark-text-muted">
                                +{project.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
                    <div className="flex items-center gap-4 text-sm text-text-light dark:text-dark-text-muted">
                        <span className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4" />
                            {project.post_count} posts
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {project.member_count}
                        </span>
                    </div>
                    <span className="text-xs text-text-light dark:text-dark-text-muted">
                        {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                    </span>
                </div>
            </div>
        </Link>
    )
}

/**
 * List of projects with optional filters
 */
interface ProjectListProps {
    userId?: string
    limit?: number
    showCreateButton?: boolean
}

export function ProjectList({ userId, limit = 10, showCreateButton = false }: ProjectListProps) {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        async function fetchProjects() {
            try {
                let query = supabase
                    .from('projects')
                    .select(`
            *,
            created_by:users!projects_created_by_fkey(name, email)
          `)
                    .order('created_at', { ascending: false })
                    .limit(limit)

                if (userId) {
                    query = query.or(`created_by.eq.${userId},project_members.user_id.eq.${userId}`)
                } else {
                    query = query.eq('visibility', 'public')
                }

                const { data, error } = await query

                if (error) throw error
                setProjects(data || [])
            } catch (error) {
                console.error('Error fetching projects:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [userId, limit, supabase])

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-dark-surface animate-pulse" />
                ))}
            </div>
        )
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-12">
                <FolderKanban className="w-12 h-12 mx-auto text-text-light dark:text-dark-text-muted opacity-50 mb-4" />
                <p className="text-text-light dark:text-dark-text-muted">No projects yet</p>
                {showCreateButton && (
                    <Link
                        href="/project/new"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Project
                    </Link>
                )}
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    )
}
