'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { UserProgressCard } from '@/components/UserProgressCard'
import {
    Trophy,
    Star,
    Medal,
    Crown,
    Award,
    Users,
    Flame,
    Zap,
    BookOpen,
    MessageCircle,
    ThumbsUp,
    UserPlus,
    ClipboardCheck,
    UserCheck,
    Rocket,
    Lock,
    CheckCircle2,
    Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    category: string
    xp_reward: number
    unlocked_at?: string
    criteria?: {
        type: string
        threshold?: number
    }
}

interface AchievementsData {
    unlocked: Achievement[]
    available: Achievement[]
    total_count: number
    unlocked_count: number
    completion_percentage: number
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'footprints': Star,
    'pen-tool': BookOpen,
    'book-open': BookOpen,
    'lightbulb': Star,
    'hand-helping': Users,
    'award': Award,
    'trophy': Trophy,
    'message-circle': MessageCircle,
    'users': Users,
    'star': Star,
    'medal': Medal,
    'crown': Crown,
    'thumbs-up': ThumbsUp,
    'trending-up': Zap,
    'flame': Flame,
    'zap': Zap,
    'clipboard-check': ClipboardCheck,
    'user-check': UserCheck,
    'rocket': Rocket,
    'user-plus': UserPlus,
}

const categoryColors: Record<string, { bg: string, text: string, border: string }> = {
    contribution: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
    },
    community: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800'
    },
    expertise: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800'
    },
    special: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800'
    },
}

export default function AchievementsPage() {
    const [user, setUser] = useState<any>(null)
    const [achievements, setAchievements] = useState<AchievementsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [checking, setChecking] = useState(false)
    const [activeTab, setActiveTab] = useState<'unlocked' | 'available'>('unlocked')
    const supabase = createClient()
    const t = useTranslations('Gamification')

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                // Fetch achievements
                const { data, error } = await supabase.rpc('get_user_achievements', {
                    p_user_id: user.id
                })

                if (!error && data?.success) {
                    setAchievements(data)
                }
            }
            setLoading(false)
        }
        fetchData()
    }, [supabase])

    const checkForNewAchievements = async () => {
        if (!user) return
        setChecking(true)

        const { data, error } = await supabase.rpc('check_and_unlock_achievements', {
            p_user_id: user.id
        })

        if (!error && data?.success) {
            // Refresh achievements list
            const { data: refreshed } = await supabase.rpc('get_user_achievements', {
                p_user_id: user.id
            })
            if (refreshed?.success) {
                setAchievements(refreshed)
            }
        }
        setChecking(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
                <Navbar user={user} />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </main>
                <Footer />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
                <Navbar user={user} />
                <main className="flex-1 container-custom py-12">
                    <div className="text-center py-16">
                        <Lock className="w-16 h-16 mx-auto text-text-light dark:text-dark-text-muted mb-4" />
                        <h1 className="text-2xl font-bold text-text dark:text-dark-text mb-2">
                            {t('signInToView')}
                        </h1>
                        <p className="text-text-light dark:text-dark-text-muted">
                            {t('signInDescription')}
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 container-custom py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text dark:text-dark-text flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-primary" />
                            {t('pageTitle')}
                        </h1>
                        <p className="text-text-light dark:text-dark-text-muted mt-1">
                            {t('pageSubtitle')}
                        </p>
                    </div>
                    <button
                        onClick={checkForNewAchievements}
                        disabled={checking}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {checking ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Zap className="w-4 h-4" />
                        )}
                        {t('checkForNew')}
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Progress Card */}
                    <div className="lg:col-span-1">
                        <UserProgressCard userId={user.id} />

                        {/* Stats Summary */}
                        {achievements && (
                            <div className="mt-6 p-6 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                                <h3 className="font-semibold text-text dark:text-dark-text mb-4">
                                    {t('achievementProgress')}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-text-light dark:text-dark-text-muted">{t('completion')}</span>
                                            <span className="font-medium text-text dark:text-dark-text">
                                                {achievements.unlocked_count}/{achievements.total_count}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                                                style={{ width: `${achievements.completion_percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="text-center p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                                            <p className="text-2xl font-bold text-primary">{achievements.unlocked_count}</p>
                                            <p className="text-xs text-text-light dark:text-dark-text-muted">{t('unlocked')}</p>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                                            <p className="text-2xl font-bold text-text dark:text-dark-text">
                                                {achievements.total_count - achievements.unlocked_count}
                                            </p>
                                            <p className="text-xs text-text-light dark:text-dark-text-muted">{t('remaining')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Achievements Grid */}
                    <div className="lg:col-span-2">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setActiveTab('unlocked')}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium transition-colors",
                                    activeTab === 'unlocked'
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 dark:bg-dark-surface text-text dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border"
                                )}
                            >
                                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                                {t('unlocked')} ({achievements?.unlocked?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('available')}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium transition-colors",
                                    activeTab === 'available'
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 dark:bg-dark-surface text-text dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border"
                                )}
                            >
                                <Lock className="w-4 h-4 inline mr-2" />
                                {t('available')} ({achievements?.available?.length || 0})
                            </button>
                        </div>

                        {/* Achievement Cards */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {activeTab === 'unlocked' && achievements?.unlocked?.map((achievement) => {
                                const Icon = iconMap[achievement.icon] || Award
                                const colors = categoryColors[achievement.category] || categoryColors.special

                                return (
                                    <div
                                        key={achievement.id}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all",
                                            colors.bg,
                                            colors.border
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "p-3 rounded-xl",
                                                colors.bg
                                            )}>
                                                <Icon className={cn("w-6 h-6", colors.text)} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-text dark:text-dark-text">
                                                        {achievement.name}
                                                    </h3>
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                </div>
                                                <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                                                    {achievement.description}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                        +{achievement.xp_reward} XP
                                                    </span>
                                                    {achievement.unlocked_at && (
                                                        <span className="text-xs text-text-light dark:text-dark-text-muted">
                                                            {new Date(achievement.unlocked_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {activeTab === 'available' && achievements?.available?.map((achievement) => {
                                const Icon = iconMap[achievement.icon] || Award
                                const colors = categoryColors[achievement.category] || categoryColors.special

                                return (
                                    <div
                                        key={achievement.id}
                                        className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface opacity-75 hover:opacity-100 transition-opacity"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-3 rounded-xl bg-gray-100 dark:bg-dark-border">
                                                <Icon className="w-6 h-6 text-text-light dark:text-dark-text-muted" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-text dark:text-dark-text">
                                                        {achievement.name}
                                                    </h3>
                                                    <Lock className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                                                </div>
                                                <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                                                    {achievement.description}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className={cn(
                                                        "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                                                        colors.bg,
                                                        colors.text
                                                    )}>
                                                        {achievement.category}
                                                    </span>
                                                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                                        +{achievement.xp_reward} XP
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {activeTab === 'unlocked' && (!achievements?.unlocked || achievements.unlocked.length === 0) && (
                                <div className="col-span-2 text-center py-12">
                                    <Trophy className="w-16 h-16 mx-auto text-text-light dark:text-dark-text-muted mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium text-text dark:text-dark-text mb-2">
                                        {t('noAchievements')}
                                    </h3>
                                    <p className="text-text-light dark:text-dark-text-muted">
                                        {t('noAchievementsDesc')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
