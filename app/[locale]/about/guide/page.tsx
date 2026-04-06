'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AboutLayout } from '@/components/AboutLayout'
import { useTranslations } from 'next-intl'
import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    PenSquare,
    HelpCircle,
    Archive,
    Lightbulb,
    SearchCode,
    BrainCircuit,
    BarChart3,
    Vote,
    Link2,
    GitFork,
    ShieldCheck,
    Flag,
    Scale,
    Trophy,
    Palette,
    Lock,
    ScrollText,
    ListChecks,
    Loader2,
    Telescope
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GuideSection {
    id: string
    titleKey: string
    icon: typeof BookOpen
    descKey: string
    contentKeys: string[]
    stepsKeys?: string[]
    stepsLabel?: string
    category: string
    researcherOnly?: boolean
}

const guideSections: GuideSection[] = [
    // --- Getting Started ---
    {
        id: 'platform-overview',
        titleKey: 'platformOverview.title',
        icon: BookOpen,
        descKey: 'platformOverview.desc',
        contentKeys: ['platformOverview.content1', 'platformOverview.content2'],
        stepsLabel: 'platformOverview.stepsLabel',
        stepsKeys: ['platformOverview.step1', 'platformOverview.step2', 'platformOverview.step3', 'platformOverview.step4'],
        category: 'gettingStarted',
    },
    {
        id: 'roles',
        titleKey: 'roles.title',
        icon: ShieldCheck,
        descKey: 'roles.desc',
        contentKeys: ['roles.content1', 'roles.content2', 'roles.content3'],
        category: 'gettingStarted',
    },
    // --- Creating Content ---
    {
        id: 'writing-articles',
        titleKey: 'writingArticles.title',
        icon: PenSquare,
        descKey: 'writingArticles.desc',
        contentKeys: ['writingArticles.content1', 'writingArticles.content2'],
        stepsLabel: 'writingArticles.stepsLabel',
        stepsKeys: ['writingArticles.step1', 'writingArticles.step2', 'writingArticles.step3', 'writingArticles.step4', 'writingArticles.step5', 'writingArticles.step6'],
        category: 'creatingContent',
    },
    {
        id: 'asking-questions',
        titleKey: 'askingQuestions.title',
        icon: HelpCircle,
        descKey: 'askingQuestions.desc',
        contentKeys: ['askingQuestions.content1', 'askingQuestions.content2'],
        stepsLabel: 'askingQuestions.stepsLabel',
        stepsKeys: ['askingQuestions.step1', 'askingQuestions.step2', 'askingQuestions.step3'],
        category: 'creatingContent',
    },
    {
        id: 'preserving-traces',
        titleKey: 'preservingTraces.title',
        icon: Archive,
        descKey: 'preservingTraces.desc',
        contentKeys: ['preservingTraces.content1', 'preservingTraces.content2', 'preservingTraces.content3'],
        stepsLabel: 'preservingTraces.stepsLabel',
        stepsKeys: ['preservingTraces.step1', 'preservingTraces.step2', 'preservingTraces.step3', 'preservingTraces.step4'],
        category: 'creatingContent',
        researcherOnly: true,
    },
    {
        id: 'research-gaps',
        titleKey: 'researchGaps.title',
        icon: Lightbulb,
        descKey: 'researchGaps.desc',
        contentKeys: ['researchGaps.content1', 'researchGaps.content2', 'researchGaps.content3'],
        stepsLabel: 'researchGaps.stepsLabel',
        stepsKeys: ['researchGaps.step1', 'researchGaps.step2', 'researchGaps.step3', 'researchGaps.step4'],
        category: 'creatingContent',
        researcherOnly: true,
    },
    // --- Research Tools ---
    {
        id: 'multi-source-search',
        titleKey: 'multiSourceSearch.title',
        icon: SearchCode,
        descKey: 'multiSourceSearch.desc',
        contentKeys: ['multiSourceSearch.content1', 'multiSourceSearch.content2'],
        stepsLabel: 'multiSourceSearch.stepsLabel',
        stepsKeys: ['multiSourceSearch.step1', 'multiSourceSearch.step2', 'multiSourceSearch.step3'],
        category: 'researchTools',
    },
    {
        id: 'ai-advisor',
        titleKey: 'aiAdvisor.title',
        icon: BrainCircuit,
        descKey: 'aiAdvisor.desc',
        contentKeys: ['aiAdvisor.content1', 'aiAdvisor.content2'],
        stepsLabel: 'aiAdvisor.stepsLabel',
        stepsKeys: ['aiAdvisor.step1', 'aiAdvisor.step2', 'aiAdvisor.step3'],
        category: 'researchTools',
    },
    {
        id: 'polls-surveys',
        titleKey: 'pollsSurveys.title',
        icon: Vote,
        descKey: 'pollsSurveys.desc',
        contentKeys: ['pollsSurveys.content1', 'pollsSurveys.content2'],
        stepsLabel: 'pollsSurveys.stepsLabel',
        stepsKeys: ['pollsSurveys.step1', 'pollsSurveys.step2', 'pollsSurveys.step3'],
        category: 'researchTools',
    },
    {
        id: 'statistics',
        titleKey: 'statistics.title',
        icon: BarChart3,
        descKey: 'statistics.desc',
        contentKeys: ['statistics.content1', 'statistics.content2'],
        category: 'researchTools',
    },
    // --- Trust & Quality ---
    {
        id: 'trust-dimensions',
        titleKey: 'trustDimensions.title',
        icon: Telescope,
        descKey: 'trustDimensions.desc',
        contentKeys: ['trustDimensions.content1', 'trustDimensions.content2', 'trustDimensions.content3'],
        category: 'trustQuality',
        researcherOnly: true,
    },
    {
        id: 'citations-forks',
        titleKey: 'citationsForks.title',
        icon: GitFork,
        descKey: 'citationsForks.desc',
        contentKeys: ['citationsForks.content1', 'citationsForks.content2', 'citationsForks.content3'],
        stepsLabel: 'citationsForks.stepsLabel',
        stepsKeys: ['citationsForks.step1', 'citationsForks.step2', 'citationsForks.step3'],
        category: 'trustQuality',
        researcherOnly: true,
    },
    {
        id: 'epistemic-standards',
        titleKey: 'epistemicStandards.title',
        icon: Scale,
        descKey: 'epistemicStandards.desc',
        contentKeys: ['epistemicStandards.content1', 'epistemicStandards.content2', 'epistemicStandards.content3'],
        category: 'trustQuality',
        researcherOnly: true,
    },
    // --- Community ---
    {
        id: 'content-review',
        titleKey: 'contentReview.title',
        icon: ShieldCheck,
        descKey: 'contentReview.desc',
        contentKeys: ['contentReview.content1', 'contentReview.content2'],
        category: 'community',
    },
    {
        id: 'reporting',
        titleKey: 'reporting.title',
        icon: Flag,
        descKey: 'reporting.desc',
        contentKeys: ['reporting.content1'],
        stepsLabel: 'reporting.stepsLabel',
        stepsKeys: ['reporting.step1', 'reporting.step2', 'reporting.step3', 'reporting.step4'],
        category: 'community',
    },
    {
        id: 'appeals',
        titleKey: 'appeals.title',
        icon: Scale,
        descKey: 'appeals.desc',
        contentKeys: ['appeals.content1'],
        stepsLabel: 'appeals.stepsLabel',
        stepsKeys: ['appeals.step1', 'appeals.step2', 'appeals.step3'],
        category: 'community',
    },
    {
        id: 'gamification',
        titleKey: 'gamification.title',
        icon: Trophy,
        descKey: 'gamification.desc',
        contentKeys: ['gamification.content1', 'gamification.content2'],
        category: 'community',
    },
    // --- Settings ---
    {
        id: 'appearance',
        titleKey: 'appearance.title',
        icon: Palette,
        descKey: 'appearance.desc',
        contentKeys: ['appearance.content1', 'appearance.content2'],
        category: 'settings',
    },
    {
        id: 'privacy-notifications',
        titleKey: 'privacyNotifications.title',
        icon: Lock,
        descKey: 'privacyNotifications.desc',
        contentKeys: ['privacyNotifications.content1', 'privacyNotifications.content2'],
        category: 'settings',
    },
    {
        id: 'licenses',
        titleKey: 'licenses.title',
        icon: ScrollText,
        descKey: 'licenses.desc',
        contentKeys: ['licenses.content1', 'licenses.content2', 'licenses.content3'],
        category: 'settings',
    },
]

const categoryOrder = ['gettingStarted', 'creatingContent', 'researchTools', 'trustQuality', 'community', 'settings']

export default function UserGuidePage() {
    const t = useTranslations('UserGuide')
    const [userRole, setUserRole] = useState<string | null>(null)
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
                if (data) {
                    setUserRole(data.role)
                }
            }
            setLoading(false)
        }
        fetchRole()
    }, [supabase])

    const isResearcher = userRole === 'researcher' || userRole === 'admin' || userRole === 'moderator'

    const filteredSections = guideSections.filter(section => {
        if (section.researcherOnly && !isResearcher) return false
        return true
    })

    const toggleSection = (id: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleSteps = (id: string) => {
        setVisibleSteps(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const expandAll = () => setExpandedSections(new Set(filteredSections.map(s => s.id)))
    const collapseAll = () => setExpandedSections(new Set())

    const scrollToSection = (id: string) => {
        setExpandedSections(prev => new Set(prev).add(id))
        setTimeout(() => {
            document.getElementById(`guide-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    }

    // TOC rendered below the About sidebar
    const guideToc = !loading ? (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-4 mt-4">
            <h2 className="font-semibold text-sm text-text dark:text-dark-text mb-3">
                {t('tableOfContents')}
            </h2>
            <nav className="space-y-3 max-h-[45vh] overflow-y-auto scrollbar-thin">
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
                                            {section.researcherOnly && (
                                                <span className="ms-auto text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap">
                                                    {t('researcherBadge')}
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
                <button onClick={expandAll} className="flex-1 text-xs text-primary dark:text-secondary hover:underline">
                    {t('expandAll')}
                </button>
                <button onClick={collapseAll} className="flex-1 text-xs text-text-muted dark:text-dark-text-muted hover:underline">
                    {t('collapseAll')}
                </button>
            </div>
        </div>
    ) : null

    if (loading) {
        return (
            <AboutLayout>
                <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </AboutLayout>
        )
    }

    return (
        <AboutLayout sidebarExtra={guideToc}>
            <div className="max-w-none">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-secondary/10">
                        <BookOpen className="w-6 h-6 text-primary dark:text-secondary" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-secondary">
                        {t('title')}
                    </h1>
                </div>
                <p className="text-sm text-text-light dark:text-dark-text-muted mb-6">
                    {t('subtitle')}
                </p>

                {/* Introduction */}
                <div className="p-5 rounded-xl bg-primary/5 dark:bg-secondary/5 border border-primary/10 dark:border-secondary/10 mb-4">
                    <h2 className="text-lg font-semibold text-primary dark:text-secondary mb-2">
                        {t('introTitle')}
                    </h2>
                    <p className="text-sm text-text dark:text-dark-text">
                        {t('introContent')}
                    </p>
                </div>

                {/* Researcher notice */}
                {isResearcher && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            <Link2 className="w-4 h-4 inline-block me-1.5 -mt-0.5" />
                            {t('researcherNotice')}
                        </p>
                    </div>
                )}

                {/* Sections */}
                <div className="space-y-4">
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
                                            {section.researcherOnly && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                                                    {t('researcherBadge')}
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
                                        <div className="mt-4 space-y-3">
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

                    {/* Footer */}
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-dark-surface border border-border dark:border-dark-border">
                        <p className="text-xs text-text-muted dark:text-dark-text-muted">
                            {t('footerNote')}
                        </p>
                    </div>
                </div>
            </div>
        </AboutLayout>
    )
}
