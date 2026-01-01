'use client'

import { cn } from '@/lib/utils'
import { CheckCircle, Award } from 'lucide-react'

interface SkillBadgeProps {
    skillId: string
    name: string
    category: string
    isRecognized: boolean
    endorsementCount: number
    hasEndorsed?: boolean
    onEndorse?: () => void
    isOwnProfile?: boolean
    size?: 'sm' | 'md'
}

const categoryColors: Record<string, string> = {
    'Research Methods': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    'Technical': 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    'Domain Knowledge': 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    'Work Field': 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    'Practical Expertise': 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
}

export function SkillBadge({
    skillId,
    name,
    category,
    isRecognized,
    endorsementCount,
    hasEndorsed = false,
    onEndorse,
    isOwnProfile = false,
    size = 'md'
}: SkillBadgeProps) {
    const colorClass = categoryColors[category] || 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'

    const handleClick = () => {
        if (!isOwnProfile && onEndorse) {
            onEndorse()
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={isOwnProfile || !onEndorse}
            className={cn(
                'group relative inline-flex items-center gap-2 rounded-full border transition-all',
                colorClass,
                size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                !isOwnProfile && onEndorse && 'hover:shadow-md cursor-pointer',
                hasEndorsed && 'ring-2 ring-primary ring-offset-1 dark:ring-offset-dark-bg',
                isOwnProfile && 'cursor-default'
            )}
        >
            {/* Recognized badge */}
            {isRecognized && (
                <Award className={cn(
                    'text-current opacity-60',
                    size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
                )} />
            )}

            {/* Skill name */}
            <span className="font-medium">{name}</span>

            {/* Endorsement count */}
            {endorsementCount > 0 && (
                <span className={cn(
                    'rounded-full bg-white/50 dark:bg-black/20 font-semibold',
                    size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
                )}>
                    {endorsementCount}
                </span>
            )}

            {/* Endorsed indicator */}
            {hasEndorsed && (
                <CheckCircle className={cn(
                    'text-primary',
                    size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
                )} />
            )}

            {/* Hover tooltip for non-own profiles */}
            {!isOwnProfile && onEndorse && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-dark-bg text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {hasEndorsed ? 'Remove endorsement' : 'Endorse this skill'}
                </span>
            )}
        </button>
    )
}
