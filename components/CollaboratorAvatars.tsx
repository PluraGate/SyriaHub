'use client'

import { Eye } from 'lucide-react'

interface CollaboratorAvatarsProps {
    collaborators: {
        id: string
        name: string
        avatar_url?: string
        color: string
    }[]
    isConnected: boolean
    userColor: string
}

/**
 * Displays avatars of users currently viewing/editing the same document
 */
export function CollaboratorAvatars({ collaborators, isConnected, userColor }: CollaboratorAvatarsProps) {
    if (!isConnected) {
        return (
            <div className="flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                Connecting...
            </div>
        )
    }

    const totalCount = collaborators.length + 1 // +1 for current user
    const displayAvatars = collaborators.slice(0, 3)
    const extraCount = collaborators.length > 3 ? collaborators.length - 3 : 0

    return (
        <div className="flex items-center gap-3">
            {/* Connection indicator */}
            <div className="flex items-center gap-1.5 text-xs text-secondary-dark dark:text-secondary">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Live
            </div>

            {/* Avatars */}
            <div className="flex -space-x-2">
                {/* Current user (YOU) */}
                <div
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-surface flex items-center justify-center text-white text-[10px] font-bold z-10 shadow-sm"
                    style={{ backgroundColor: userColor }}
                    title="You (Editor)"
                >
                    YOU
                </div>

                {/* Collaborators */}
                {displayAvatars.map((collab, index) => (
                    <div
                        key={collab.id}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-surface overflow-hidden"
                        style={{ zIndex: 9 - index }}
                        title={collab.name}
                    >
                        {collab.avatar_url ? (
                            <img
                                src={collab.avatar_url}
                                alt={collab.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: collab.color }}
                            >
                                {collab.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                ))}

                {/* Extra count badge */}
                {extraCount > 0 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-surface bg-gray-200 dark:bg-dark-border flex items-center justify-center text-xs font-bold text-text dark:text-dark-text z-0">
                        +{extraCount}
                    </div>
                )}
            </div>

            {/* Viewer count */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-light dark:text-dark-text-muted">
                <Eye className="w-3.5 h-3.5" />
                <span className="tabular-nums">{totalCount} {totalCount === 1 ? 'viewer' : 'viewers'}</span>
            </div>
        </div>
    )
}
