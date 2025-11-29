import Link from 'next/link'
import { Users, Lock, Globe } from 'lucide-react'

interface GroupCardProps {
    group: {
        id: string
        name: string
        description: string | null
        visibility: 'private' | 'restricted' | 'public'
        member_count?: number
    }
}

export function GroupCard({ group }: GroupCardProps) {
    return (
        <Link
            href={`/groups/${group.id}`}
            className="card card-hover p-6 group flex flex-col h-full"
        >
            <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="font-display font-semibold text-xl text-primary dark:text-dark-text group-hover:text-accent dark:group-hover:text-accent-light transition-colors line-clamp-2">
                    {group.name}
                </h3>
                {group.visibility === 'public' ? (
                    <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                ) : (
                    <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                )}
            </div>

            {group.description && (
                <p className="text-text-light dark:text-dark-text-muted leading-relaxed line-clamp-3 mb-6 flex-grow">
                    {group.description}
                </p>
            )}

            <div className="flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted mt-auto">
                <Users className="w-4 h-4" />
                <span>
                    {group.member_count || 0} member{group.member_count !== 1 && 's'}
                </span>
            </div>
        </Link>
    )
}
