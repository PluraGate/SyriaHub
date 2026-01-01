'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquarePlus, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FeedbackDialog } from './FeedbackDialog'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'syriahub-feedback-button-position'

interface Position {
    x: number
    y: number
}

export function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isDragging, setIsDragging] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const positionRef = useRef<Position | null>(null)
    const dragStartRef = useRef<{ x: number; y: number; buttonX: number; buttonY: number } | null>(null)
    const hasDraggedRef = useRef(false)

    const t = useTranslations('Feedback')

    // Apply position directly to DOM for instant update
    const applyPosition = useCallback((x: number, y: number, skipBounds = false) => {
        const button = buttonRef.current
        if (!button) return

        let finalX = x
        let finalY = y

        if (!skipBounds) {
            const maxX = window.innerWidth - button.offsetWidth
            const maxY = window.innerHeight - button.offsetHeight
            finalX = Math.min(Math.max(0, x), maxX)
            finalY = Math.min(Math.max(0, y), maxY)
        }

        // Use transform for GPU-accelerated movement
        button.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`
        button.style.left = '0'
        button.style.top = '0'
        button.style.right = 'auto'
        button.style.bottom = 'auto'

        positionRef.current = { x: finalX, y: finalY }
    }, [])

    // Load saved position from localStorage
    useEffect(() => {
        if (isLoading || !isAuthorized) return

        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                // Small delay to ensure button is rendered
                requestAnimationFrame(() => {
                    applyPosition(parsed.x, parsed.y)
                })
            } catch {
                // Invalid saved position, use default
            }
        }
    }, [isLoading, isAuthorized, applyPosition])

    useEffect(() => {
        async function checkAuthorization() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (data && ['admin', 'moderator', 'researcher'].includes(data.role)) {
                    setIsAuthorized(true)
                }
            }
            setIsLoading(false)
        }

        checkAuthorization()
    }, [])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return
        e.preventDefault()
        e.stopPropagation()

        const button = buttonRef.current
        if (!button) return

        const rect = button.getBoundingClientRect()
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            buttonX: rect.left,
            buttonY: rect.top,
        }
        hasDraggedRef.current = false
        setIsDragging(true)
    }, [])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragStartRef.current) return

        const deltaX = e.clientX - dragStartRef.current.x
        const deltaY = e.clientY - dragStartRef.current.y

        // Start dragging after 3px movement
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            hasDraggedRef.current = true
        }

        if (hasDraggedRef.current) {
            const newX = dragStartRef.current.buttonX + deltaX
            const newY = dragStartRef.current.buttonY + deltaY
            applyPosition(newX, newY)
        }
    }, [applyPosition])

    const handleMouseUp = useCallback(() => {
        if (!dragStartRef.current) return

        // Save position
        if (positionRef.current && hasDraggedRef.current) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(positionRef.current))
        }

        // If didn't drag, treat as click
        if (!hasDraggedRef.current) {
            setIsOpen(true)
        }

        setIsDragging(false)
        dragStartRef.current = null
    }, [])

    useEffect(() => {
        if (isDragging) {
            // Use capture phase for faster response
            document.addEventListener('mousemove', handleMouseMove, { passive: true })
            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging, handleMouseMove, handleMouseUp])

    // Touch events for mobile
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0]
        const button = buttonRef.current
        if (!button) return

        const rect = button.getBoundingClientRect()
        dragStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            buttonX: rect.left,
            buttonY: rect.top,
        }
        hasDraggedRef.current = false
        setIsDragging(true)
    }, [])

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!dragStartRef.current) return
        e.preventDefault()

        const touch = e.touches[0]
        const deltaX = touch.clientX - dragStartRef.current.x
        const deltaY = touch.clientY - dragStartRef.current.y

        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            hasDraggedRef.current = true
        }

        if (hasDraggedRef.current) {
            const newX = dragStartRef.current.buttonX + deltaX
            const newY = dragStartRef.current.buttonY + deltaY
            applyPosition(newX, newY)
        }
    }, [applyPosition])

    const handleTouchEnd = useCallback(() => {
        if (!dragStartRef.current) return

        if (positionRef.current && hasDraggedRef.current) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(positionRef.current))
        }

        if (!hasDraggedRef.current) {
            setIsOpen(true)
        }

        setIsDragging(false)
        dragStartRef.current = null
    }, [])

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('touchmove', handleTouchMove, { passive: false })
            document.addEventListener('touchend', handleTouchEnd)
            return () => {
                document.removeEventListener('touchmove', handleTouchMove)
                document.removeEventListener('touchend', handleTouchEnd)
            }
        }
    }, [isDragging, handleTouchMove, handleTouchEnd])

    if (isLoading || !isAuthorized) return null

    return (
        <>
            <button
                ref={buttonRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-xl group select-none ${isDragging ? 'cursor-grabbing !opacity-90' : 'cursor-grab'}`}
                style={{
                    willChange: isDragging ? 'transform' : 'auto',
                    transition: isDragging ? 'none' : 'box-shadow 0.2s, background-color 0.2s'
                }}
                title={t('buttonTitle')}
            >
                <GripVertical className="w-4 h-4 opacity-50 group-hover:opacity-100 flex-shrink-0" />
                <MessageSquarePlus className="w-5 h-5 flex-shrink-0" />
                <span className="hidden sm:inline font-medium whitespace-nowrap">
                    {t('buttonLabel')}
                </span>
            </button>

            <FeedbackDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    )
}
