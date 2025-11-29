'use client'

import { useState } from 'react'
import { X, Mail, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'

interface InviteMemberDialogProps {
    groupId: string
    isOpen: boolean
    onClose: () => void
}

export function InviteMemberDialog({ groupId, isOpen, onClose }: InviteMemberDialogProps) {
    const { showToast } = useToast()
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            if (!email || !email.includes('@')) {
                throw new Error('Please enter a valid email address')
            }

            // Generate a random token
            const token = crypto.randomUUID()

            const { error } = await supabase
                .from('group_invitations')
                .insert({
                    group_id: groupId,
                    inviter_id: user.id,
                    invitee_email: email,
                    token: token,
                    status: 'pending'
                })

            if (error) {
                if (error.code === '23505') { // Unique violation
                    throw new Error('This user has already been invited')
                }
                throw error
            }

            showToast(`Invitation sent to ${email}`, 'success')
            setEmail('')
            onClose()

        } catch (error: any) {
            console.error('Error sending invite:', error)
            showToast(error.message || 'Failed to send invitation', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-border">
                    <h3 className="font-semibold text-lg text-text dark:text-dark-text">
                        Invite Member
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleInvite} className="p-6">
                    <p className="text-sm text-text-light dark:text-dark-text-muted mb-6">
                        Enter the email address of the person you want to invite to this group.
                    </p>

                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-text-light hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                {loading ? (
                                    'Sending...'
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Invite
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
