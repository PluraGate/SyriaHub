'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { GitFork, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/ui/toast'

interface ForkButtonProps {
    postId: string
    postTitle: string
    postContent: string
    postTags: string[]
}

export function ForkButton({ postId, postTitle, postContent, postTags }: ForkButtonProps) {
    const [isForking, setIsForking] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()
    const t = useTranslations('Post')
    const tc = useTranslations('Common')

    const handleFork = async () => {
        setIsForking(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                showToast(t('loginRequired'), 'error')
                return
            }

            // Create a new post as a fork (Remix)
            const { data: newPost, error: forkError } = await supabase
                .from('posts')
                .insert({
                    title: t('remixOf', { title: postTitle }),
                    content: postContent,
                    tags: postTags,
                    content_type: 'article', // Assuming 'article' as a default or inherited from original
                    author_id: user.id,
                    forked_from_id: postId,
                    status: 'published'
                })
                .select()
                .single()

            if (forkError) throw forkError

            showToast(t('suggestionSuccess'), 'success')
            // Redirect to the new post
            router.push(`/editor?id=${newPost.id}`)
        } catch (error) {
            console.error('Error remixing post:', error)
            showToast(t('suggestionError'), 'error')
        } finally {
            setIsForking(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleFork}
            disabled={isForking}
            className="gap-2"
        >
            {isForking ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitFork className="h-4 w-4" />}
            {isForking ? t('remixing') : t('remix')}
        </Button>
    )
}
