'use client'

import { useState } from 'react'
import { PostCard } from '@/components/PostCard'
import { GroupCard } from '@/components/GroupCard'
import { FileText, Users } from 'lucide-react'

interface UserActivityFeedProps {
    posts: any[]
    groups: any[]
}

export function UserActivityFeed({ posts, groups }: UserActivityFeedProps) {
    const [activeTab, setActiveTab] = useState<'posts' | 'groups'>('posts')

    return (
        <div>
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-gray-200 dark:border-dark-border mb-8">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative ${activeTab === 'posts'
                            ? 'text-primary dark:text-accent-light'
                            : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Research Posts
                    <span className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-dark-border rounded-full text-xs">
                        {posts.length}
                    </span>
                    {activeTab === 'posts' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-accent-light" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('groups')}
                    className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative ${activeTab === 'groups'
                            ? 'text-primary dark:text-accent-light'
                            : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Groups
                    <span className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-dark-border rounded-full text-xs">
                        {groups.length}
                    </span>
                    {activeTab === 'groups' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-accent-light" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[300px]">
                {activeTab === 'posts' && (
                    <div className="space-y-6">
                        {posts.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2">
                                {posts.map((post) => (
                                    <PostCard key={post.id} post={post} showAuthor={false} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-gray-200 dark:border-dark-border rounded-xl">
                                <p className="text-text-light dark:text-dark-text-muted">
                                    No posts published yet.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'groups' && (
                    <div className="space-y-6">
                        {groups.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2">
                                {groups.map((group) => (
                                    <GroupCard key={group.id} group={group} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-gray-200 dark:border-dark-border rounded-xl">
                                <p className="text-text-light dark:text-dark-text-muted">
                                    Not a member of any public groups.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
