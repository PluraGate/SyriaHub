import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all btn-press',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-white hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary focus-visible:ring-primary': variant === 'default',
            'border-2 border-gray-300 dark:border-dark-border text-text dark:text-dark-text hover:border-primary dark:hover:border-primary-light':
              variant === 'outline',
            'text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface': variant === 'ghost',
            'bg-accent text-white hover:bg-accent-dark focus-visible:ring-accent': variant === 'destructive',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-8 px-3 text-sm': size === 'sm',
            'h-12 px-6 text-lg': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
