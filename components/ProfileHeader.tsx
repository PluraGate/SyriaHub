import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EditProfileDialog } from './EditProfileDialog'
import { MapPin, Link as LinkIcon, Building2, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface ProfileHeaderProps {
    profile: any
    stats: any
    isOwnProfile: boolean
}

export function ProfileHeader({ profile, stats, isOwnProfile }: ProfileHeaderProps) {
    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <Avatar className="w-32 h-32 border-4 border-white dark:border-dark-surface shadow-lg">
                        <AvatarImage src={profile.avatar_url} alt={profile.name} />
                        <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                            {profile.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Info */}
                <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-text dark:text-dark-text">
                                {profile.name}
                            </h1>
                            <p className="text-lg text-text-light dark:text-dark-text-muted">
                                {profile.role === 'researcher' ? 'Researcher' : profile.role}
                            </p>
                        </div>
                        {isOwnProfile && <EditProfileDialog profile={profile} />}
                    </div>

                    {profile.bio && (
                        <p className="text-text dark:text-dark-text mb-6 max-w-2xl leading-relaxed">
                            {profile.bio}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-text-light dark:text-dark-text-muted mb-6">
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
                        <div className="flex flex-wrap gap-2 mb-6">
                            {profile.research_interests.map((interest: string) => (
                                <span
                                    key={interest}
                                    className="px-3 py-1 bg-gray-100 dark:bg-dark-border rounded-full text-sm text-text dark:text-dark-text"
                                >
                                    {interest}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-8 border-t border-gray-100 dark:border-dark-border pt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary dark:text-dark-text">
                                {stats?.post_count || 0}
                            </div>
                            <div className="text-xs uppercase tracking-wider text-text-light dark:text-dark-text-muted">
                                Posts
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary dark:text-dark-text">
                                {stats?.citation_count || 0}
                            </div>
                            <div className="text-xs uppercase tracking-wider text-text-light dark:text-dark-text-muted">
                                Citations
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary dark:text-dark-text">
                                {stats?.group_count || 0}
                            </div>
                            <div className="text-xs uppercase tracking-wider text-text-light dark:text-dark-text-muted">
                                Groups
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
