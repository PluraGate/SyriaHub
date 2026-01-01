'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/ui/toast'
import { PenSquare, Loader2 } from 'lucide-react'

interface SuggestionDialogProps {
    postId: string
    originalContent: string
}

export function SuggestionDialog({ postId, originalContent }: SuggestionDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState(originalContent)
    const [reason, setReason] = useState('')

    const supabase = createClient()
    const { showToast } = useToast()
    const t = useTranslations('Post')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                showToast(t('loginRequired'), 'error')
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

            showToast(t('suggestionSuccess'), 'success')
            setOpen(false)
            setReason('')
        } catch (error) {
            console.error('Error submitting suggestion:', error)
            showToast(t('suggestionError'), 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <PenSquare className="w-4 h-4" />
                    {t('suggestEdit')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{t('suggestEditTitle')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="content">{t('proposedContent')}</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[200px] font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">{t('reasonForChange')}</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t('reasonPlaceholder')}
                            className="resize-none"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('submitSuggestion')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
