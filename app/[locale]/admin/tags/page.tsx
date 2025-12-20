'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { AdminSidebar } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Loader2, Check, Tag as TagIcon, X, Palette } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Curated palette aligned with Syrian Identity design guidelines
// Professional, muted colors suitable for academic/research context
const TAG_COLORS = [
    '#1A3D40', // Deep Teal (Primary)
    '#4AA3A5', // Sage Teal (Secondary)
    '#C41E3A', // Heritage Red (Accent)
    '#475569', // Slate
    '#4d7c6f', // Muted Sage
    '#8b6f6f', // Dusty Rose
    '#4f5d75', // Cool Indigo
    '#8b7355', // Soft Brass
    '#3b5f54', // Deep Sage
    '#6b5454', // Warm Stone
    '#3d4a5c', // Twilight Blue
    '#57534e', // Warm Gray
    '#5c6b5e', // Forest Sage
    '#7a6e5d', // Olive Bronze
    '#596e79', // Steel Teal
    '#6b5b6b', // Mauve Gray
    '#4a5d6b', // Dusk Blue
    '#6b6b5b', // Moss
    '#5b4d4d', // Umber
]

interface UnverifiedTag {
    tag: string
    usage_count: number
}

export default function AdminTagsPage() {
    const [unverifiedTags, setUnverifiedTags] = useState<UnverifiedTag[]>([])
    const [loading, setLoading] = useState(true)
    const [approvingTag, setApprovingTag] = useState<string | null>(null)
    const [decliningTag, setDecliningTag] = useState<string | null>(null)
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
    const [declining, setDeclining] = useState(false)
    const [usedColors, setUsedColors] = useState<string[]>([])

    const supabase = createClient()
    const { showToast } = useToast()

    // Suggest next unused color from palette
    const suggestNextColor = useMemo(() => {
        const normalizedUsed = usedColors.map(c => c.toUpperCase())
        for (const color of TAG_COLORS) {
            if (!normalizedUsed.includes(color.toUpperCase())) {
                return color
            }
        }
        // All colors used, generate a random one
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    }, [usedColors])

    useEffect(() => {
        fetchUnverifiedTags()
        fetchUsedColors()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchUsedColors = async () => {
        const { data } = await supabase.from('tags').select('color')
        if (data) {
            setUsedColors(data.map(t => t.color).filter(Boolean))
        }
    }

    const fetchUnverifiedTags = async () => {
        setLoading(true)
        const { data, error } = await supabase.rpc('get_unverified_tags')

        if (error) {
            console.error('Error fetching tags:', error)
            console.error('Error details:', error.message, error.details, error.hint, error.code)
            showToast("Failed to fetch unverified tags.", "error")
        } else {
            setUnverifiedTags(data || [])
        }
        setLoading(false)
    }

    const handleApproveClick = (tag: string) => {
        setApprovingTag(tag)
        setNewTagColor(suggestNextColor) // Suggest next unused color
        setDialogOpen(true)
    }

    const confirmApproval = async () => {
        if (!approvingTag) return

        try {
            const { error } = await supabase
                .from('tags')
                .insert({ label: approvingTag, color: newTagColor })

            if (error) throw error

            showToast(`Tag "${approvingTag}" approved successfully.`, "success")

            setDialogOpen(false)
            fetchUnverifiedTags() // Refresh list
        } catch (error) {
            console.error('Error approving tag:', error)
            showToast("Failed to approve tag.", "error")
        }
    }

    const handleDeclineClick = (tag: string) => {
        setDecliningTag(tag)
        setDeclineDialogOpen(true)
    }

    const confirmDecline = async () => {
        if (!decliningTag) return

        setDeclining(true)
        try {
            // Get all posts that use this tag
            const { data: posts, error: fetchError } = await supabase
                .from('posts')
                .select('id, tags')
                .contains('tags', [decliningTag])

            if (fetchError) throw fetchError

            // Remove the tag from each post
            for (const post of posts || []) {
                const newTags = (post.tags as string[]).filter(t => t !== decliningTag)
                await supabase
                    .from('posts')
                    .update({ tags: newTags })
                    .eq('id', post.id)
            }

            showToast(`Tag "${decliningTag}" has been declined and removed from ${posts?.length || 0} post(s).`, "success")
            setDeclineDialogOpen(false)
            fetchUnverifiedTags() // Refresh list
        } catch (error) {
            console.error('Error declining tag:', error)
            showToast("Failed to decline tag.", "error")
        } finally {
            setDeclining(false)
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar />

            <div className="flex">
                <AdminSidebar className="sticky top-0 h-[calc(100vh-64px)]" />

                <main className="flex-1 p-6 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text">
                                    Tag Verification
                                </h1>
                                <p className="text-text-light dark:text-dark-text-muted mt-2">
                                    Review and approve user-generated tags to make them official.
                                </p>
                            </div>
                            <div className="bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light px-4 py-2 rounded-lg font-medium">
                                {unverifiedTags.length} Pending
                            </div>
                        </div>

                        <div className="card overflow-hidden">
                            {loading ? (
                                <div className="p-12 flex justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : unverifiedTags.length === 0 ? (
                                <div className="p-12 text-center text-text-light dark:text-dark-text-muted">
                                    <Check className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>All tags verified! No pending tags found.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-dark-border">
                                    {unverifiedTags.map((item) => (
                                        <div key={item.tag} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-gray-100 dark:bg-dark-border p-2 rounded-lg">
                                                    <TagIcon className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-text dark:text-dark-text">{item.tag}</h3>
                                                    <p className="text-sm text-text-light dark:text-dark-text-muted">
                                                        Used in {item.usage_count} post{item.usage_count !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeclineClick(item.tag)}
                                                    className="text-text-light dark:text-dark-text-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Decline
                                                </Button>
                                                <Button size="sm" onClick={() => handleApproveClick(item.tag)}>
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Approve
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Tag: {approvingTag}</DialogTitle>
                        <DialogDescription>
                            Add this tag to the official list. You can assign a specific color for the Knowledge Graph.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="color" className="text-text dark:text-dark-text font-medium">
                                Tag Color
                            </Label>
                            <div className="flex items-center gap-3">
                                <label
                                    className="w-10 h-10 rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden cursor-pointer relative group flex-shrink-0"
                                    style={{ backgroundColor: newTagColor }}
                                >
                                    <input
                                        id="color"
                                        type="color"
                                        value={newTagColor}
                                        onChange={(e) => setNewTagColor(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                </label>
                                <Input
                                    type="text"
                                    value={newTagColor}
                                    onChange={(e) => setNewTagColor(e.target.value)}
                                    className="flex-1 font-mono text-sm bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-text dark:text-dark-text"
                                    placeholder="#3B82F6"
                                />
                                <div
                                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                                    style={{ backgroundColor: newTagColor, color: '#fff' }}
                                >
                                    {approvingTag}
                                </div>
                            </div>
                        </div>

                        {/* Quick Color Palette */}
                        <div className="space-y-2">
                            <Label className="text-text dark:text-dark-text font-medium flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Quick Select
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {TAG_COLORS.map((color) => {
                                    const isUsed = usedColors.some(c => c.toUpperCase() === color.toUpperCase())
                                    const isSelected = newTagColor.toUpperCase() === color.toUpperCase()
                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewTagColor(color)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all relative ${isSelected
                                                ? 'border-primary ring-2 ring-primary/30 scale-110'
                                                : isUsed
                                                    ? 'border-gray-300 dark:border-gray-600 opacity-40'
                                                    : 'border-transparent hover:scale-110 hover:border-gray-300'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={isUsed ? `${color} (already used)` : color}
                                        >
                                            {isUsed && !isSelected && (
                                                <X className="w-4 h-4 text-white absolute inset-0 m-auto opacity-70" />
                                            )}
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="text-xs text-text-light dark:text-dark-text-muted">
                                Grayed colors are already used. Click any color to select.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmApproval}>Confirm Approval</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline Tag Dialog */}
            <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">Decline Tag: {decliningTag}</DialogTitle>
                        <DialogDescription>
                            This will remove the tag from all posts that currently use it. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                <strong>Warning:</strong> The tag &quot;{decliningTag}&quot; will be removed from all posts.
                                Users who added this tag will no longer see it on their content.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeclineDialogOpen(false)} disabled={declining}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDecline}
                            disabled={declining}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {declining ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                            Decline Tag
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
