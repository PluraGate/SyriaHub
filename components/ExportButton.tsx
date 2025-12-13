'use client'

import { useState } from 'react'
import { Download, FileText, FileJson, Globe, ChevronDown, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

interface ExportButtonProps {
    postId: string
    postTitle: string
}

type ExportFormat = 'markdown' | 'html' | 'json'

const formatConfig = {
    markdown: { label: 'Markdown (.md)', icon: FileText, ext: 'md' },
    html: { label: 'HTML (.html)', icon: Globe, ext: 'html' },
    json: { label: 'JSON (.json)', icon: FileJson, ext: 'json' },
}

export function ExportButton({ postId, postTitle }: ExportButtonProps) {
    const [exporting, setExporting] = useState(false)
    const [lastExported, setLastExported] = useState<ExportFormat | null>(null)
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
            const filename = `${postTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50)}.${formatConfig[format].ext}`

            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            setLastExported(format)
            showToast(`Exported as ${formatConfig[format].label}`, 'success')
        } catch (error) {
            console.error('Export error:', error)
            showToast('Failed to export post', 'error')
        } finally {
            setExporting(false)
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
            <DropdownMenuContent align="end" className="w-48">
                {(Object.entries(formatConfig) as [ExportFormat, typeof formatConfig.markdown][]).map(([format, config]) => {
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
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
