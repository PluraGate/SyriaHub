'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Loader2, Check, Tag as TagIcon } from 'lucide-react'
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

interface UnverifiedTag {
    tag: string
    usage_count: number
}

export default function AdminTagsPage() {
    const [unverifiedTags, setUnverifiedTags] = useState<UnverifiedTag[]>([])
    const [loading, setLoading] = useState(true)
    const [approvingTag, setApprovingTag] = useState<string | null>(null)
    const [newTagColor, setNewTagColor] = useState('#3B82F6') // Default blue
    const [dialogOpen, setDialogOpen] = useState(false)

    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        fetchUnverifiedTags()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchUnverifiedTags = async () => {
        setLoading(true)
        const { data, error } = await supabase.rpc('get_unverified_tags')

        if (error) {
            console.error('Error fetching tags:', error)
            console.error('Error details:', error.message, error.details, error.hint, error.code)
            // @ts-ignore
            console.log('Supabase URL:', supabase.supabaseUrl)
            showToast("Failed to fetch unverified tags.", "error")
        } else {
            setUnverifiedTags(data || [])
        }
        setLoading(false)
    }

    const handleApproveClick = (tag: string) => {
        setApprovingTag(tag)
        setNewTagColor('#3B82F6') // Reset to default
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

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar />

            <main className="flex-1 container-custom max-w-4xl py-8">
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
                                    <Button onClick={() => handleApproveClick(item.tag)}>
                                        Approve
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Tag: {approvingTag}</DialogTitle>
                        <DialogDescription>
                            Add this tag to the official list. You can assign a specific color for the Knowledge Graph.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="color" className="text-right">
                                Color
                            </Label>
                            <div className="col-span-3 flex gap-2">
                                <Input
                                    id="color"
                                    type="color"
                                    value={newTagColor}
                                    onChange={(e) => setNewTagColor(e.target.value)}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={newTagColor}
                                    onChange={(e) => setNewTagColor(e.target.value)}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmApproval}>Confirm Approval</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    )
}
