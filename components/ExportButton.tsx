'use client'

import { useState } from 'react'
import { Download, FileText, FileJson, Globe, ChevronDown, Check, Loader2, BookOpen, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'
import {
    generateCitation,
    downloadCitation,
    getCitationFileExtension,
    type CitationFormat,
    type CitationData
} from '@/lib/citations'

interface ExportButtonProps {
    postId: string
    postTitle: string
    postAuthor?: {
        name?: string
        email?: string
    }
    postCreatedAt?: string
    postTags?: string[]
    postContent?: string
}

type ExportFormat = 'markdown' | 'html' | 'json'

const documentFormats = {
    markdown: { label: 'Markdown (.md)', icon: FileText, ext: 'md' },
    html: { label: 'HTML (.html)', icon: Globe, ext: 'html' },
    json: { label: 'JSON (.json)', icon: FileJson, ext: 'json' },
}

const citationFormats: { format: CitationFormat; label: string }[] = [
    { format: 'bibtex', label: 'BibTeX (.bib)' },
    { format: 'ris', label: 'RIS (Zotero, EndNote)' },
    { format: 'apa', label: 'APA 7th Edition' },
    { format: 'mla', label: 'MLA 9th Edition' },
    { format: 'chicago', label: 'Chicago 17th Edition' },
]

export function ExportButton({
    postId,
    postTitle,
    postAuthor,
    postCreatedAt,
    postTags,
    postContent
}: ExportButtonProps) {
    const [exporting, setExporting] = useState(false)
    const [lastExported, setLastExported] = useState<string | null>(null)
    const { showToast } = useToast()

    const handleExport = async (format: ExportFormat) => {
        setExporting(true)
        try {
            const response = await fetch(`/api/export?id=${postId}&format=${format}`)

            if (!response.ok) {
                throw new Error('Export failed')
            }

            // Get the blob and create download
            const blob = await response.blob()
            const filename = `${postTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50)}.${documentFormats[format].ext}`

            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            setLastExported(format)
            showToast(`Exported as ${documentFormats[format].label}`, 'success')
        } catch (error) {
            console.error('Export error:', error)
            showToast('Failed to export post', 'error')
        } finally {
            setExporting(false)
        }
    }

    const handleCitationExport = (format: CitationFormat) => {
        try {
            const citationData: CitationData = {
                id: postId,
                title: postTitle,
                author: postAuthor || { name: 'Unknown Author' },
                created_at: postCreatedAt || new Date().toISOString(),
                tags: postTags,
                content: postContent,
                url: typeof window !== 'undefined'
                    ? `${window.location.origin}/post/${postId}`
                    : undefined,
            }

            // For text formats, copy to clipboard
            if (format === 'apa' || format === 'mla' || format === 'chicago') {
                const citation = generateCitation(citationData, format)
                navigator.clipboard.writeText(citation)
                showToast(`${format.toUpperCase()} citation copied to clipboard`, 'success')
            } else {
                // For BibTeX and RIS, download as file
                downloadCitation(citationData, format)
                showToast(`Downloaded ${format.toUpperCase()} file`, 'success')
            }

            setLastExported(format)
        } catch (error) {
            console.error('Citation export error:', error)
            showToast('Failed to generate citation', 'error')
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={exporting}>
                    {exporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    Export
                    <ChevronDown className="w-3 h-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {/* Document Formats */}
                <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5" />
                    Document Formats
                </DropdownMenuLabel>
                {(Object.entries(documentFormats) as [ExportFormat, typeof documentFormats.markdown][]).map(([format, config]) => {
                    const Icon = config.icon
                    return (
                        <DropdownMenuItem
                            key={format}
                            onClick={() => handleExport(format)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Icon className="w-4 h-4" />
                            {config.label}
                            {lastExported === format && (
                                <Check className="w-3 h-3 ml-auto text-green-500" />
                            )}
                        </DropdownMenuItem>
                    )
                })}

                <DropdownMenuSeparator />

                {/* Citation Formats */}
                <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Citation Formats
                </DropdownMenuLabel>
                {citationFormats.map(({ format, label }) => (
                    <DropdownMenuItem
                        key={format}
                        onClick={() => handleCitationExport(format)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <BookOpen className="w-4 h-4" />
                        {label}
                        {lastExported === format && (
                            <Check className="w-3 h-3 ml-auto text-green-500" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

