'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, UserPlus, Shield, UserX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { useToast } from '@/components/ui/toast'
import { InviteMemberDialog } from '@/components/InviteMemberDialog'

interface GroupSettingsPageProps {
    params: Promise<{
        id: string
    }>
}

export default function GroupSettingsPage(props: GroupSettingsPageProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [group, setGroup] = useState<any>(null)
    const [members, setMembers] = useState<any[]>([])
    const [showInviteDialog, setShowInviteDialog] = useState(false)

    // Unwrap params
    const [groupId, setGroupId] = useState<string | null>(null)

    useEffect(() => {
        props.params.then(p => setGroupId(p.id))
    }, [props.params])

    useEffect(() => {
        if (!groupId) return

        async function fetchGroup() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }

            // Check permissions (must be owner or moderator)
            const { data: member } = await supabase
                .from('group_members')
                .select('role')
                .eq('group_id', groupId)
                .eq('user_id', user.id)
                .single()

            if (!member || (member.role !== 'owner' && member.role !== 'moderator')) {
                showToast('You do not have permission to edit this group', 'error')
                router.push(`/groups/${groupId}`)
                return
            }

            // Fetch group details
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('id', groupId)
                .single()

            if (groupError) {
                console.error('Error fetching group:', groupError)
                return
            }

            setGroup(groupData)

            // Fetch members
            const { data: membersData, error: membersError } = await supabase
                .from('group_members')
                .select(`
                    *,
                    profile:users(
                        id,
                        full_name,
                        avatar_url,
                        email
                    )
                `)
                .eq('group_id', groupId)
                .order('joined_at', { ascending: false })

            if (membersError) {
                console.error('Error fetching members:', membersError)
            } else {
                setMembers(membersData || [])
            }

            setLoading(false)
        }

        fetchGroup()
    }, [groupId, router, showToast, supabase])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { error } = await supabase
                .from('groups')
                .update({
                    name: group.name,
                    description: group.description,
                    visibility: group.visibility
                })
                .eq('id', groupId)

            if (error) throw error

            showToast('Group settings updated', 'success')
        } catch (error: any) {
            console.error('Error updating group:', error)
            showToast('Failed to update group', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return

        try {
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', groupId)
                .eq('user_id', memberId)

            if (error) throw error

            setMembers(members.filter(m => m.user_id !== memberId))
            showToast('Member removed', 'success')
        } catch (error: any) {
            console.error('Error removing member:', error)
            showToast('Failed to remove member', 'error')
        }
    }

    const handleDeleteGroup = async () => {
        if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return

        try {
            const { error } = await supabase
                .from('groups')
                .delete()
                .eq('id', groupId)

            if (error) throw error

            showToast('Group deleted', 'success')
            router.push('/groups')
        } catch (error: any) {
            console.error('Error deleting group:', error)
            showToast('Failed to delete group', 'error')
        }
    }

    if (loading || !groupId) {
        return (
            <div className="min-h-screen bg-background dark:bg-dark-bg">
                <Navbar />
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar />

            <div className="border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
                <div className="container-custom max-w-4xl py-4">
                    <Link
                        href={`/groups/${groupId}`}
                        className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Group
                    </Link>
                </div>
            </div>

            <main className="container-custom max-w-4xl py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text">
                        Group Settings
                    </h1>
                    <button
                        onClick={() => setShowInviteDialog(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invite Members
                    </button>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="card p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-6">
                                General Information
                            </h2>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Group Name
                                    </label>
                                    <input
                                        type="text"
                                        value={group.name}
                                        onChange={(e) => setGroup({ ...group, name: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={group.description || ''}
                                        onChange={(e) => setGroup({ ...group, description: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Visibility
                                    </label>
                                    <select
                                        value={group.visibility}
                                        onChange={(e) => setGroup({ ...group, visibility: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                                    >
                                        <option value="private">Private (Invite Only)</option>
                                        <option value="restricted">Restricted (Request to Join)</option>
                                        <option value="public">Public (Open to All)</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn btn-primary flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="card p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-6">
                                Members ({members.length})
                            </h2>

                            <div className="space-y-4">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-border last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                {member.profile?.full_name?.[0] || member.profile?.email?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-text dark:text-dark-text">
                                                    {member.profile?.full_name || 'Unknown User'}
                                                </p>
                                                <p className="text-sm text-text-light dark:text-dark-text-muted">
                                                    {member.role}
                                                </p>
                                            </div>
                                        </div>

                                        {member.role !== 'owner' && (
                                            <button
                                                onClick={() => handleRemoveMember(member.user_id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Remove Member"
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <div className="card p-6 border-red-100 dark:border-red-900/30">
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                                Danger Zone
                            </h3>
                            <p className="text-sm text-text-light dark:text-dark-text-muted mb-4">
                                Deleting a group is permanent and cannot be undone. All posts and member data will be lost.
                            </p>
                            <button
                                onClick={handleDeleteGroup}
                                className="btn w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Group
                            </button>
                        </div>
                    </aside>
                </div>

                <InviteMemberDialog
                    groupId={groupId}
                    isOpen={showInviteDialog}
                    onClose={() => setShowInviteDialog(false)}
                />
            </main>
        </div>
    )
}
