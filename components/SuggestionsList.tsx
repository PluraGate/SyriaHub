'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Check, X, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Suggestion {
    id: string
    user_id: string
    content: string
    reason: string
    status: 'pending' | 'accepted' | 'rejected'
    created_at: string
    user: {
        name: string
        email: string
    }
}

interface SuggestionsListProps {
    postId: string
}

export function SuggestionsList({ postId }: SuggestionsListProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const { data, error } = await supabase
                    .from('suggestions')
                    .select(`
              *,
              user:users(name, email)
            `)
                    .eq('post_id', postId)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })

                if (error) throw error
                setSuggestions(data || [])
            } catch (error) {
                console.error('Error fetching suggestions:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSuggestions()
    }, [postId, supabase])

    const handleAccept = async (suggestion: Suggestion) => {
        setProcessingId(suggestion.id)
        try {
            // 1. Update the post content
            const { error: updatePostError } = await supabase
                .from('posts')
                .update({ content: suggestion.content })
                .eq('id', postId)

            if (updatePostError) throw updatePostError

            // 2. Mark suggestion as accepted
            const { error: updateSuggestionError } = await supabase
                .from('suggestions')
                .update({ status: 'accepted' })
                .eq('id', suggestion.id)

            if (updateSuggestionError) throw updateSuggestionError

            showToast('Suggestion accepted and post updated.', 'success')
            setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
        } catch (error) {
            console.error('Error accepting suggestion:', error)
            showToast('Failed to accept suggestion.', 'error')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (suggestionId: string) => {
        setProcessingId(suggestionId)
        try {
            const { error } = await supabase
                .from('suggestions')
                .update({ status: 'rejected' })
                .eq('id', suggestionId)

            if (error) throw error

            showToast('Suggestion rejected.', 'info')
            setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
        } catch (error) {
            console.error('Error rejecting suggestion:', error)
            showToast('Failed to reject suggestion.', 'error')
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    if (suggestions.length === 0) {
        return (
            <div className="text-center p-8 text-text-light dark:text-dark-text-muted border border-dashed rounded-lg">
                No pending suggestions.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="card p-6 border border-gray-200 dark:border-dark-border">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-semibold text-primary dark:text-dark-text">
                                {suggestion.user?.name || 'Anonymous'}
                            </h4>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                Suggested {formatDistanceToNow(new Date(suggestion.created_at))} ago
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleReject(suggestion.id)}
                                disabled={!!processingId}
                            >
                                {processingId === suggestion.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
                                Reject
                            </Button>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAccept(suggestion)}
                                disabled={!!processingId}
                            >
                                {processingId === suggestion.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                Accept
                            </Button>
                        </div>
                    </div>

                    {suggestion.reason && (
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-surface rounded text-sm text-text dark:text-dark-text-muted italic">
                            &quot; {suggestion.reason} &quot;
                        </div>
                    )}

                    <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-dark-surface p-4 rounded border border-gray-100 dark:border-dark-border text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {suggestion.content}
                    </div>
                </div>
            ))}
        </div>
    )
}
