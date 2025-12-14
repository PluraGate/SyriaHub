'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Shield, ShieldCheck, Users, AlertTriangle, Loader2, Check, ArrowRight } from 'lucide-react'

interface User {
    id: string
    email: string
    name: string | null
    role: 'researcher' | 'moderator' | 'admin'
}

interface RolePromotionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User
    onSuccess: () => void
}

const roles = [
    {
        value: 'researcher',
        label: 'Researcher',
        description: 'Standard user with posting and commenting privileges',
        icon: Users,
    },
    {
        value: 'moderator',
        label: 'Moderator',
        description: 'Can manage reports, approve content, and moderate discussions',
        icon: Shield,
    },
    {
        value: 'admin',
        label: 'Admin',
        description: 'Full platform access including user management and system settings',
        icon: ShieldCheck,
    }
]

export function RolePromotionDialog({
    open,
    onOpenChange,
    user,
    onSuccess
}: RolePromotionDialogProps) {
    const [selectedRole, setSelectedRole] = useState(user.role)
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()

    // Reset state when dialog opens with new user
    useEffect(() => {
        if (open) {
            setSelectedRole(user.role)
            setReason('')
            setError(null)
        }
    }, [open, user.role])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (selectedRole === user.role) {
            onOpenChange(false)
            return
        }

        if (!reason.trim()) {
            setError('Please provide a reason for this role change')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { data, error: rpcError } = await supabase.rpc('promote_user_role', {
                target_user_id: user.id,
                new_role: selectedRole,
                change_reason: reason.trim()
            })

            if (rpcError) {
                setError(rpcError.message)
                return
            }

            if (!data.success) {
                setError(data.error || 'Failed to update role')
                return
            }

            showToast(`Successfully changed ${user.name || user.email}'s role to ${selectedRole}`, 'success')
            onSuccess()
            onOpenChange(false)
            setReason('')
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const currentRoleData = roles.find(r => r.value === user.role)
    const selectedRoleData = roles.find(r => r.value === selectedRole)
    const isPromotion = roles.findIndex(r => r.value === selectedRole) > roles.findIndex(r => r.value === user.role)
    const isDemotion = roles.findIndex(r => r.value === selectedRole) < roles.findIndex(r => r.value === user.role)
    const hasChange = selectedRole !== user.role

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg text-text dark:text-dark-text">
                        <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <Shield className="w-5 h-5 text-primary dark:text-primary-light" />
                        </div>
                        Change User Role
                    </DialogTitle>
                    <DialogDescription className="text-base text-text-light dark:text-dark-text-muted">
                        Update the role for <span className="font-semibold text-text dark:text-dark-text">{user.name || 'Anonymous User'}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    {/* Role Change Preview */}
                    {hasChange && currentRoleData && selectedRoleData && (
                        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-border/50 border border-gray-200 dark:border-dark-border">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gray-200 dark:bg-dark-border">
                                    <currentRoleData.icon className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                                </div>
                                <span className="font-medium text-text dark:text-dark-text">{currentRoleData.label}</span>
                            </div>
                            <ArrowRight className={`w-5 h-5 ${isPromotion ? 'text-green-500' : 'text-accent'}`} />
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                                    <selectedRoleData.icon className="w-4 h-4 text-primary dark:text-primary-light" />
                                </div>
                                <span className="font-medium text-text dark:text-dark-text">{selectedRoleData.label}</span>
                            </div>
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-text dark:text-dark-text">Select New Role</Label>
                        <div className="space-y-2">
                            {roles.map((role) => {
                                const Icon = role.icon
                                const isSelected = selectedRole === role.value
                                const isCurrent = user.role === role.value

                                return (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => !isCurrent && setSelectedRole(role.value as typeof user.role)}
                                        className={`
                                            w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                                            ${isSelected
                                                ? 'border-primary dark:border-primary-light bg-primary/5 dark:bg-primary/10'
                                                : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-gray-300 dark:hover:border-gray-600'
                                            }
                                            ${isCurrent ? 'cursor-default' : 'cursor-pointer'}
                                        `}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2.5 rounded-xl transition-all ${isSelected
                                                    ? 'bg-primary/10 dark:bg-primary/20'
                                                    : 'bg-gray-100 dark:bg-dark-border'
                                                }`}>
                                                <Icon className={`w-5 h-5 ${isSelected
                                                        ? 'text-primary dark:text-primary-light'
                                                        : 'text-text-light dark:text-dark-text-muted'
                                                    }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-text dark:text-dark-text">
                                                        {role.label}
                                                    </span>
                                                    {isCurrent && (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light font-medium">
                                                            <Check className="w-3 h-3" />
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-text-light dark:text-dark-text-muted">
                                                    {role.description}
                                                </p>
                                            </div>
                                            {isSelected && !isCurrent && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary dark:bg-primary-light">
                                                        <Check className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Warning for Admin Promotion */}
                    {selectedRole === 'admin' && user.role !== 'admin' && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/40">
                            <div className="p-1.5 rounded-lg bg-accent/20 dark:bg-accent/30">
                                <AlertTriangle className="w-4 h-4 text-accent dark:text-accent-light" />
                            </div>
                            <div>
                                <p className="font-semibold text-accent dark:text-accent-light text-sm">Admin privileges are significant</p>
                                <p className="mt-1 text-sm text-text-light dark:text-dark-text-muted">
                                    Admins can manage all users, content, and system settings. This action will be logged.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Demotion Warning */}
                    {isDemotion && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/40">
                            <div className="p-1.5 rounded-lg bg-accent/20 dark:bg-accent/30">
                                <AlertTriangle className="w-4 h-4 text-accent dark:text-accent-light" />
                            </div>
                            <div>
                                <p className="font-semibold text-accent dark:text-accent-light text-sm">This is a demotion</p>
                                <p className="mt-1 text-sm text-text-light dark:text-dark-text-muted">
                                    The user will lose their current privileges. Make sure this is intentional.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Reason Input */}
                    {hasChange && (
                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-sm font-semibold text-text dark:text-dark-text">
                                Reason for Change <span className="text-accent">*</span>
                            </Label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value)
                                    setError(null)
                                }}
                                placeholder="Explain why this role change is being made..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light dark:placeholder:text-dark-text-muted resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                            <p className="text-xs text-text-light dark:text-dark-text-muted flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                This reason will be recorded in the audit log
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 rounded-xl bg-accent/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/40">
                            <p className="text-sm text-accent dark:text-accent-light font-medium">{error}</p>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !hasChange}
                            className="flex-1 sm:flex-none"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {!hasChange
                                ? 'No Change'
                                : isPromotion
                                    ? 'Promote User'
                                    : isDemotion
                                        ? 'Demote User'
                                        : 'Update Role'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
