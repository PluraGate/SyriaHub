'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function AskQuestionPage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [tags, setTags] = useState('')
    const [loading, setLoading] = useState(false)

    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                showToast('Please sign in to ask a question.', 'error')
                router.push('/login')
                return
            }

            const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0)

            const { data, error } = await supabase
                .from('posts')
                .insert({
                    title,
                    content,
                    tags: tagsArray,
                    content_type: 'question',
                    author_id: user.id,
                    status: 'published'
                })
                .select()
                .single()

            if (error) throw error

            showToast('Your question has been successfully posted.', 'success')

            router.push(`/questions/${data.id}`)
        } catch (error) {
            console.error('Error posting question:', error)
            showToast('Failed to post question. Please try again.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar />

            <main className="flex-1 container-custom max-w-3xl py-12">
                <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-8">
                    Ask a Question
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-dark-surface p-8 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. How do I implement authentication in Next.js?"
                            required
                            className="text-lg"
                        />
                        <p className="text-xs text-text-light dark:text-dark-text-muted">
                            Be specific and imagine you&apos;re asking a question to another person.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Details</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Include all the information someone would need to answer your question..."
                            required
                            className="min-h-[200px] resize-y"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g. nextjs, react, typescript (comma separated)"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading} size="lg">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Post Question
                        </Button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    )
}
