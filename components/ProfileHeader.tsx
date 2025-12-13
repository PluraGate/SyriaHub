import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EditProfileDialog } from './EditProfileDialog'
import BadgeDisplay from './BadgeDisplay'
import ReputationScore from './ReputationScore'
import { MapPin, Link as LinkIcon, Building2, Calendar, Users, FileText, Quote } from 'lucide-react'
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
    color = 'primary'
}: {
    icon: React.ElementType
    value: number
    label: string
    maxValue?: number
    color?: 'primary' | 'secondary' | 'accent'
}) {
    const percentage = Math.min((value / maxValue) * 100, 100)
    const colorClasses = {
        primary: 'bg-primary dark:bg-primary-light',
        secondary: 'bg-secondary dark:bg-secondary-light',
        accent: 'bg-accent dark:bg-accent-light'
    }

    return (
        <div className="flex-1 min-w-[100px]">
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                <span className="text-2xl font-bold text-text dark:text-dark-text">
                    {value}
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
                    !hasCoverImage && "bg-gradient-to-br from-primary via-primary-dark to-secondary"
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

                {/* Decorative pattern overlay */}
                {!hasCoverImage && (
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Profile Content */}
            <div className="px-6 md:px-8 pb-6 md:pb-8">
                {/* Avatar - overlapping the cover */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20">
                    <div className="relative">
                        <Avatar className="w-32 h-32 md:w-36 md:h-36 border-4 border-white dark:border-dark-surface shadow-xl ring-2 ring-white/20">
                            <AvatarImage src={profile.avatar_url} alt={profile.name} />
                            <AvatarFallback className="text-4xl bg-primary text-white">
                                {profile.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {/* Online indicator (optional) */}
                        <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white dark:border-dark-surface rounded-full" />
                    </div>

                    {/* Name, role, and actions */}
                    <div className="flex-1 w-full pt-2 md:pt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl md:text-3xl font-display font-bold text-text dark:text-dark-text">
                                        {profile.name}
                                    </h1>
                                    {profile.reputation > 0 && (
                                        <ReputationScore score={profile.reputation} size="lg" />
                                    )}
                                    <BadgeDisplay badges={badges} size="sm" />
                                </div>
                                <p className="text-text-light dark:text-dark-text-muted mt-1">
                                    {profile.role === 'researcher' ? 'Researcher' : profile.role}
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3">
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
                    <p className="text-text dark:text-dark-text mt-6 max-w-2xl leading-relaxed">
                        {profile.bio}
                    </p>
                )}

                {/* Meta info row */}
                <div className="flex flex-wrap gap-4 text-sm text-text-light dark:text-dark-text-muted mt-4">
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
                                className="px-3 py-1 bg-gray-100 dark:bg-dark-border rounded-full text-sm text-text dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border/80 transition-colors"
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats with visual bars */}
                <div className="flex flex-wrap gap-6 md:gap-10 mt-8 pt-6 border-t border-gray-100 dark:border-dark-border">
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
                </div>
            </div>
        </div>
    )
}
