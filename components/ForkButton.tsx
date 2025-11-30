'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { GitFork } from 'lucide-react'
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
    const { showToast } = useToast()
    const supabase = createClient()

    const handleFork = async () => {
        setIsForking(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                showToast('Authentication required', 'error')
                return
            }

            // Create a new post as a fork (Remix)
            const { data, error } = await supabase
                .from('posts')
                .insert({
                    title: `Remix of ${postTitle}`,
                    content: postContent,
                    tags: postTags,
                    author_id: user.id,
                    forked_from_id: postId,
                    status: 'draft', // Start as draft
                    content_type: 'article' // Default to article, maybe inherit?
                })
                .select()
                .single()

            if (error) throw error

            showToast('Post remixed successfully', 'success')

            router.push(`/editor?id=${data.id}`)
        } catch (error) {
            console.error('Error remixing post:', error)
            showToast('Error remixing post', 'error')
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
            <GitFork className="h-4 w-4" />
            {isForking ? 'Remixing...' : 'Remix'}
        </Button>
    )
}
