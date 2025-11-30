'use client'

import { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { History, X, ChevronLeft, ChevronRight, User as UserIcon, FileDiff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PostVersion } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PlagiarismCheckButton } from './PlagiarismCheckButton'
import { diffWords } from 'diff'

interface PostHistoryDialogProps {
    postId: string
    isOpen: boolean
    onClose: () => void
}

export function PostHistoryDialog({ postId, isOpen, onClose }: PostHistoryDialogProps) {
    const supabase = useMemo(() => createClient(), [])
    const [versions, setVersions] = useState<PostVersion[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedVersion, setSelectedVersion] = useState<PostVersion | null>(null)
    const [showDiff, setShowDiff] = useState(false)

    useEffect(() => {
        async function loadVersions() {
            setLoading(true)
            const { data, error } = await supabase
                .from('post_versions')
                .select('*')
                .eq('post_id', postId)
                .order('version_number', { ascending: false })

            if (error) {
                console.error('Error loading versions:', error)
            } else {
                setVersions(data || [])
                if (data && data.length > 0) {
                    setSelectedVersion(data[0])
                }
            }
            setLoading(false)
        }

        if (isOpen && postId) {
            loadVersions()
        }
    }, [isOpen, postId, supabase])

    const renderDiff = () => {
        if (!selectedVersion) return null

        // Find previous version (the one with the next index since we sort desc)
        const currentIndex = versions.findIndex(v => v.id === selectedVersion.id)
        const prevVersion = versions[currentIndex + 1]

        if (!prevVersion) {
            return (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg mb-4">
                    This is the first version. No previous content to compare.
                </div>
            )
        }

        const diff = diffWords(prevVersion.content, selectedVersion.content)

        return (
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                {diff.map((part, index) => {
                    const color = part.added ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200' :
                        part.removed ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 line-through' : ''
                    return (
                        <span key={index} className={color}>
                            {part.value}
                        </span>
                    )
                })}
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 bg-white dark:bg-dark-surface">
                <DialogHeader className="p-6 border-b border-gray-100 dark:border-dark-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <History className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-display font-bold text-text dark:text-dark-text">
                                    Version History
                                </DialogTitle>
                                <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                                    View previous versions of this post
                                </p>
                            </div>
                        </div>
                        {selectedVersion && (
                            <Button
                                variant={showDiff ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowDiff(!showDiff)}
                                className="gap-2"
                            >
                                <FileDiff className="w-4 h-4" />
                                {showDiff ? 'Hide Changes' : 'Show Changes'}
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden min-h-[500px]">
                    {/* Sidebar - Version List */}
                    <div className="w-1/3 border-r border-gray-100 dark:border-dark-border overflow-y-auto bg-gray-50/50 dark:bg-dark-bg/50">
                        {loading ? (
                            <div className="p-8 text-center text-text-light dark:text-dark-text-muted">
                                Loading history...
                            </div>
                        ) : versions.length === 0 ? (
                            <div className="p-8 text-center text-text-light dark:text-dark-text-muted">
                                No history available
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-dark-border">
                                {versions.map((version) => (
                                    <button
                                        key={version.id}
                                        onClick={() => {
                                            setSelectedVersion(version)
                                            setShowDiff(false) // Reset diff view on switch
                                        }}
                                        className={`w-full text-left p-4 transition-colors hover:bg-gray-100 dark:hover:bg-dark-surface ${selectedVersion?.id === version.id
                                            ? 'bg-white dark:bg-dark-surface shadow-sm border-l-4 border-primary'
                                            : 'border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold text-text dark:text-dark-text">
                                                Version {version.version_number}
                                            </span>
                                            <span className="text-xs text-text-light dark:text-dark-text-muted">
                                                {format(new Date(version.created_at), 'MMM d, yyyy HH:mm')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
                                            <UserIcon className="w-3 h-3" />
                                            <span>Editor ID: {version.editor_id?.slice(0, 8)}...</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Main Content - Version Preview */}
                    <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-dark-surface">
                        {selectedVersion ? (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-2">
                                        {selectedVersion.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedVersion.tags?.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-bg text-xs font-medium text-text-light dark:text-dark-text-muted"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        <PlagiarismCheckButton postVersionId={selectedVersion.id} />
                                    </div>
                                </div>

                                {showDiff ? renderDiff() : (
                                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                        {selectedVersion.content}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-light dark:text-dark-text-muted">
                                Select a version to view details
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
