'use client'

import { useState, useRef } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeedbackList } from './FeedbackList'
import { FeedbackDialog } from './FeedbackDialog'
import { useTranslations } from 'next-intl'

export function FeedbackSection() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const t = useTranslations('Feedback')

    const handleTicketCreated = () => {
        // Increment key to force FeedbackList to refetch
        setRefreshKey(prev => prev + 1)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-text dark:text-dark-text">
                        {t('sectionTitle')}
                    </h2>
                    <p className="text-text-light dark:text-dark-text-muted mt-1">
                        {t('sectionDescription')}
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2 flex-shrink-0">
                    <MessageSquarePlus className="w-4 h-4" />
                    {t('newTicket')}
                </Button>
            </div>

            <FeedbackList key={refreshKey} isAdmin={false} />

            <FeedbackDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onTicketCreated={handleTicketCreated}
            />
        </div>
    )
}
