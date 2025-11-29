'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Lock, Globe, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { useToast } from '@/components/ui/toast'

export default function CreateGroupPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        visibility: 'private' as 'private' | 'restricted' | 'public'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                showToast('You must be signed in to create a group', 'error')
                router.push('/auth/login')
                return
            }

            // Generate a slug from name
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7)

            // 1. Create Group
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert({
                    name: formData.name,
                    description: formData.description,
                    visibility: formData.visibility,
                    slug: slug,
                    created_by: user.id
                })
                .select()
                .single()

            if (groupError) {
                console.error('Group creation error:', groupError)
                throw new Error(`Failed to create group: ${groupError.message}`)
            }

            // 2. Add creator as owner
            // Note: If RLS is set up correctly, the creator might implicitly be an owner or have access,
            // but we explicitly add them to the members table.
            const { error: memberError } = await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                    role: 'owner'
                })

            if (memberError) {
                console.error('Member addition error:', memberError)
                // Rollback group creation if member add fails
                await supabase.from('groups').delete().eq('id', group.id)
                throw new Error(`Failed to add owner: ${memberError.message}`)
            }

            showToast('Group created successfully!', 'success')
            router.push(`/groups/${group.id}`)

        } catch (error: any) {
            console.error('Error creating group:', error)
            showToast(error.message || 'Failed to create group', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar />

            <div className="border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
                <div className="container-custom max-w-2xl py-4">
                    <Link
                        href="/groups"
                        className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Groups
                    </Link>
                </div>
            </div>

            <main className="container-custom max-w-2xl py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-2">
                        Create New Group
                    </h1>
                    <p className="text-text-light dark:text-dark-text-muted">
                        Start a new collaboration space for your research team or working group.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card p-8 space-y-8">
                    {/* Name */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-text dark:text-dark-text">
                            Group Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                            placeholder="e.g. Aleppo Water Infrastructure Reconstruction"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-text dark:text-dark-text">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                            placeholder="What is this group's mission?"
                        />
                    </div>

                    {/* Visibility */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-text dark:text-dark-text">
                            Visibility
                        </label>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <label className={`
                relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${formData.visibility === 'private'
                                    ? 'border-primary bg-primary/5 dark:border-accent dark:bg-accent/10'
                                    : 'border-gray-200 hover:border-primary/50 dark:border-dark-border dark:hover:border-accent/50'}
              `}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="private"
                                    checked={formData.visibility === 'private'}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                                    className="sr-only"
                                />
                                <Lock className={`w-6 h-6 ${formData.visibility === 'private' ? 'text-primary dark:text-accent' : 'text-gray-400'}`} />
                                <div className="text-center">
                                    <span className={`block font-semibold ${formData.visibility === 'private' ? 'text-primary dark:text-accent' : 'text-text dark:text-dark-text'}`}>Private</span>
                                    <span className="text-xs text-text-light dark:text-dark-text-muted mt-1">Invite only. Hidden from search.</span>
                                </div>
                            </label>

                            <label className={`
                relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${formData.visibility === 'restricted'
                                    ? 'border-primary bg-primary/5 dark:border-accent dark:bg-accent/10'
                                    : 'border-gray-200 hover:border-primary/50 dark:border-dark-border dark:hover:border-accent/50'}
              `}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="restricted"
                                    checked={formData.visibility === 'restricted'}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                                    className="sr-only"
                                />
                                <Users className={`w-6 h-6 ${formData.visibility === 'restricted' ? 'text-primary dark:text-accent' : 'text-gray-400'}`} />
                                <div className="text-center">
                                    <span className={`block font-semibold ${formData.visibility === 'restricted' ? 'text-primary dark:text-accent' : 'text-text dark:text-dark-text'}`}>Restricted</span>
                                    <span className="text-xs text-text-light dark:text-dark-text-muted mt-1">Visible in search. Request to join.</span>
                                </div>
                            </label>

                            <label className={`
                relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${formData.visibility === 'public'
                                    ? 'border-primary bg-primary/5 dark:border-accent dark:bg-accent/10'
                                    : 'border-gray-200 hover:border-primary/50 dark:border-dark-border dark:hover:border-accent/50'}
              `}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="public"
                                    checked={formData.visibility === 'public'}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                                    className="sr-only"
                                />
                                <Globe className={`w-6 h-6 ${formData.visibility === 'public' ? 'text-primary dark:text-accent' : 'text-gray-400'}`} />
                                <div className="text-center">
                                    <span className={`block font-semibold ${formData.visibility === 'public' ? 'text-primary dark:text-accent' : 'text-text dark:text-dark-text'}`}>Public</span>
                                    <span className="text-xs text-text-light dark:text-dark-text-muted mt-1">Visible to all. Anyone can join.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary min-w-[120px]"
                        >
                            {loading ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
