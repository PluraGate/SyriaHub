'use client'

import { MoreHorizontal, MessageSquareQuote, History, Flag } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { PostHistoryButton } from './PostHistoryButton'
import { ReportButton } from './ReportButton'

interface PostMoreOptionsProps {
    postId: string
    asButton?: boolean
}

export function PostMoreOptions({ postId, asButton }: PostMoreOptionsProps) {
    const t = useTranslations('Post')

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-text-light dark:text-dark-text-muted">
                    <MoreHorizontal className="w-5 h-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/editor?critique_of=${postId}`} className="flex items-center gap-2 cursor-pointer">
                        <MessageSquareQuote className="w-4 h-4" />
                        <span>{t('writeCritique')}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <PostHistoryButton postId={postId} asMenuItem />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <ReportButton postId={postId} asMenuItem />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
