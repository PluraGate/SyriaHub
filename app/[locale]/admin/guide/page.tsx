'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdminSidebar } from '@/components/admin'
import { useTranslations } from 'next-intl'
import {
    BookOpenCheck,
    ChevronDown,
    ChevronRight,
    Users,
    FileText,
    AlertTriangle,
    MessageSquareWarning,
    Tag,
    Shield,
    History,
    BarChart3,
    Activity,
    Search,
    Database,
    Settings,
    UserPlus,
    MessagesSquare,
    MessageSquarePlus,
    BookOpen,
    Award,
    Scale,
    Eye,
    Loader2,
    ListChecks
} from 'lucide-react'
import { cn } from '@/lib/utils'

type UserRole = 'admin' | 'moderator'

interface GuideSection {
    id: string
    titleKey: string
    icon: typeof BookOpenCheck
    descKey: string
    contentKeys: string[]
    stepsKeys?: string[]
    stepsLabel?: string
    category: string
    adminOnly?: boolean
}

const guideSections: GuideSection[] = [
    // --- Getting Started ---
    {
        id: 'overview',
        titleKey: 'overview.title',
        icon: BookOpenCheck,
        descKey: 'overview.desc',
        contentKeys: ['overview.content1', 'overview.content2', 'overview.content3'],
        stepsLabel: 'overview.stepsLabel',
        stepsKeys: ['overview.step1', 'overview.step2', 'overview.step3', 'overview.step4'],
        category: 'gettingStarted',
    },
    {
        id: 'moderation-ethics',
        titleKey: 'moderationEthics.title',
        icon: Scale,
        descKey: 'moderationEthics.desc',
        contentKeys: [
            'moderationEthics.content1',
            'moderationEthics.content2',
            'moderationEthics.content3',
            'moderationEthics.content4',
        ],
        stepsLabel: 'moderationEthics.stepsLabel',
        stepsKeys: ['moderationEthics.step1', 'moderationEthics.step2', 'moderationEthics.step3', 'moderationEthics.step4', 'moderationEthics.step5'],
        category: 'gettingStarted',
    },
    // --- Content & Moderation ---
    {
        id: 'content-moderation',
        titleKey: 'contentModeration.title',
        icon: FileText,
        descKey: 'contentModeration.desc',
        contentKeys: [
            'contentModeration.content1',
            'contentModeration.content2',
            'contentModeration.content3',
            'contentModeration.content4',
            'contentModeration.content5',
        ],
        stepsLabel: 'contentModeration.stepsLabel',
        stepsKeys: ['contentModeration.step1', 'contentModeration.step2', 'contentModeration.step3', 'contentModeration.step4', 'contentModeration.step5'],
        category: 'contentModeration',
    },
    {
        id: 'reports',
        titleKey: 'reports.title',
        icon: AlertTriangle,
        descKey: 'reports.desc',
        contentKeys: ['reports.content1', 'reports.content2', 'reports.content3'],
        stepsLabel: 'reports.stepsLabel',
        stepsKeys: ['reports.step1', 'reports.step2', 'reports.step3', 'reports.step4'],
        category: 'contentModeration',
    },
    {
        id: 'appeals',
        titleKey: 'appeals.title',
        icon: MessageSquareWarning,
        descKey: 'appeals.desc',
        contentKeys: ['appeals.content1', 'appeals.content2', 'appeals.content3', 'appeals.content4'],
        stepsLabel: 'appeals.stepsLabel',
        stepsKeys: ['appeals.step1', 'appeals.step2', 'appeals.step3', 'appeals.step4'],
        category: 'contentModeration',
    },
    {
        id: 'precedents',
        titleKey: 'precedents.title',
        icon: BookOpen,
        descKey: 'precedents.desc',
        contentKeys: ['precedents.content1', 'precedents.content2'],
        stepsLabel: 'precedents.stepsLabel',
        stepsKeys: ['precedents.step1', 'precedents.step2', 'precedents.step3', 'precedents.step4'],
        category: 'contentModeration',
    },
    // --- Platform Tools ---
    {
        id: 'tags',
        titleKey: 'tags.title',
        icon: Tag,
        descKey: 'tags.desc',
        contentKeys: ['tags.content1', 'tags.content2', 'tags.content3'],
        stepsLabel: 'tags.stepsLabel',
        stepsKeys: ['tags.step1', 'tags.step2', 'tags.step3'],
        category: 'platformTools',
    },
    {
        id: 'skills',
        titleKey: 'skills.title',
        icon: Award,
        descKey: 'skills.desc',
        contentKeys: ['skills.content1', 'skills.content2', 'skills.content3'],
        stepsLabel: 'skills.stepsLabel',
        stepsKeys: ['skills.step1', 'skills.step2', 'skills.step3'],
        category: 'platformTools',
    },
    {
        id: 'coordination',
        titleKey: 'coordination.title',
        icon: MessagesSquare,
        descKey: 'coordination.desc',
        contentKeys: ['coordination.content1', 'coordination.content2'],
        stepsLabel: 'coordination.stepsLabel',
        stepsKeys: ['coordination.step1', 'coordination.step2', 'coordination.step3'],
        category: 'platformTools',
    },
    {
        id: 'feedback',
        titleKey: 'feedback.title',
        icon: MessageSquarePlus,
        descKey: 'feedback.desc',
        contentKeys: ['feedback.content1', 'feedback.content2'],
        stepsLabel: 'feedback.stepsLabel',
        stepsKeys: ['feedback.step1', 'feedback.step2', 'feedback.step3'],
        category: 'platformTools',
    },
    // --- Analytics & Monitoring ---
    {
        id: 'analytics',
        titleKey: 'analytics.title',
        icon: BarChart3,
        descKey: 'analytics.desc',
        contentKeys: ['analytics.content1', 'analytics.content2', 'analytics.content3'],
        stepsLabel: 'analytics.stepsLabel',
        stepsKeys: ['analytics.step1', 'analytics.step2', 'analytics.step3'],
        category: 'analyticsMonitoring',
    },
    {
        id: 'platform-health',
        titleKey: 'platformHealth.title',
        icon: Activity,
        descKey: 'platformHealth.desc',
        contentKeys: ['platformHealth.content1', 'platformHealth.content2'],
        stepsLabel: 'platformHealth.stepsLabel',
        stepsKeys: ['platformHealth.step1', 'platformHealth.step2', 'platformHealth.step3'],
        category: 'analyticsMonitoring',
    },
    {
        id: 'search-analytics',
        titleKey: 'searchAnalytics.title',
        icon: Search,
        descKey: 'searchAnalytics.desc',
        contentKeys: ['searchAnalytics.content1', 'searchAnalytics.content2'],
        stepsLabel: 'searchAnalytics.stepsLabel',
        stepsKeys: ['searchAnalytics.step1', 'searchAnalytics.step2', 'searchAnalytics.step3'],
        category: 'analyticsMonitoring',
    },
    // --- Administration (Admin-only) ---
    {
        id: 'user-management',
        titleKey: 'userManagement.title',
        icon: Users,
        descKey: 'userManagement.desc',
        contentKeys: [
            'userManagement.content1',
            'userManagement.content2',
            'userManagement.content3',
            'userManagement.content4',
        ],
        stepsLabel: 'userManagement.stepsLabel',
        stepsKeys: ['userManagement.step1', 'userManagement.step2', 'userManagement.step3', 'userManagement.step4'],
        category: 'administration',
        adminOnly: true,
    },
    {
        id: 'governance',
        titleKey: 'governance.title',
        icon: Shield,
        descKey: 'governance.desc',
        contentKeys: ['governance.content1', 'governance.content2', 'governance.content3'],
        stepsLabel: 'governance.stepsLabel',
        stepsKeys: ['governance.step1', 'governance.step2', 'governance.step3'],
        category: 'administration',
        adminOnly: true,
    },
    {
        id: 'audit-logs',
        titleKey: 'auditLogs.title',
        icon: History,
        descKey: 'auditLogs.desc',
        contentKeys: ['auditLogs.content1', 'auditLogs.content2', 'auditLogs.content3'],
        stepsLabel: 'auditLogs.stepsLabel',
        stepsKeys: ['auditLogs.step1', 'auditLogs.step2', 'auditLogs.step3'],
        category: 'administration',
        adminOnly: true,
    },
    {
        id: 'schema-registry',
        titleKey: 'schemaRegistry.title',
        icon: Database,
        descKey: 'schemaRegistry.desc',
        contentKeys: ['schemaRegistry.content1', 'schemaRegistry.content2'],
        stepsLabel: 'schemaRegistry.stepsLabel',
        stepsKeys: ['schemaRegistry.step1', 'schemaRegistry.step2'],
        category: 'administration',
        adminOnly: true,
    },
    {
        id: 'platform-settings',
        titleKey: 'platformSettings.title',
        icon: Settings,
        descKey: 'platformSettings.desc',
        contentKeys: ['platformSettings.content1', 'platformSettings.content2', 'platformSettings.content3'],
        stepsLabel: 'platformSettings.stepsLabel',
        stepsKeys: ['platformSettings.step1', 'platformSettings.step2', 'platformSettings.step3', 'platformSettings.step4'],
        category: 'administration',
        adminOnly: true,
    },
    {
        id: 'waitlist',
        titleKey: 'waitlist.title',
        icon: UserPlus,
        descKey: 'waitlist.desc',
        contentKeys: ['waitlist.content1', 'waitlist.content2'],
        stepsLabel: 'waitlist.stepsLabel',
        stepsKeys: ['waitlist.step1', 'waitlist.step2', 'waitlist.step3'],
        category: 'administration',
        adminOnly: true,
    },
]

const categoryOrder = ['gettingStarted', 'contentModeration', 'platformTools', 'analyticsMonitoring', 'administration']

export default function AdminGuidePage() {
    const t = useTranslations('Admin.guidePage')
    const tAdmin = useTranslations('Admin')
    const [userRole, setUserRole] = useState<UserRole | null>(null)
    const [loading, setLoading] = useState(true)
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
    const [visibleSteps, setVisibleSteps] = useState<Set<string>>(new Set())
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        async function fetchRole() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                if (data && (data.role === 'admin' || data.role === 'moderator')) {
                    setUserRole(data.role)
                }
            }
            setLoading(false)
        }
        fetchRole()
    }, [supabase])

    const filteredSections = guideSections.filter(section => {
        if (section.adminOnly && userRole === 'moderator') return false
        return true
    })

    const toggleSection = (id: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const toggleSteps = (id: string) => {
        setVisibleSteps(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const expandAll = () => {
        setExpandedSections(new Set(filteredSections.map(s => s.id)))
    }

    const collapseAll = () => {
        setExpandedSections(new Set())
    }

    const scrollToSection = (id: string) => {
        setExpandedSections(prev => new Set(prev).add(id))
        setTimeout(() => {
            document.getElementById(`guide-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background dark:bg-dark-bg">
                <Navbar />
                <div className="flex">
                    <AdminSidebar />
                    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar />

            <div className="flex">
                <AdminSidebar />

                <div className="flex-1 flex flex-col min-w-0">
                    <main className="flex-1 p-3 sm:p-6 md:p-8">
                        <div className="max-w-6xl mx-auto">
                            {/* Header */}
                            <div className="mb-4 sm:mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <BookOpenCheck className="w-7 h-7 text-primary dark:text-secondary" />
                                    <h1 className="text-xl sm:text-3xl font-bold text-text dark:text-dark-text">
                                        {t('title')}
                                    </h1>
                                </div>
                                <p className="text-sm sm:text-base text-text-light dark:text-dark-text-muted mt-1">
                                    {t('subtitle')}
                                </p>
                            </div>

                            {/* Role Badge */}
                            <div className="mb-6">
                                <span className={cn(
                                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                                    userRole === 'admin'
                                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-secondary'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                )}>
                                    <Eye className="w-4 h-4" />
                                    {t('viewingAs', { role: userRole === 'admin' ? tAdmin('roles.admin') : tAdmin('roles.moderator') })}
                                </span>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Table of Contents - Sticky Sidebar */}
                                <aside className="w-full lg:w-64 flex-shrink-0">
                                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-4 sticky top-24">
                                        <h2 className="font-semibold text-sm text-text dark:text-dark-text mb-3">
                                            {t('tableOfContents')}
                                        </h2>
                                        <nav className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
                                            {categoryOrder.map((cat) => {
                                                const catSections = filteredSections.filter(s => s.category === cat)
                                                if (catSections.length === 0) return null
                                                return (
                                                    <div key={cat}>
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary dark:text-secondary px-2.5 mb-1.5">
                                                            {t(`categories.${cat}`)}
                                                        </p>
                                                        <div className="space-y-0.5 ps-2.5">
                                                            {catSections.map((section) => {
                                                                const Icon = section.icon
                                                                return (
                                                                    <button
                                                                        key={section.id}
                                                                        onClick={() => scrollToSection(section.id)}
                                                                        className={cn(
                                                                            'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-start',
                                                                            expandedSections.has(section.id)
                                                                                ? 'bg-primary/10 text-primary dark:text-secondary'
                                                                                : 'text-text-muted dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                                                                        )}
                                                                    >
                                                                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                                                        <span className="truncate">{t(section.titleKey)}</span>
                                                                        {section.adminOnly && (
                                                                            <span className="ms-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:text-secondary whitespace-nowrap">
                                                                                {tAdmin('roles.admin')}
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </nav>
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-border dark:border-dark-border">
                                            <button
                                                onClick={expandAll}
                                                className="flex-1 text-xs text-primary dark:text-secondary hover:underline"
                                            >
                                                {t('expandAll')}
                                            </button>
                                            <button
                                                onClick={collapseAll}
                                                className="flex-1 text-xs text-text-muted dark:text-dark-text-muted hover:underline"
                                            >
                                                {t('collapseAll')}
                                            </button>
                                        </div>
                                    </div>
                                </aside>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0 space-y-4">
                                    {/* Introduction Card */}
                                    <div className="p-6 rounded-xl bg-primary/5 dark:bg-secondary/5 border border-primary/10 dark:border-secondary/10">
                                        <h2 className="text-lg font-semibold text-primary dark:text-secondary mb-2">
                                            {t('introTitle')}
                                        </h2>
                                        <p className="text-sm text-text dark:text-dark-text">
                                            {t('introContent')}
                                        </p>
                                    </div>

                                    {/* Admin-only notice for admins */}
                                    {userRole === 'admin' && (
                                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                                <Shield className="w-4 h-4 inline-block me-1.5 -mt-0.5" />
                                                {t('adminNotice')}
                                            </p>
                                        </div>
                                    )}

                                    {/* Guide Sections */}
                                    {filteredSections.map((section) => {
                                        const Icon = section.icon
                                        const isExpanded = expandedSections.has(section.id)

                                        return (
                                            <div
                                                key={section.id}
                                                id={`guide-section-${section.id}`}
                                                className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden scroll-mt-24"
                                            >
                                                <button
                                                    onClick={() => toggleSection(section.id)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-3 sm:px-4 sm:py-3.5 text-start hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
                                                >
                                                    <div className="flex-shrink-0 p-1.5 rounded-lg bg-primary/10 dark:bg-secondary/10">
                                                        <Icon className="w-4 h-4 text-primary dark:text-secondary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-text dark:text-dark-text">
                                                                {t(section.titleKey)}
                                                            </span>
                                                            {section.adminOnly && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:text-secondary font-medium">
                                                                    {tAdmin('roles.admin')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5 line-clamp-1">
                                                            {t(section.descKey)}
                                                        </p>
                                                    </div>
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-5 h-5 text-text-muted dark:text-dark-text-muted flex-shrink-0" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5 text-text-muted dark:text-dark-text-muted flex-shrink-0 rtl:rotate-180" />
                                                    )}
                                                </button>

                                                {isExpanded && (
                                                    <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-gray-100 dark:border-dark-border">
                                                        <div className="prose prose-sm dark:prose-invert max-w-none mt-4 space-y-3">
                                                            {section.contentKeys.map((key, i) => (
                                                                <p key={i} className="text-sm text-text dark:text-dark-text leading-relaxed">
                                                                    {t(key)}
                                                                </p>
                                                            ))}
                                                        </div>

                                                        {section.stepsKeys && section.stepsKeys.length > 0 && (
                                                            <div className="mt-4">
                                                                <button
                                                                    onClick={() => toggleSteps(section.id)}
                                                                    className={cn(
                                                                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                                                        visibleSteps.has(section.id)
                                                                            ? 'bg-primary/10 text-primary dark:text-secondary'
                                                                            : 'border border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted hover:bg-gray-50 dark:hover:bg-dark-bg'
                                                                    )}
                                                                >
                                                                    <ListChecks className="w-3.5 h-3.5" />
                                                                    {t(section.stepsLabel!)}
                                                                    <ChevronDown className={cn(
                                                                        'w-3 h-3 transition-transform',
                                                                        visibleSteps.has(section.id) && 'rotate-180'
                                                                    )} />
                                                                </button>

                                                                {visibleSteps.has(section.id) && (
                                                                    <div className="mt-3 p-4 rounded-lg bg-primary/5 dark:bg-secondary/5 border border-primary/10 dark:border-secondary/10">
                                                                        <ol className="space-y-2.5 m-0 p-0 list-none">
                                                                            {section.stepsKeys.map((key, i) => (
                                                                                <li key={i} className="flex gap-3 items-start">
                                                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary dark:bg-secondary text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                                                                                        {i + 1}
                                                                                    </span>
                                                                                    <span className="text-xs text-text dark:text-dark-text leading-relaxed">
                                                                                        {t(key)}
                                                                                    </span>
                                                                                </li>
                                                                            ))}
                                                                        </ol>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}

                                    {/* Footer Note */}
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-dark-surface border border-border dark:border-dark-border">
                                        <p className="text-xs text-text-muted dark:text-dark-text-muted">
                                            {t('footerNote')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    )
}
