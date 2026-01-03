'use client'

import { useState, useMemo } from 'react'
import { MagazineCard } from '@/components/MagazineCard'
import { GroupCard } from '@/components/GroupCard'
import { EventCard } from '@/components/EventCard'
import { FileText, Users, BookOpen, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface UserActivityFeedProps {
    posts: any[]
    groups: any[]
}

type TabType = 'posts' | 'events' | 'groups'

export function UserActivityFeed({ posts, groups }: UserActivityFeedProps) {
    const t = useTranslations('Gamification')
    const tNav = useTranslations('Navigation')
    const researchPosts = posts.filter(p => !p.content_type || p.content_type === 'article' || p.content_type === 'question' || p.content_type === 'answer')
    const eventPosts = posts.filter(p => p.content_type === 'event')

    // Determine which tabs have content
    const availableTabs = useMemo(() => {
        const tabs: { id: TabType; label: string; icon: typeof FileText; count: number; colorClass: string }[] = []

        if (researchPosts.length > 0) {
            tabs.push({
                id: 'posts',
                label: 'Research',
                icon: FileText,
                count: researchPosts.length,
                colorClass: 'bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-primary-light'
            })
        }
        if (eventPosts.length > 0) {
            tabs.push({
                id: 'events',
                label: 'Events',
                icon: Calendar,
                count: eventPosts.length,
                colorClass: 'bg-secondary/20 text-secondary-dark dark:text-secondary'
            })
        }
        if (groups.length > 0) {
            tabs.push({
                id: 'groups',
                label: 'Groups',
                icon: Users,
                count: groups.length,
                colorClass: 'bg-accent/20 text-accent-dark dark:text-accent'
            })
        }

        return tabs
    }, [researchPosts.length, eventPosts.length, groups.length])

    // Default to first available tab, or 'posts' if nothing available
    const [activeTab, setActiveTab] = useState<TabType>(availableTabs[0]?.id || 'posts')

    // If no content anywhere, show empty state
    if (availableTabs.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 dark:bg-dark-surface rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-text-light dark:text-dark-text-muted" />
                </div>
                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">{t('noActivity')}</h3>
                <p className="text-text-light dark:text-dark-text-muted">
                    {t('startActivity')}
                </p>
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Tabs - only show if more than one tab has content */}
            {availableTabs.length > 1 && (
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-dark-surface rounded-xl mb-8 max-w-xl overflow-x-auto">
                    {availableTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white dark:bg-dark-bg text-primary shadow-sm'
                                : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            <span className={`px-2 py-0.5 ${tab.colorClass} rounded-full text-xs font-semibold`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            <div className="min-h-[300px] w-full">
                {activeTab === 'posts' && researchPosts.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {researchPosts.map((post) => (
                            <MagazineCard key={post.id} post={post} variant="standard" />
                        ))}
                    </div>
                )}

                {activeTab === 'events' && eventPosts.length > 0 && (
                    <div className="grid gap-6">
                        {eventPosts.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}

                {activeTab === 'groups' && groups.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {groups.map((group) => (
                            <GroupCard key={group.id} group={group} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

