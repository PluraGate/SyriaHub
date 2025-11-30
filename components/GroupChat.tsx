'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Message = {
    id: string
    content: string
    user_id: string
    created_at: string
    user?: {
        name: string
        avatar_url: string | null
    }
}

export function GroupChat({ groupId, currentUserId }: { groupId: string, currentUserId: string }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('group_messages')
                .select(`
          *,
          user:users(name, avatar_url)
        `)
                .eq('group_id', groupId)
                .order('created_at', { ascending: true })
                .limit(50)

            if (error) {
                console.error('Error fetching messages:', error)
            } else {
                setMessages(data || [])
            }
            setIsLoading(false)
        }

        fetchMessages()

        const channel = supabase
            .channel(`group_chat:${groupId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'group_messages',
                    filter: `group_id=eq.${groupId}`
                },
                async (payload) => {
                    const newMsg = payload.new as Message

                    // Fetch user details for the new message
                    const { data: userData } = await supabase
                        .from('users')
                        .select('name, avatar_url')
                        .eq('id', newMsg.user_id)
                        .single()

                    setMessages(prev => [...prev, { ...newMsg, user: userData || undefined }])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [groupId, supabase])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const content = newMessage.trim()
        setNewMessage('')

        const { error } = await supabase
            .from('group_messages')
            .insert({
                group_id: groupId,
                user_id: currentUserId,
                content
            })

        if (error) {
            console.error('Error sending message:', error)
            showToast('Failed to send message', 'error')
            setNewMessage(content) // Restore message
        }
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-xl bg-white dark:bg-dark-surface dark:border-dark-border shadow-sm">
            <div className="p-4 border-b dark:border-dark-border">
                <h3 className="font-semibold text-lg">Group Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.user_id === currentUserId
                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div className="flex-shrink-0">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={msg.user?.avatar_url || ''} alt={msg.user?.name || 'User'} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                            {msg.user?.name?.[0]?.toUpperCase() || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div
                                    className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'
                                        }`}
                                >
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-xs font-medium text-text dark:text-dark-text">
                                            {msg.user?.name || 'Unknown'}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div
                                        className={`px-4 py-2 rounded-2xl text-sm ${isOwn
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-gray-100 dark:bg-dark-bg text-text dark:text-dark-text rounded-tl-none'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50 rounded-b-xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}
