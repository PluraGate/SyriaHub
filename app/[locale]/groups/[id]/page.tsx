import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Settings, Users, Lock, Globe, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { GroupActions } from '@/components/GroupActions'
import { GroupChat } from '@/components/GroupChat'

import { PostCard } from '@/components/PostCard'

interface GroupPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function GroupPage(props: GroupPageProps) {
    const params = await props.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch group details
    const { data: group, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', params.id)
        .single()

    if (error || !group) {
        notFound()
    }

    // Fetch members
    const { data: members } = await supabase
        .from('group_members')
        .select(`
      role,
      user:users(id, name, email, affiliation)
    `)
        .eq('group_id', group.id)

    // Fetch group posts
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            author:users!posts_author_id_fkey(id, name, email)
        `)
        .eq('group_id', group.id)
        .order('created_at', { ascending: false })

    // Check if current user is a member
    const membership = members?.find((m: any) => m.user.id === user?.id)
    const isMember = !!membership
    const isAdmin = membership?.role === 'owner' || membership?.role === 'moderator'

    // If private and not a member, show access denied (unless admin/moderator global role, but let's stick to group rules)
    // Actually, the RLS should handle this, but for UX we might want to show a specific "Request Access" page.
    // For now, if RLS fails, the data fetch above would return null/error if policy is correct.
    // Our policy: "Groups viewable by members or public". So if private and not member, `group` will be null.
    // So the `notFound()` above handles unauthorized access effectively for private groups.

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
                <div className="container-custom max-w-6xl py-8">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text">
                                    {group.name}
                                </h1>
                                {group.visibility === 'public' ? (
                                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> Public
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> {group.visibility}
                                    </span>
                                )}
                            </div>
                            <p className="text-text-light dark:text-dark-text-muted max-w-3xl text-lg">
                                {group.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <GroupActions
                                groupId={group.id}
                                isMember={isMember}
                                isAdmin={isAdmin}
                                visibility={group.visibility}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="container-custom max-w-6xl py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content (Posts) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-display font-semibold text-text dark:text-dark-text">
                                Group Discussions
                            </h2>
                            {isMember && (
                                <Link href={`/editor?groupId=${group.id}`} className="btn btn-sm btn-primary">
                                    <Plus className="w-4 h-4 mr-1" />
                                    New Post
                                </Link>
                            )}
                        </div>

                        {/* Group Posts */}
                        <div className="space-y-6">
                            {posts && posts.length > 0 ? (
                                posts.map((post: any) => (
                                    <PostCard key={post.id} post={post} />
                                ))
                            ) : (
                                <div className="card p-12 text-center border-dashed">
                                    <p className="text-text-light dark:text-dark-text-muted">
                                        No posts yet. Be the first to start a discussion!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar (Members) */}
                    <aside className="space-y-6">
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-display font-semibold text-lg text-primary dark:text-dark-text flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Members
                                </h3>
                                <span className="text-sm text-text-light dark:text-dark-text-muted">
                                    {members?.length || 0}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {members?.slice(0, 5).map((member: any) => (
                                    <div key={member.user.id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {(member.user.name?.[0] || member.user.email?.[0]).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text dark:text-dark-text truncate">
                                                {member.user.name || 'Anonymous'}
                                            </p>
                                            {member.role !== 'member' && (
                                                <p className="text-xs text-primary dark:text-accent-light capitalize">
                                                    {member.role}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {members && members.length > 5 && (
                                    <button className="text-sm text-primary hover:underline w-full text-center">
                                        View all members
                                    </button>
                                )}
                            </div>

                            {isAdmin && (
                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
                                    <Link
                                        href={`/groups/${group.id}/settings`}
                                        className="btn btn-outline w-full text-sm"
                                    >
                                        Manage Members
                                    </Link>
                                </div>
                            )}
                        </div>

                        {isMember && user && (
                            <GroupChat groupId={group.id} currentUserId={user.id} />
                        )}
                    </aside>
                </div>
            </main>
        </div>
    )
}
