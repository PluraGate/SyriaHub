'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EditProfileDialog } from './EditProfileDialog'
import BadgeDisplay from './BadgeDisplay'
import ReputationScore from './ReputationScore'
import { UserLevelBadge } from './UserLevelBadge'
import { getTierFromLevel } from '@/lib/gamification'
import { MapPin, Link as LinkIcon, Building2, Calendar, CalendarDays, Users, FileText, Quote, Zap, GraduationCap, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { FollowButton } from './FollowButton'
import { cn } from '@/lib/utils'
import { useCoverWithFallback, getCoverWithFallback } from '@/lib/coverImages'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { arSA, enUS } from 'date-fns/locale'
import { useLocale } from 'next-intl'

interface ProfileHeaderProps {
    profile: any
    stats: any
    badges: any[]
    isOwnProfile: boolean
    privacySettings?: {
        show_email: boolean
        allow_messages: boolean
    }
}

// Simple animated stat with mini progress bar
function StatItem({
    icon: Icon,
    value,
    label,
    maxValue = 100,
    color = 'primary',
    tooltip,
    mounted
}: {
    icon: React.ElementType
    value: number | string
    label: string
    maxValue?: number
    color?: 'primary' | 'secondary' | 'accent' | 'emerald'
    tooltip?: string
    mounted: boolean
}) {
    // Ensure value is treated as a number for calculation
    // Using Number() on everything to ensure "0.0" -> 0
    const numValue = typeof value === 'number' ? value : Number(value) || 0
    const percentage = Math.min((numValue / maxValue) * 100, 100)
    const colorClasses = {
        primary: 'bg-primary dark:bg-primary-light',
        secondary: 'bg-secondary dark:bg-secondary-light',
        accent: 'bg-accent dark:bg-accent-light',
        emerald: 'bg-emerald-500 dark:bg-emerald-400'
    }

    // Determine what to display - using String(number) is very stable
    // During hydration (mounted=false), we want EXACT match with server
    const displayValue = mounted ? numValue.toLocaleString() : String(numValue)

    return (
        <div className="flex-1 min-w-[100px]" title={tooltip}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                <span className="text-2xl font-bold text-text dark:text-dark-text" suppressHydrationWarning>
                    {displayValue}
                </span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden mb-1">
                <div
                    className={cn("h-full rounded-full transition-all duration-700", colorClasses[color])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-xs uppercase tracking-wider text-text-light dark:text-dark-text-muted">
                {label}
            </span>
        </div>
    )
}

export function ProfileHeader({ profile, stats, badges, isOwnProfile, privacySettings }: ProfileHeaderProps) {
    const [mounted, setMounted] = useState(false)
    const [statsOpen, setStatsOpen] = useState(false)
    const t = useTranslations('ProfileLabels')
    const locale = useLocale()
    const dateLocale = locale === 'ar' ? arSA : enUS
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional SSR hydration pattern
        setMounted(true)
    }, [])

    // Get cover image with theme-aware fallback
    const coverImage = useCoverWithFallback(profile.cover_image_url, 'large')

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden mb-8">
            {/* Cover Image / Fallback Banner */}
            <div className="relative h-48 md:h-56 w-full">
                <Image
                    src={mounted ? coverImage : getCoverWithFallback(profile.cover_image_url, 'dark', 'large')}
                    alt="Profile cover"
                    fill
                    className="object-cover"
                    unoptimized
                    suppressHydrationWarning
                />
                {/* Subtle overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Profile Content - Clean integrated design */}
            <div className="relative z-10 px-6 md:px-8 pb-6 md:pb-8">
                {/* Avatar and info row */}
                <div className="flex flex-col sm:flex-row gap-5 -mt-12 sm:-mt-16">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="relative inline-block">
                            <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-white dark:border-dark-surface shadow-xl bg-white dark:bg-dark-surface">
                                <AvatarImage src={profile.avatar_url} alt={profile.name} className="object-cover" />
                                <AvatarFallback className="text-3xl bg-primary text-white">
                                    {profile.name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {/* Online indicator */}
                            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-dark-surface rounded-full" />
                        </div>
                    </div>

                    {/* Name, role, badges - positioned below avatar on mobile, beside on desktop */}
                    <div className="flex-1 pt-2 sm:pt-20">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            {/* Name and badges */}
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white" suppressHydrationWarning>
                                        {profile.name}
                                    </h1>
                                    {profile.level && profile.level > 0 && (
                                        <UserLevelBadge
                                            level={profile.level}
                                            tier={getTierFromLevel(profile.level)}
                                            name={profile.level_name}
                                            size="sm"
                                        />
                                    )}
                                    {profile.reputation > 0 && (
                                        <ReputationScore score={profile.reputation} size="md" />
                                    )}
                                </div>
                                {/* Email display - premium pill design with icon */}
                                {mounted && profile.email && (
                                    <a
                                        href={`mailto:${profile.email}`}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 mb-1 rounded-full text-xs font-medium 
                                            bg-gray-100/80 dark:bg-white/10 
                                            text-gray-600 dark:text-gray-300 
                                            hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary-light
                                            border border-gray-200/50 dark:border-white/10
                                            backdrop-blur-sm
                                            transition-all duration-200 
                                            hover:scale-[1.02] hover:shadow-sm
                                            animate-in fade-in slide-in-from-left-2 duration-300
                                            group"
                                    >
                                        <Mail className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <span className="truncate max-w-[200px]">{profile.email}</span>
                                    </a>
                                )}
                                {/* Role and XP inline - XP always rendered but hidden until mounted */}
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary dark:text-white/50 dark:bg-primary/30 rounded-full text-xs font-semibold capitalize border border-primary/10 dark:border-primary/20">
                                        {t(profile.role as 'moderator' | 'admin' | 'researcher' | 'member')}
                                    </span>
                                    {profile.xp_points > 0 && (
                                        <span
                                            className={`flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium px-2 py-0.5 bg-yellow-400/10 rounded-full border border-yellow-400/10 transition-opacity duration-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}
                                            suppressHydrationWarning
                                        >
                                            <Zap className="w-3 h-3" />
                                            {mounted ? profile.xp_points.toLocaleString() : String(profile.xp_points)} XP
                                        </span>
                                    )}
                                    <BadgeDisplay badges={badges} size="sm" />
                                </div>
                            </div>

                            {/* Action button - Guarded to prevent auth logic mismatch during hydration */}
                            <div className="flex-shrink-0 mt-2 sm:mt-0 min-w-[100px] flex justify-end" suppressHydrationWarning>
                                {mounted && (
                                    <div className="animate-in fade-in duration-300">
                                        {isOwnProfile ? (
                                            <EditProfileDialog profile={profile} />
                                        ) : (
                                            <FollowButton userId={profile.id} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                    <p className="text-gray-700 dark:text-gray-300 mt-5 max-w-2xl leading-relaxed text-sm sm:text-base">
                        {profile.bio}
                    </p>
                )}

                {/* Meta info row */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mt-4" suppressHydrationWarning>
                    {profile.affiliation && (
                        <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{profile.affiliation}</span>
                        </div>
                    )}

                    {profile.location && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{profile.location}</span>
                        </div>
                    )}
                    {profile.website && (
                        <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-primary transition-colors"
                        >
                            <LinkIcon className="w-4 h-4 flex-shrink-0" />
                            <span>{t('website')}</span>
                        </a>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap" suppressHydrationWarning>
                            {t('joined', { date: mounted ? format(new Date(profile.created_at), 'MMMM yyyy', { locale: dateLocale }) : '...' })}
                        </span>
                    </div>
                </div>

                {/* Research Interests */}
                {profile.research_interests && profile.research_interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {profile.research_interests.map((interest: string) => (
                            <span
                                key={interest}
                                className="px-3 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-sm text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats Toggle Header */}
                <button
                    onClick={() => setStatsOpen(!statsOpen)}
                    className="w-full flex items-center justify-between mt-6 py-3 px-3 border-t border-gray-100 dark:border-white/10 group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors rounded-lg"
                >
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-white transition-colors">
                            {t('knowledgeImpactStats')}
                        </span>
                        {!statsOpen && (
                            <div className="flex items-center gap-3 text-sm animate-in fade-in duration-300">
                                <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
                                <div className="flex items-center gap-1.5 text-text-light dark:text-dark-text-muted">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span>
                                        {t('impact')}: <span className="font-semibold text-text dark:text-dark-text">{stats?.academic_impact || 0}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-text-light dark:text-dark-text-muted">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>
                                        {t('posts')}: <span className="font-semibold text-text dark:text-dark-text">{stats?.post_count || 0}</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-white">
                        {statsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </button>

                {/* Stats with visual bars - Collapsible */}
                <div className={cn(
                    "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 overflow-hidden transition-all duration-300 ease-in-out",
                    statsOpen ? "max-h-[500px] opacity-100 mt-5 pb-2" : "max-h-0 opacity-0 mt-0"
                )} suppressHydrationWarning>
                    <StatItem
                        icon={FileText}
                        value={stats?.post_count || 0}
                        label={t('posts')}
                        maxValue={50}
                        color="primary"
                        mounted={mounted}
                    />
                    <StatItem
                        icon={CalendarDays}
                        value={stats?.event_count || 0}
                        label={t('events')}
                        maxValue={20}
                        color="secondary"
                        mounted={mounted}
                    />
                    <StatItem
                        icon={Quote}
                        value={stats?.citation_count || 0}
                        label={t('citations')}
                        maxValue={100}
                        color="accent"
                        mounted={mounted}
                    />
                    <StatItem
                        icon={Users}
                        value={stats?.follower_count || 0}
                        label={t('followers')}
                        maxValue={200}
                        color="accent"
                        mounted={mounted}
                    />
                    <StatItem
                        icon={GraduationCap}
                        value={stats?.academic_impact || 0}
                        label={t('knowledgeImpact')}
                        maxValue={100}
                        color="emerald"
                        tooltip="Knowledge Impact: How this work contributes to the collective understanding through citations and reuse"
                        mounted={mounted}
                    />
                </div>
            </div>
        </div>
    )
}
