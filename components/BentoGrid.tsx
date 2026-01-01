'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type BentoCellSize = '1x1' | '2x1' | '1x2' | '2x2'

interface BentoGridProps {
    children: React.ReactNode
    className?: string
    columns?: 2 | 3 | 4
    gap?: 'sm' | 'md' | 'lg'
}

interface BentoGridItemProps {
    children: React.ReactNode
    className?: string
    size?: BentoCellSize
}

const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 md:gap-5',
    lg: 'gap-5 md:gap-6 lg:gap-8',
}

const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function BentoGrid({
    children,
    className,
    columns = 4,
    gap = 'md',
}: BentoGridProps) {
    return (
        <div
            className={cn(
                'grid auto-rows-[minmax(180px,auto)]',
                columnClasses[columns],
                gapClasses[gap],
                className
            )}
        >
            {children}
        </div>
    )
}

const sizeClasses: Record<BentoCellSize, string> = {
    '1x1': 'col-span-1 row-span-1',
    '2x1': 'col-span-1 sm:col-span-2 row-span-1',
    '1x2': 'col-span-1 row-span-2',
    '2x2': 'col-span-1 sm:col-span-2 row-span-2',
}

export function BentoGridItem({
    children,
    className,
    size = '1x1',
}: BentoGridItemProps) {
    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface',
                'border border-gray-100 dark:border-dark-border',
                'transition-all duration-300 ease-out',
                'hover:shadow-soft-lg hover:-translate-y-0.5',
                sizeClasses[size],
                className
            )}
        >
            {children}
        </div>
    )
}

// Preset configurations for common layouts
export const BentoPresets = {
    // Featured layout: 1 large, 2 medium, 2 small
    featured: [
        { size: '2x2' as const },
        { size: '1x1' as const },
        { size: '1x1' as const },
        { size: '1x1' as const },
        { size: '1x1' as const },
    ],
    // Editorial layout: alternating sizes
    editorial: [
        { size: '2x1' as const },
        { size: '1x1' as const },
        { size: '1x1' as const },
        { size: '1x2' as const },
        { size: '1x1' as const },
        { size: '1x1' as const },
    ],
    // Magazine layout: balanced grid
    magazine: [
        { size: '1x2' as const },
        { size: '1x1' as const },
        { size: '1x1' as const },
        { size: '2x1' as const },
        { size: '1x1' as const },
        { size: '1x1' as const },
    ],
}
