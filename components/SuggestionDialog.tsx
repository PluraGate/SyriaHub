'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { FileEdit, Loader2 } from 'lucide-react'

interface SuggestionDialogProps {
    postId: string
    currentContent: string
}

export function SuggestionDialog({ postId, currentContent }: SuggestionDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState(currentContent)
    const [reason, setReason] = useState('')

    const supabase = createClient()
    const { showToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                showToast('You must be logged in to suggest edits.', 'error')
                return
            }

            const { error } = await supabase
                .from('suggestions')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content: content,
                    reason: reason,
                    status: 'pending'
                })

            if (error) throw error

            showToast('Suggestion submitted successfully.', 'success')
            setOpen(false)
            setReason('')
        } catch (error) {
            console.error('Error submitting suggestion:', error)
            showToast('Failed to submit suggestion.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <FileEdit className="w-4 h-4" />
                    Suggest Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Suggest an Edit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="content">Proposed Content</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[200px] font-mono text-sm"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Change (Optional)</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Fixed typo, added clarification..."
                            className="resize-none"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Submit Suggestion
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
