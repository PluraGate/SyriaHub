'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, PenLine, HelpCircle, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
    icon: React.ReactNode
    label: string
    href?: string
    onClick?: () => void
    color?: string
}

const defaultActions: QuickAction[] = [
    {
        icon: <PenLine className="w-5 h-5" />,
        label: 'New Post',
        href: '/editor',
        color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
        icon: <HelpCircle className="w-5 h-5" />,
        label: 'Ask Question',
        href: '/editor?type=question',
        color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
        icon: <Upload className="w-5 h-5" />,
        label: 'Upload Resource',
        href: '/resources/upload',
        color: 'bg-green-500 hover:bg-green-600',
    },
]

interface FloatingActionButtonProps {
    actions?: QuickAction[]
    className?: string
}

export function FloatingActionButton({
    actions = defaultActions,
    className,
}: FloatingActionButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={cn('fixed bottom-6 right-6 z-50', className)}>
            {/* Action Menu */}
            <div
                className={cn(
                    'absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300',
                    isOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-4 pointer-events-none'
                )}
            >
                {actions.map((action, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 justify-end animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <span className="bg-white dark:bg-dark-surface px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-text dark:text-dark-text whitespace-nowrap">
                            {action.label}
                        </span>
                        {action.href ? (
                            <Link
                                href={action.href}
                                className={cn(
                                    'w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 active:scale-95',
                                    action.color || 'bg-primary hover:bg-primary-dark'
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                {action.icon}
                            </Link>
                        ) : (
                            <button
                                onClick={() => {
                                    action.onClick?.()
                                    setIsOpen(false)
                                }}
                                className={cn(
                                    'w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 active:scale-95',
                                    action.color || 'bg-primary hover:bg-primary-dark'
                                )}
                            >
                                {action.icon}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Main FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'fab fab-primary w-14 h-14 transition-all duration-300',
                    isOpen && 'rotate-45 bg-gray-600 hover:bg-gray-700'
                )}
                aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
                aria-expanded={isOpen}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
        </div>
    )
}
