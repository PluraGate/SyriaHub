import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EditProfileDialog } from './EditProfileDialog'
import BadgeDisplay from './BadgeDisplay'
import ReputationScore from './ReputationScore'
import { UserLevelBadge } from './UserLevelBadge'
import { getTierFromLevel } from '@/lib/gamification'
import { MapPin, Link as LinkIcon, Building2, Calendar, Users, FileText, Quote, Zap, GraduationCap } from 'lucide-react'
import { format } from 'date-fns'
import { FollowButton } from './FollowButton'
import { cn } from '@/lib/utils'

interface ProfileHeaderProps {
    profile: any
    stats: any
    badges: any[]
    isOwnProfile: boolean
}

// Simple animated stat with mini progress bar
function StatItem({
    icon: Icon,
    value,
    label,
    maxValue = 100,
    color = 'primary',
    tooltip
}: {
    icon: React.ElementType
    value: number | string
    label: string
    maxValue?: number
    color?: 'primary' | 'secondary' | 'accent' | 'emerald'
    tooltip?: string
}) {
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0
    const percentage = Math.min((numValue / maxValue) * 100, 100)
    const colorClasses = {
        primary: 'bg-primary dark:bg-primary-light',
        secondary: 'bg-secondary dark:bg-secondary-light',
        accent: 'bg-accent dark:bg-accent-light',
        emerald: 'bg-emerald-500 dark:bg-emerald-400'
    }

    return (
        <div className="flex-1 min-w-[100px]" title={tooltip}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                <span className="text-2xl font-bold text-text dark:text-dark-text">
                    {typeof value === 'number' ? value.toLocaleString() : value}
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

export function ProfileHeader({ profile, stats, badges, isOwnProfile }: ProfileHeaderProps) {
    // Default cover gradient if no cover_image_url
    const hasCoverImage = profile.cover_image_url

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden mb-8">
            {/* Cover Image / Gradient Banner */}
            <div
                className={cn(
                    "relative h-48 md:h-56 w-full",
                    !hasCoverImage && "bg-primary-dark"
                )}
            >
                {hasCoverImage && (
                    <img
                        src={profile.cover_image_url}
                        alt="Profile cover"
                        className="w-full h-full object-cover"
                    />
                )}
                {/* Subtle overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Profile Content - Clean integrated design */}
            <div className="relative z-10 px-6 md:px-8 pb-6 md:pb-8">
                {/* Avatar and info row */}
                <div className="flex flex-col sm:flex-row gap-5 -mt-12 sm:-mt-16">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-white dark:border-dark-surface shadow-xl bg-white dark:bg-dark-surface">
                            <AvatarImage src={profile.avatar_url} alt={profile.name} className="object-cover" />
                            <AvatarFallback className="text-3xl bg-primary text-white">
                                {profile.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {/* Online indicator */}
                        <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white dark:border-dark-surface rounded-full" />
                    </div>

                    {/* Name, role, badges - positioned below avatar on mobile, beside on desktop */}
                    <div className="flex-1 pt-2 sm:pt-20">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            {/* Name and badges */}
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">
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
                                {/* Role and XP inline */}
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary dark:text-white/50 dark:bg-primary/30 rounded-full text-xs font-semibold capitalize border border-primary/10 dark:border-primary/20">
                                        {profile.role === 'researcher' ? 'Researcher' : profile.role}
                                    </span>
                                    {profile.xp_points > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium px-2 py-0.5 bg-yellow-400/10 rounded-full border border-yellow-400/10">
                                            <Zap className="w-3 h-3" />
                                            {profile.xp_points.toLocaleString()} XP
                                        </span>
                                    )}
                                    <BadgeDisplay badges={badges} size="sm" />
                                </div>
                            </div>

                            {/* Action button */}
                            <div className="flex-shrink-0 mt-2 sm:mt-0">
                                {isOwnProfile ? (
                                    <EditProfileDialog profile={profile} />
                                ) : (
                                    <FollowButton userId={profile.id} />
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
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
                    {profile.affiliation && (
                        <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            <span>{profile.affiliation}</span>
                        </div>
                    )}
                    {profile.location && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
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
                            <LinkIcon className="w-4 h-4" />
                            <span>Website</span>
                        </a>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                    </div>
                </div>

                {/* Research Interests */}
                {profile.research_interests && profile.research_interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
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

                {/* Stats with visual bars - softened border */}
                <div className="flex flex-wrap gap-6 sm:gap-10 mt-6 pt-5 border-t border-gray-100 dark:border-white/10 px-1">
                    <StatItem
                        icon={FileText}
                        value={stats?.post_count || 0}
                        label="Posts"
                        maxValue={50}
                        color="primary"
                    />
                    <StatItem
                        icon={Quote}
                        value={stats?.citation_count || 0}
                        label="Citations"
                        maxValue={100}
                        color="secondary"
                    />
                    <StatItem
                        icon={Users}
                        value={stats?.follower_count || stats?.group_count || 0}
                        label="Followers"
                        maxValue={200}
                        color="accent"
                    />
                    <StatItem
                        icon={GraduationCap}
                        value={(stats?.academic_impact || 0).toFixed(1)}
                        label="Academic Impact"
                        maxValue={100}
                        color="emerald"
                        tooltip="Aggregate scholarly impact score based on quality citations across all posts"
                    />
                </div>
            </div>
        </div>
    )
}
