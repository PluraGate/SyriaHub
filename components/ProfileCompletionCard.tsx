'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Circle, User, FileText, Camera, Award, Shield, MapPin, Building, Globe, Image, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface ProfileCompletion {
    success: boolean
    percentage: number
    core_score: number
    core_max: number
    bonus_xp: number
    missing_core: string[]
    optional_completed: string[]
    is_complete: boolean
    skill_count: number
    endorsement_count: number
}

interface ProfileCompletionCardProps {
    userId: string
    compact?: boolean
}

const CORE_FIELDS = [
    { id: 'name', label: 'Display Name', icon: User, tip: 'Add your name for attribution' },
    { id: 'bio', label: 'Bio (30+ chars)', icon: FileText, tip: 'Describe your expertise' },
    { id: 'avatar', label: 'Profile Photo', icon: Camera, tip: 'Add a photo or avatar' },
    { id: 'skills', label: 'Add a Skill', icon: Award, tip: 'Show your areas of expertise' },
]

const OPTIONAL_FIELDS = [
    { id: 'cover_image', label: 'Cover Image', icon: Image, xp: 10 },
    { id: 'affiliation', label: 'Affiliation', icon: Building, xp: 15 },
    { id: 'location', label: 'Location', icon: MapPin, xp: 10, privacy: true },
    { id: 'website', label: 'Website', icon: Globe, xp: 10 },
    { id: 'endorsements_3', label: '3+ Endorsements', icon: Award, xp: 20 },
    { id: 'skills_5', label: '5+ Skills', icon: Award, xp: 15 },
]

export function ProfileCompletionCard({ userId, compact = false }: ProfileCompletionCardProps) {
    const t = useTranslations('ProfileCompletion')
    const [completion, setCompletion] = useState<ProfileCompletion | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const [isCollapsed, setIsCollapsed] = useState(true)
    const supabase = createClient()

    // Load completion data
    useEffect(() => {
        async function loadCompletion() {
            setLoading(true)
            const { data, error } = await supabase.rpc('get_profile_completion', {
                p_user_id: userId
            })

            if (!error && data?.success) {
                setCompletion(data)
                // Auto-expand if incomplete (less than 100%)
                if (!data.is_complete && !data.success) {
                    setIsCollapsed(false)
                } else if (!data.is_complete) {
                    setIsCollapsed(false)
                }
            }
            setLoading(false)
        }

        loadCompletion()
    }, [userId, supabase, refreshKey])

    // Listen for profile update events
    useEffect(() => {
        const handleProfileUpdate = () => {
            setRefreshKey(prev => prev + 1)
        }

        // Listen for custom 'profile-updated' event
        window.addEventListener('profile-updated', handleProfileUpdate)

        return () => {
            window.removeEventListener('profile-updated', handleProfileUpdate)
        }
    }, [])

    if (loading) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
                <div className="animate-pulse flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-dark-border rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
                        <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-3/4" />
                    </div>
                </div>
            </div>
        )
    }

    if (!completion) return null

    const { percentage, missing_core, optional_completed, bonus_xp, is_complete } = completion

    // Calculate progress ring
    const circumference = 2 * Math.PI * 28
    const strokeDashoffset = circumference - (percentage / 100) * circumference



    if (compact) {
        return (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                {/* Mini progress ring */}
                <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 -rotate-90">
                        <circle
                            cx="20" cy="20" r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-gray-200 dark:text-dark-border"
                        />
                        <circle
                            cx="20" cy="20" r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={2 * Math.PI * 16}
                            strokeDashoffset={2 * Math.PI * 16 - (percentage / 100) * 2 * Math.PI * 16}
                            strokeLinecap="round"
                            className={cn(
                                percentage === 100 ? "text-emerald-500" : "text-primary"
                            )}
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-text dark:text-dark-text">
                        {percentage}%
                    </span>
                </div>
                <div>
                    <p className="text-sm font-medium text-text dark:text-dark-text">
                        {is_complete ? t('complete') : t('completeProfile')}
                    </p>
                    {bonus_xp > 0 && (
                        <p className="text-xs text-primary">+{bonus_xp} bonus XP</p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 transition-all">
            {/* Header with progress ring and Toggle */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center gap-3 flex-1 group hover:opacity-80 transition-opacity"
                >
                    <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 -rotate-90">
                            <circle
                                cx="20" cy="20" r="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-gray-200 dark:text-dark-border"
                            />
                            <circle
                                cx="20" cy="20" r="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={2 * Math.PI * 16}
                                strokeDashoffset={2 * Math.PI * 16 - (percentage / 100) * 2 * Math.PI * 16}
                                strokeLinecap="round"
                                className={cn(
                                    "transition-all duration-500",
                                    percentage === 100 ? "text-emerald-500" : "text-primary"
                                )}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            {is_complete ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <span className="text-xs font-bold text-text dark:text-dark-text">{percentage}%</span>
                            )}
                        </div>
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-semibold text-text dark:text-dark-text">
                            {is_complete ? t('complete') : t('completeYourProfile')}
                        </h3>
                        <p className="text-sm text-text-light dark:text-dark-text-muted">
                            {is_complete
                                ? t('bonusXpEarned', { count: bonus_xp })
                                : t('itemsRemaining', { count: missing_core.length })
                            }
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-primary"
                >
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
            </div>

            {/* Collapsible Content */}
            <div className={cn(
                "overflow-hidden transition-all duration-300",
                isCollapsed ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
            )}>
                {/* Missing core fields */}
                {missing_core.length > 0 && (
                    <div className="space-y-2 mb-4">
                        <p className="text-xs font-medium text-text-light dark:text-dark-text-muted uppercase tracking-wide">
                            {t('suggested')}
                        </p>
                        {CORE_FIELDS.filter(f => missing_core.includes(f.id)).map(field => (
                            <div
                                key={field.id}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-bg"
                            >
                                <Circle className="w-4 h-4 text-gray-400" />
                                <field.icon className="w-4 h-4 text-primary" />
                                <span className="text-sm text-text dark:text-dark-text">{field.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Optional bonus fields */}
                {is_complete && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-text-light dark:text-dark-text-muted uppercase tracking-wide">
                            {t('optionalExtras')}
                        </p>
                        {OPTIONAL_FIELDS.filter(f => !optional_completed.includes(f.id)).slice(0, 3).map(field => (
                            <div
                                key={field.id}
                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-bg"
                            >
                                <div className="flex items-center gap-3">
                                    <field.icon className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-text-light dark:text-dark-text-muted">
                                        {field.label}
                                        {field.privacy && (
                                            <span className="text-xs ml-1 text-gray-400">(optional)</span>
                                        )}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-primary">+{field.xp} XP</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Privacy note */}
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {t('privacyNote')}
                </p>
            </div>
        </div>
    )
}
