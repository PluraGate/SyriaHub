'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquareQuote } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TextSelectionHandlerProps {
    children: React.ReactNode
    postId: string
}

export function TextSelectionHandler({ children, postId }: TextSelectionHandlerProps) {
    const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        const handleSelectionChange = () => {
            const activeSelection = window.getSelection()

            if (!activeSelection || activeSelection.isCollapsed || !containerRef.current) {
                setSelection(null)
                return
            }

            // Check if selection is within our container
            if (!containerRef.current.contains(activeSelection.anchorNode)) {
                setSelection(null)
                return
            }

            const text = activeSelection.toString().trim()
            if (!text) {
                setSelection(null)
                return
            }

            const range = activeSelection.getRangeAt(0)
            const rect = range.getBoundingClientRect()

            // Calculate position relative to viewport, but we'll use fixed positioning for the button
            // Position above the selection
            setSelection({
                text,
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            })
        }

        document.addEventListener('selectionchange', handleSelectionChange)
        // Also listen to mouseup to catch the end of selection more reliably
        document.addEventListener('mouseup', handleSelectionChange)

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange)
            document.removeEventListener('mouseup', handleSelectionChange)
        }
    }, [])

    const handleCite = () => {
        if (!selection) return

        // Encode the quote and redirect to editor
        const encodedQuote = encodeURIComponent(selection.text)
        router.push(`/editor?critique_of=${postId}&quote=${encodedQuote}`)
    }

    return (
        <div ref={containerRef} className="relative">
            {children}

            {selection && (
                <div
                    className="fixed z-50 transform -translate-x-1/2 -translate-y-full"
                    style={{
                        left: selection.x,
                        top: selection.y
                    }}
                >
                    <Button
                        size="sm"
                        className="shadow-lg animate-in fade-in zoom-in duration-200 gap-2"
                        onClick={handleCite}
                    >
                        <MessageSquareQuote className="w-4 h-4" />
                        Cite Selection
                    </Button>
                </div>
            )}
        </div>
    )
}
