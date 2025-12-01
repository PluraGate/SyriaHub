import Link from 'next/link'
import { User as UserIcon, Building2 } from 'lucide-react'
import { User } from '@/types'
import ReputationScore from './ReputationScore'

interface ProfileCardProps {
    profile: User
}

export function ProfileCard({ profile }: ProfileCardProps) {
    return (
        <Link
            href={`/profile/${profile.id}`}
            className="card card-hover p-6 flex flex-col h-full items-center text-center group"
        >
            <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="font-display font-bold text-2xl text-primary dark:text-primary-light">
                    {profile.name.charAt(0).toUpperCase()}
                </span>
            </div>

            <h3 className="font-display font-semibold text-lg text-primary dark:text-dark-text mb-1 group-hover:text-accent dark:group-hover:text-accent-light transition-colors">
                {profile.name}
            </h3>

            {profile.reputation !== undefined && profile.reputation > 0 && (
                <div className="mb-2">
                    <ReputationScore score={profile.reputation} size="sm" />
                </div>
            )}

            {profile.affiliation && (
                <div className="flex items-center gap-1.5 text-sm text-text-light dark:text-dark-text-muted mb-3">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{profile.affiliation}</span>
                </div>
            )}

            {!profile.affiliation && (
                <div className="flex items-center gap-1.5 text-sm text-text-light dark:text-dark-text-muted mb-3">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="capitalize">{profile.role}</span>
                </div>
            )}

            {profile.bio && (
                <p className="text-sm text-text-light dark:text-dark-text-muted line-clamp-2 mb-4">
                    {profile.bio}
                </p>
            )}
        </Link>
    )
}
