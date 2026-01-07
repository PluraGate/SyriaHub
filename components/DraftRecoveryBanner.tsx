'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DraftData, formatTimeSince } from '@/lib/hooks/useAutosave'
import { useTranslations } from 'next-intl'

interface DraftRecoveryBannerProps {
    draftData: DraftData
    onRestore: () => void
    onDiscard: () => void
}

export function DraftRecoveryBanner({
    draftData,
    onRestore,
    onDiscard,
}: DraftRecoveryBannerProps) {
    const t = useTranslations('Editor')
    const [timeAgo, setTimeAgo] = useState('')

    useEffect(() => {
        const updateTime = () => {
            setTimeAgo(formatTimeSince(new Date(draftData.lastSaved)))
        }
        updateTime()
        const interval = setInterval(updateTime, 60000)
        return () => clearInterval(interval)
    }, [draftData.lastSaved])

    return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                            {t('draft.unsavedDraftFound')}
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-0.5">
                            {draftData.title ? (
                                <>
                                    <span className="font-medium">&quot;{draftData.title.slice(0, 30)}{draftData.title.length > 30 ? '...' : ''}&quot;</span>
                                    <span className="mx-1">•</span>
                                </>
                            ) : null}
                            <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {t('draft.savedTimeAgo', { time: timeAgo })}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onDiscard}
                        className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/30"
                    >
                        <X className="w-4 h-4 mr-1" />
                        {t('draft.discard')}
                    </Button>
                    <Button
                        size="sm"
                        onClick={onRestore}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        {t('draft.restore')}
                    </Button>
                </div>
            </div>
        </div>
    )
}

interface AutosaveIndicatorProps {
    lastSaved: Date | null
    isSaving?: boolean
}

export function AutosaveIndicator({ lastSaved, isSaving }: AutosaveIndicatorProps) {
    const t = useTranslations('Editor')
    const [timeAgo, setTimeAgo] = useState('')

    useEffect(() => {
        if (!lastSaved) return
        const updateTime = () => {
            setTimeAgo(formatTimeSince(lastSaved))
        }
        updateTime()
        const interval = setInterval(updateTime, 10000)
        return () => clearInterval(interval)
    }, [lastSaved])

    if (!lastSaved && !isSaving) return null

    return (
        <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
            {isSaving ? (
                <>
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>{t('draft.saving')}</span>
                </>
            ) : lastSaved ? (
                <>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span>{t('draft.savedTimeAgo', { time: timeAgo })}</span>
                </>
            ) : null}
        </div>
    )
}

