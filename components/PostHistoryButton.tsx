'use client'

import { useState } from 'react'
import { History } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PostHistoryDialog } from './PostHistoryDialog'
import { Button } from './ui/button'

interface PostHistoryButtonProps {
    postId: string
    asMenuItem?: boolean
}

export function PostHistoryButton({ postId, asMenuItem }: PostHistoryButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const t = useTranslations('Post')

    return (
        <>
            {asMenuItem ? (
                <div
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 w-full"
                >
                    <History className="w-4 h-4" />
                    <span>{t('viewHistory')}</span>
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                    className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light"
                    title={t('viewHistory')}
                >
                    <History className="w-4 h-4 mr-2" />
                    {t('history')}
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
