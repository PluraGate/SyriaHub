import Link from 'next/link'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagChipProps {
  tag: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'accent'
  interactive?: boolean
  onRemove?: () => void
  className?: string
}

export function TagChip({
  tag,
  size = 'md',
  variant = 'default',
  interactive = false,
  onRemove,
  className,
}: TagChipProps) {
  const baseStyles = cn(
    'inline-flex items-center gap-1.5 rounded-full font-medium transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    {
      // Size variants
      'px-2.5 py-1 text-xs': size === 'sm',
      'px-3 py-1.5 text-sm': size === 'md',
      'px-4 py-2 text-base': size === 'lg',
      
      // Color variants
      'bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-primary-light':
        variant === 'default',
      'border-2 border-primary/20 text-primary dark:border-primary-light/30 dark:text-primary-light':
        variant === 'outline',
      'bg-accent/10 text-accent dark:bg-accent-light/20 dark:text-accent-light':
        variant === 'accent',
      
      // Interactive styles
      'cursor-pointer hover:scale-105': interactive,
      'hover:bg-primary/20 dark:hover:bg-primary-light/30':
        interactive && variant === 'default',
      'hover:border-primary/40 dark:hover:border-primary-light/50':
        interactive && variant === 'outline',
      'hover:bg-accent/20 dark:hover:bg-accent-light/30':
        interactive && variant === 'accent',
    },
    className
  )

  const content = (
    <>
      <span>#{tag}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
          className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${tag} tag`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </>
  )

  if (interactive && !onRemove) {
    return (
      <Link
        href={`/feed?tag=${encodeURIComponent(tag)}`}
        className={baseStyles}
      >
        {content}
      </Link>
    )
  }

  return (
    <span className={baseStyles} role="listitem">
      {content}
    </span>
  )
}

interface TagListProps {
  tags: string[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'accent'
  interactive?: boolean
  maxDisplay?: number
  onRemove?: (tag: string) => void
  className?: string
}

export function TagList({
  tags,
  size = 'md',
  variant = 'default',
  interactive = false,
  maxDisplay,
  onRemove,
  className,
}: TagListProps) {
  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags
  const remainingCount = maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0

  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="list" aria-label="Tags">
      {displayTags.map((tag) => (
        <TagChip
          key={tag}
          tag={tag}
          size={size}
          variant={variant}
          interactive={interactive}
          onRemove={onRemove ? () => onRemove(tag) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full font-medium text-text-light dark:text-dark-text-muted',
            {
              'px-2.5 py-1 text-xs': size === 'sm',
              'px-3 py-1.5 text-sm': size === 'md',
              'px-4 py-2 text-base': size === 'lg',
            }
          )}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}
