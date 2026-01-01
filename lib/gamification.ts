// Utility to get tier from level - used by both client and server components
export function getTierFromLevel(level: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (level <= 10) return 'bronze'
    if (level <= 25) return 'silver'
    if (level <= 40) return 'gold'
    return 'platinum'
}

// Tier configuration for styling
export const tierConfig = {
    bronze: {
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-700 dark:text-amber-400',
        borderColor: 'border-amber-300 dark:border-amber-700',
        gradient: 'from-amber-500 to-amber-700',
    },
    silver: {
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-600 dark:text-gray-300',
        borderColor: 'border-gray-300 dark:border-gray-600',
        gradient: 'from-gray-400 to-gray-600',
    },
    gold: {
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-400',
        borderColor: 'border-yellow-400 dark:border-yellow-600',
        gradient: 'from-yellow-400 to-yellow-600',
    },
    platinum: {
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-700 dark:text-purple-400',
        borderColor: 'border-purple-400 dark:border-purple-600',
        gradient: 'from-purple-500 to-purple-700',
    },
} as const
