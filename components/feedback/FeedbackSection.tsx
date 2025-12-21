'use client'

import { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeedbackList } from './FeedbackList'
import { FeedbackDialog } from './FeedbackDialog'
import { useTranslations } from 'next-intl'

export function FeedbackSection() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const t = useTranslations('Feedback')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-text dark:text-dark-text">
                        {t('sectionTitle')}
                    </h2>
                    <p className="text-text-light dark:text-dark-text-muted mt-1">
                        {t('sectionDescription')}
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <MessageSquarePlus className="w-4 h-4" />
                    {t('newTicket')}
                </Button>
            </div>

            <FeedbackList isAdmin={false} />

            <FeedbackDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </div>
    )
}
