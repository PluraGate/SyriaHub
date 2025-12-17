'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface InfoHintProps {
    /** The explanation text shown on hover */
    content: string
    /** Optional size of the icon */
    size?: 'sm' | 'md'
    /** Optional additional className */
    className?: string
}

/**
 * A small question mark icon that shows a tooltip on hover.
 * Used to explain unclear features or provide context.
 * 
 * @example
 * <InfoHint content="This feature checks your content against external sources." />
 */
export function InfoHint({ content, size = 'sm', className = '' }: InfoHintProps) {
    const [isVisible, setIsVisible] = useState(false)

    const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

    return (
        <div className={`relative inline-flex items-center ${className}`}>
            <button
                type="button"
                className={`${iconSize} text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-primary transition-colors cursor-help`}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                aria-label="More information"
            >
                <HelpCircle className="w-full h-full" />
            </button>

            {isVisible && (
                <div
                    role="tooltip"
                    className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 
                               text-[11px] leading-relaxed text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg
                               min-w-[200px] max-w-sm whitespace-normal text-center
                               before:content-[''] before:absolute before:top-full before:left-1/2 
                               before:-translate-x-1/2 before:border-4 before:border-transparent 
                               before:border-t-gray-900 dark:before:border-t-gray-700"
                >
                    {content}
                </div>
            )}
        </div>
    )
}
