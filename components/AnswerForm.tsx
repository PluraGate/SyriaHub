'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from './ui/toast'
import { Save } from 'lucide-react'

interface AnswerFormProps {
    questionId: string
}

export function AnswerForm({ questionId }: AnswerFormProps) {
    const [content, setContent] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const { showToast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('You must be logged in to answer')

            const { error } = await supabase
                .from('posts')
                .insert({
                    content: content.trim(),
                    content_type: 'answer',
                    parent_id: questionId,
                    author_id: user.id,
                    status: 'published',
                    title: 'Answer' // Required by schema but not used for answers usually
                })

            if (error) throw error

            setContent('')
            showToast('Answer posted successfully', 'success')
            router.refresh()
        } catch (error: any) {
            console.error('Failed to post answer:', error)
            showToast(error.message || 'Failed to post answer', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your answer here..."
                className="w-full min-h-[150px] p-4 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y"
                required
            />
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {submitting ? 'Posting...' : 'Post Answer'}
                </button>
            </div>
        </form>
    )
}
