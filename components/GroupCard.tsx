import Link from 'next/link'
import { Users, Lock, Globe, ArrowUpRight } from 'lucide-react'

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
    const visibilityColors = {
        public: 'bg-secondary/20 text-secondary-dark dark:text-secondary',
        restricted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        private: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }

    return (
        <Link
            href={`/groups/${group.id}`}
            className="group relative flex flex-col h-full bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
        >
            {/* Top Row: Name + Visibility Badge */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2">
                        {group.name}
                    </h3>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${visibilityColors[group.visibility]}`}>
                    {group.visibility === 'public' ? (
                        <Globe className="w-3 h-3" />
                    ) : (
                        <Lock className="w-3 h-3" />
                    )}
                    <span className="capitalize">{group.visibility}</span>
                </div>
            </div>

            {/* Description */}
            {group.description && (
                <p className="text-sm text-text-light dark:text-dark-text-muted leading-relaxed line-clamp-3 mb-6 flex-grow">
                    {group.description}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">
                        {group.member_count || 0} member{(group.member_count || 0) !== 1 && 's'}
                    </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-bg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                </div>
            </div>
        </Link>
    )
}
