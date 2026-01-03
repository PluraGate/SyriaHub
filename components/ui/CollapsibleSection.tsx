'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  icon?: LucideIcon
  description?: string
  defaultOpen?: boolean
  badge?: string
  children: ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  icon: Icon,
  description,
  defaultOpen = false,
  badge,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div
      className={cn(
        'border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden transition-all',
        isOpen ? 'bg-gray-50 dark:bg-dark-bg/50' : 'bg-white dark:bg-dark-surface',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-light/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary dark:text-primary-light" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text dark:text-dark-text">
                {title}
              </span>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-dark-border text-text-light dark:text-dark-text-muted rounded-full">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-text-light dark:text-dark-text-muted mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-text-light dark:text-dark-text-muted">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-dark-border">
          <div className="pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
