'use client'

import { useState } from 'react'
import { MagazineCard } from '@/components/MagazineCard'
import { GroupCard } from '@/components/GroupCard'
import { FileText, Users, BookOpen } from 'lucide-react'

interface UserActivityFeedProps {
    posts: any[]
    groups: any[]
}

export function UserActivityFeed({ posts, groups }: UserActivityFeedProps) {
    const [activeTab, setActiveTab] = useState<'posts' | 'groups'>('posts')

    return (
        <div>
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-dark-surface rounded-xl mb-8 max-w-md">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-lg transition-all ${activeTab === 'posts'
                        ? 'bg-white dark:bg-dark-bg text-primary shadow-sm'
                        : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Research
                    <span className="px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-primary-light rounded-full text-xs font-semibold">
                        {posts.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('groups')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-lg transition-all ${activeTab === 'groups'
                        ? 'bg-white dark:bg-dark-bg text-primary shadow-sm'
                        : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Groups
                    <span className="px-2 py-0.5 bg-secondary/20 text-secondary-dark dark:text-secondary rounded-full text-xs font-semibold">
                        {groups.length}
                    </span>
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[300px]">
                {activeTab === 'posts' && (
                    <div>
                        {posts.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {posts.map((post) => (
                                    <MagazineCard key={post.id} post={post} variant="standard" />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-50 dark:bg-dark-surface rounded-2xl">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-text-light dark:text-dark-text-muted" />
                                </div>
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">No publications yet</h3>
                                <p className="text-text-light dark:text-dark-text-muted">
                                    Research posts will appear here
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'groups' && (
                    <div>
                        {groups.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {groups.map((group) => (
                                    <GroupCard key={group.id} group={group} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-50 dark:bg-dark-surface rounded-2xl">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center">
                                    <Users className="w-8 h-8 text-text-light dark:text-dark-text-muted" />
                                </div>
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">No groups joined</h3>
                                <p className="text-text-light dark:text-dark-text-muted">
                                    Public group memberships will appear here
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

