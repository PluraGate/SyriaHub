'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSessionContext, resetSessionContext, getTrailSummary, ResearchTrailItem } from '@/lib/sessionContext'
import { History, RotateCcw, ChevronRight, Tag, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SessionContextBar() {
    const [trail, setTrail] = useState<ResearchTrailItem[]>([])
    const [summary, setSummary] = useState<{ totalViewed: number; disciplines: string[]; sessionDuration: string }>({
        totalViewed: 0,
        disciplines: [],
        sessionDuration: '0m'
    })
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        const context = getSessionContext()
        setTrail(context.researchTrail.slice(-5).reverse())
        setSummary(getTrailSummary())
    }, [])

    const handleReset = () => {
        if (confirm('Reset your research context? This clears your current session trail.')) {
            resetSessionContext()
            setTrail([])
            setSummary({ totalViewed: 0, disciplines: [], sessionDuration: '0m' })
        }
    }

    if (trail.length === 0) {
        return null
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-text dark:text-dark-text">
                        Research Trail
                    </span>
                    <span className="text-xs text-text-light dark:text-dark-text-muted">
                        {summary.totalViewed} viewed • {summary.sessionDuration}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleReset()
                        }}
                        className="h-7 px-2 text-xs text-text-light hover:text-accent"
                    >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset Context
                    </Button>
                    <ChevronRight className={`w-4 h-4 text-text-light transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
            </div>

            {/* Expanded Trail */}
            {isExpanded && (
                <div className="border-t border-gray-100 dark:border-dark-border">
                    {/* Disciplines */}
                    {summary.disciplines.length > 0 && (
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border">
                            <div className="flex items-center gap-1 flex-wrap">
                                <Tag className="w-3 h-3 text-text-light" />
                                <span className="text-xs text-text-light dark:text-dark-text-muted mr-1">Topics explored:</span>
                                {summary.disciplines.map(d => (
                                    <span key={d} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-dark-border rounded-full text-text-light dark:text-dark-text-muted">
                                        {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trail Items */}
                    <div className="divide-y divide-gray-100 dark:divide-dark-border">
                        {trail.map((item, idx) => (
                            <Link
                                key={item.postId}
                                href={`/post/${item.postId}`}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors"
                            >
                                <span className="text-xs text-text-light dark:text-dark-text-muted w-4">
                                    {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text dark:text-dark-text truncate">
                                        {item.title}
                                    </p>
                                </div>
                                <span className="text-[10px] text-text-light dark:text-dark-text-muted flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeAgo(item.viewedAt)}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Footer Note */}
                    <div className="px-4 py-2 bg-gray-50 dark:bg-dark-bg/50 border-t border-gray-100 dark:border-dark-border">
                        <p className="text-[10px] text-text-light dark:text-dark-text-muted text-center">
                            Session context is bounded to this tab. No long-term tracking.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h ago`
}
