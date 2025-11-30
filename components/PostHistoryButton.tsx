'use client'

import { useState } from 'react'
import { History } from 'lucide-react'
import { PostHistoryDialog } from './PostHistoryDialog'
import { Button } from './ui/button'

interface PostHistoryButtonProps {
    postId: string
    asMenuItem?: boolean
}

export function PostHistoryButton({ postId, asMenuItem }: PostHistoryButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {asMenuItem ? (
                <div
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 w-full"
                >
                    <History className="w-4 h-4" />
                    <span>View History</span>
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                    className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light"
                    title="View Edit History"
                >
                    <History className="w-4 h-4 mr-2" />
                    History
                </Button>
            )}

            <PostHistoryDialog
                postId={postId}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    )
}
