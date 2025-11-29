'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, UserPlus, LogIn } from 'lucide-react'
import { InviteMemberDialog } from '@/components/InviteMemberDialog'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'

interface GroupActionsProps {
    groupId: string
    isMember: boolean
    isAdmin: boolean
    visibility: 'public' | 'private'
}

export function GroupActions({ groupId, isMember, isAdmin, visibility }: GroupActionsProps) {
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { showToast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    const handleJoin = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }

            const { error } = await supabase
                .from('group_members')
                .insert({
                    group_id: groupId,
                    user_id: user.id,
                    role: 'member'
                })

            if (error) throw error

            showToast('Joined group successfully', 'success')
            router.refresh()
        } catch (error: any) {
            console.error('Error joining group:', error)
            // If already a member (duplicate key), just refresh
            if (error.code === '23505' || error.message?.includes('duplicate key')) {
                showToast('You are already a member of this group', 'info')
                router.refresh()
            } else {
                showToast(error.message || 'Failed to join group', 'error')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-3">
            {!isMember && (
                <button
                    onClick={handleJoin}
                    disabled={loading}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <LogIn className="w-4 h-4" />
                    {loading ? 'Joining...' : 'Join Group'}
                </button>
            )}

            {isMember && (
                <>
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setIsInviteOpen(true)}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Invite
                            </button>

                            <Link
                                href={`/groups/${groupId}/settings`}
                                className="btn btn-outline flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                        </>
                    )}
                </>
            )}

            <InviteMemberDialog
                groupId={groupId}
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
            />
        </div>
    )
}
