'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PenSquare, Clock, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface EditButtonProps {
    postId: string
    postCreatedAt: string
    isAuthor: boolean
}

const EDIT_WINDOW_HOURS = 24

export function EditButton({ postId, postCreatedAt, isAuthor }: EditButtonProps) {
    const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
    const [canEdit, setCanEdit] = useState(false)

    useEffect(() => {
        if (!isAuthor) {
            setCanEdit(false)
            return
        }

        function calculateTimeRemaining() {
            const createdAt = new Date(postCreatedAt)
            const editDeadline = new Date(createdAt.getTime() + EDIT_WINDOW_HOURS * 60 * 60 * 1000)
            const now = new Date()
            const diff = editDeadline.getTime() - now.getTime()

            if (diff <= 0) {
                setCanEdit(false)
                setTimeRemaining(null)
                return
            }

            setCanEdit(true)

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m remaining`)
            } else {
                setTimeRemaining(`${minutes}m remaining`)
            }
        }

        calculateTimeRemaining()
        const interval = setInterval(calculateTimeRemaining, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [postCreatedAt, isAuthor])

    if (!isAuthor) {
        return null
    }

    if (!canEdit) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" disabled className="gap-2 opacity-50 cursor-not-allowed">
                            <Lock className="w-4 h-4" />
                            Edit
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-center">
                        <p className="text-sm">
                            The 24-hour edit window has expired. Your post is now locked for transparency.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            You can still view the version history.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={`/editor?id=${postId}`}>
                        <Button className="gap-2">
                            <PenSquare className="w-4 h-4" />
                            Edit
                            {timeRemaining && (
                                <span className="flex items-center gap-1 text-xs opacity-80 ml-1">
                                    <Clock className="w-3 h-3" />
                                    {timeRemaining.split(' ')[0]}
                                </span>
                            )}
                        </Button>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <div className="text-center">
                        <p className="text-sm font-medium">{timeRemaining}</p>
                        <p className="text-xs text-muted-foreground">to edit this post</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
