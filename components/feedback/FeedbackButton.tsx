'use client'

import { useState, useEffect } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FeedbackDialog } from './FeedbackDialog'
import { useTranslations } from 'next-intl'

export function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const t = useTranslations('Feedback')

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

    // Don't render anything while loading or if not authorized
    if (isLoading || !isAuthorized) return null

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all group"
                title={t('buttonTitle')}
            >
                <MessageSquarePlus className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">
                    {t('buttonLabel')}
                </span>
            </button>

            {/* Dialog */}
            <FeedbackDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    )
}
