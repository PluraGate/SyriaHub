'use client'

import { useState } from 'react'
import { MessageSquareMore } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface RequestClarificationButtonProps {
    postId: string
    authorId: string
    currentUserId?: string
    locale?: string
}

export function RequestClarificationButton({
    postId,
    authorId,
    currentUserId,
    locale = 'en'
}: RequestClarificationButtonProps) {
    const router = useRouter()
    const t = useTranslations('Correspondence')

    // Don't show if user is the author or not logged in
    if (!currentUserId || currentUserId === authorId) {
        return null
    }

    const handleClick = () => {
        router.push(`/${locale}/correspondence/compose?post=${postId}`)
    }

    return (
        <Button
            variant="outline"
            className="gap-2"
            onClick={handleClick}
        >
            <MessageSquareMore className="w-4 h-4" />
            {t('requestClarification')}
        </Button>
    )
}
