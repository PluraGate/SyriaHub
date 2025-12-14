import Link from 'next/link'
import Image from 'next/image'
import { User as UserIcon, Building2, ArrowUpRight } from 'lucide-react'
import { User } from '@/types'
import ReputationScore from './ReputationScore'

interface ProfileCardProps {
    profile: User
}

export function ProfileCard({ profile }: ProfileCardProps) {
    // Generate a gradient based on name (used as fallback)
    const gradients = [
        'from-primary to-secondary',
        'from-secondary to-primary',
        'from-primary to-primary-dark',
        'from-secondary to-secondary-dark',
    ]
    const gradientIndex = profile.name.charCodeAt(0) % gradients.length
    const gradient = gradients[gradientIndex]

    const hasCoverImage = !!profile.cover_image_url
    const hasAvatar = !!profile.avatar_url

    return (
        <Link
            href={`/profile/${profile.id}`}
            className="group relative flex flex-col h-full bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
        >
            {/* Header - Cover Image or Gradient */}
            <div className="h-16 relative">
                {hasCoverImage ? (
                    <Image
                        src={profile.cover_image_url!}
                        alt=""
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                )}
                {/* Avatar */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-dark-surface border-4 border-white dark:border-dark-surface shadow-soft-md flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                        {hasAvatar ? (
                            <Image
                                src={profile.avatar_url!}
                                alt={profile.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className={`font-bold text-xl bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
                                {profile.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center text-center pt-12 pb-6 px-4 flex-grow">
                <h3 className="font-bold text-lg text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary-light transition-colors mb-1">
                    {profile.name}
                </h3>

                {profile.reputation !== undefined && profile.reputation > 0 && (
                    <div className="mb-2">
                        <ReputationScore score={profile.reputation} size="sm" />
                    </div>
                )}

                {profile.affiliation ? (
                    <div className="flex items-center gap-1.5 text-sm text-text-light dark:text-dark-text-muted mb-3">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{profile.affiliation}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-sm text-text-light dark:text-dark-text-muted mb-3">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{profile.role}</span>
                    </div>
                )}

                {profile.bio && (
                    <p className="text-sm text-text-light dark:text-dark-text-muted line-clamp-2 mt-auto">
                        {profile.bio}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
                <span className="text-sm font-medium text-primary dark:text-primary-light group-hover:underline">
                    View Profile
                </span>
                <ArrowUpRight className="w-4 h-4 ml-1 text-primary dark:text-primary-light" />
            </div>
        </Link>
    )
}

