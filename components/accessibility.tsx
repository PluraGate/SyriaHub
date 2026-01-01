'use client'

/**
 * Skip Navigation Link Component
 * Provides keyboard-accessible skip link for main content
 */
export function SkipNavLink() {
    return (
        <a
            href="#main-content"
            className="
        sr-only focus:not-sr-only
        fixed top-2 left-2 z-[100]
        px-4 py-2 
        bg-primary text-white 
        rounded-lg 
        font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
        transition-transform
        -translate-y-full focus:translate-y-0
      "
        >
            Skip to main content
        </a>
    )
}

/**
 * Skip Nav Target - wrap main content with this
 */
export function SkipNavContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <main id="main-content" tabIndex={-1} className={`outline-none ${className}`}>
            {children}
        </main>
    )
}

/**
 * Focus trap for modals and dialogs
 */
import { useEffect, useRef, ReactNode } from 'react'

interface FocusTrapProps {
    children: ReactNode
    active?: boolean
    returnFocusOnDeactivate?: boolean
}

export function FocusTrap({
    children,
    active = true,
    returnFocusOnDeactivate = true
}: FocusTrapProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<Element | null>(null)

    useEffect(() => {
        if (!active) return

        previousActiveElement.current = document.activeElement

        const container = containerRef.current
        if (!container) return

        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        // Focus first element
        firstElement?.focus()

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault()
                    lastElement?.focus()
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault()
                    firstElement?.focus()
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            if (returnFocusOnDeactivate && previousActiveElement.current instanceof HTMLElement) {
                previousActiveElement.current.focus()
            }
        }
    }, [active, returnFocusOnDeactivate])

    return <div ref={containerRef}>{children}</div>
}

/**
 * Announce content to screen readers
 */
export function VisuallyHidden({ children }: { children: ReactNode }) {
    return (
        <span className="sr-only">
            {children}
        </span>
    )
}

/**
 * Live region for dynamic announcements
 */
interface LiveRegionProps {
    message: string
    politeness?: 'polite' | 'assertive'
}

export function LiveRegion({ message, politeness = 'polite' }: LiveRegionProps) {
    return (
        <div
            role="status"
            aria-live={politeness}
            aria-atomic="true"
            className="sr-only"
        >
            {message}
        </div>
    )
}

/**
 * Hook for announcing messages to screen readers
 */
import { useState, useCallback } from 'react'

export function useAnnounce() {
    const [message, setMessage] = useState('')

    const announce = useCallback((text: string, delay = 100) => {
        // Clear first to ensure re-announcement of same message
        setMessage('')
        setTimeout(() => setMessage(text), delay)
    }, [])

    const LiveRegionComponent = () => (
        <LiveRegion message={message} />
    )

    return { announce, LiveRegion: LiveRegionComponent }
}

/**
 * Keyboard navigation hook
 */
export function useKeyboardNavigation(
    items: HTMLElement[],
    options: {
        orientation?: 'horizontal' | 'vertical' | 'both'
        wrap?: boolean
        onSelect?: (item: HTMLElement) => void
    } = {}
) {
    const { orientation = 'vertical', wrap = true, onSelect } = options
    const [activeIndex, setActiveIndex] = useState(0)

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const length = items.length
        if (length === 0) return

        let newIndex = activeIndex

        switch (e.key) {
            case 'ArrowDown':
                if (orientation !== 'horizontal') {
                    e.preventDefault()
                    newIndex = wrap
                        ? (activeIndex + 1) % length
                        : Math.min(activeIndex + 1, length - 1)
                }
                break
            case 'ArrowUp':
                if (orientation !== 'horizontal') {
                    e.preventDefault()
                    newIndex = wrap
                        ? (activeIndex - 1 + length) % length
                        : Math.max(activeIndex - 1, 0)
                }
                break
            case 'ArrowRight':
                if (orientation !== 'vertical') {
                    e.preventDefault()
                    newIndex = wrap
                        ? (activeIndex + 1) % length
                        : Math.min(activeIndex + 1, length - 1)
                }
                break
            case 'ArrowLeft':
                if (orientation !== 'vertical') {
                    e.preventDefault()
                    newIndex = wrap
                        ? (activeIndex - 1 + length) % length
                        : Math.max(activeIndex - 1, 0)
                }
                break
            case 'Home':
                e.preventDefault()
                newIndex = 0
                break
            case 'End':
                e.preventDefault()
                newIndex = length - 1
                break
            case 'Enter':
            case ' ':
                e.preventDefault()
                onSelect?.(items[activeIndex])
                return
            default:
                return
        }

        setActiveIndex(newIndex)
        items[newIndex]?.focus()
    }, [items, activeIndex, orientation, wrap, onSelect])

    return { activeIndex, setActiveIndex, handleKeyDown }
}

/**
 * Reduced motion preference hook
 */
export function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional initialization from media query
        setPrefersReducedMotion(mediaQuery.matches)

        const listener = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches)
        }

        mediaQuery.addEventListener('change', listener)
        return () => mediaQuery.removeEventListener('change', listener)
    }, [])

    return prefersReducedMotion
}
