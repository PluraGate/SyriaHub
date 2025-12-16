'use client'

import { cn } from '@/lib/utils'
import {
    Lock,
    Footprints,
    PenTool,
    BookOpen,
    Lightbulb,
    HandHelping,
    Award,
    Trophy,
    MessageCircle,
    Users,
    Star,
    Medal,
    Crown,
    ThumbsUp,
    TrendingUp,
    Flame,
    Zap,
    ClipboardCheck,
    UserCheck,
    Rocket,
    UserPlus,
    CheckCircle
} from 'lucide-react'

// Map icon names to Lucide components
const iconMap: Record<string, React.ElementType> = {
    'footprints': Footprints,
    'pen-tool': PenTool,
    'book-open': BookOpen,
    'lightbulb': Lightbulb,
    'hand-helping': HandHelping,
    'award': Award,
    'trophy': Trophy,
    'message-circle': MessageCircle,
    'users': Users,
    'star': Star,
    'medal': Medal,
    'crown': Crown,
    'thumbs-up': ThumbsUp,
    'trending-up': TrendingUp,
    'flame': Flame,
    'zap': Zap,
    'clipboard-check': ClipboardCheck,
    'user-check': UserCheck,
    'rocket': Rocket,
    'user-plus': UserPlus,
    'check-circle': CheckCircle,
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    contribution: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
    },
    community: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
    },
    expertise: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
    },
    special: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
    },
}

interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    category: 'contribution' | 'community' | 'expertise' | 'special'
    xp_reward: number
    unlocked?: boolean
    unlocked_at?: string
    progress?: number  // 0-100 for partial progress
}

interface AchievementCardProps {
    achievement: Achievement
    size?: 'sm' | 'md' | 'lg'
}

export function AchievementCard({ achievement, size = 'md' }: AchievementCardProps) {
    const Icon = iconMap[achievement.icon] || Award
    const colors = categoryColors[achievement.category]
    const isLocked = !achievement.unlocked

    const sizeStyles = {
        sm: {
            card: 'p-3',
            icon: 'w-8 h-8',
            iconSize: 'w-4 h-4',
            title: 'text-sm',
            desc: 'text-xs',
        },
        md: {
            card: 'p-4',
            icon: 'w-12 h-12',
            iconSize: 'w-6 h-6',
            title: 'text-base',
            desc: 'text-sm',
        },
        lg: {
            card: 'p-6',
            icon: 'w-16 h-16',
            iconSize: 'w-8 h-8',
            title: 'text-lg',
            desc: 'text-base',
        },
    }

    const styles = sizeStyles[size]

    return (
        <div
            className={cn(
                "relative rounded-xl border transition-all",
                isLocked
                    ? "bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border opacity-60"
                    : cn(colors.bg, colors.border),
                styles.card
            )}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                    "flex-shrink-0 rounded-xl flex items-center justify-center",
                    styles.icon,
                    isLocked
                        ? "bg-gray-200 dark:bg-dark-border text-gray-400 dark:text-gray-600"
                        : cn(colors.text, "bg-white dark:bg-dark-surface shadow-sm")
                )}>
                    {isLocked ? (
                        <Lock className={styles.iconSize} />
                    ) : (
                        <Icon className={styles.iconSize} />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className={cn(
                        "font-semibold truncate",
                        styles.title,
                        isLocked
                            ? "text-gray-500 dark:text-gray-500"
                            : "text-text dark:text-dark-text"
                    )}>
                        {achievement.name}
                    </h4>
                    <p className={cn(
                        styles.desc,
                        isLocked
                            ? "text-gray-400 dark:text-gray-600"
                            : "text-text-light dark:text-dark-text-muted"
                    )}>
                        {achievement.description}
                    </p>

                    {/* XP Reward */}
                    {achievement.xp_reward > 0 && (
                        <div className={cn(
                            "inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium",
                            isLocked
                                ? "bg-gray-200 dark:bg-dark-border text-gray-500"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                        )}>
                            <Zap className="w-3 h-3" />
                            +{achievement.xp_reward} XP
                        </div>
                    )}

                    {/* Progress bar for partial achievements */}
                    {achievement.progress !== undefined && achievement.progress < 100 && (
                        <div className="mt-2">
                            <div className="h-1.5 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${achievement.progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{achievement.progress}% complete</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Unlocked date */}
            {achievement.unlocked && achievement.unlocked_at && (
                <p className="text-xs text-text-light dark:text-dark-text-muted mt-2 text-right">
                    Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                </p>
            )}
        </div>
    )
}
