'use client'

import { useState } from 'react'
import { Download, Loader2, Link as LinkIcon, Check, Copy } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface SurveyResultsActionsProps {
    surveyId: string
    surveyTitle: string
    questions: Array<{
        id: string
        question_text: string
        question_type: string
        options?: Array<{ id: string; text: string }>
    }>
    responses: Array<{
        id: string
        answers: Record<string, unknown>
        completed_at: string
        respondent?: { name?: string; email?: string } | null
    }>
}

export function SurveyResultsActions({
    surveyId,
    surveyTitle,
    questions,
    responses
}: SurveyResultsActionsProps) {
    const { showToast } = useToast()
    const [isExporting, setIsExporting] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleExportCSV = async () => {
        if (responses.length === 0) {
            showToast({
                type: 'error',
                title: 'No Data',
                message: 'No responses to export'
            })
            return
        }

        setIsExporting(true)

        try {
            // Build CSV headers
            const headers = ['Response ID', 'Submitted At', 'Respondent']
            questions.forEach(q => {
                headers.push(q.question_text)
            })

            // Build CSV rows
            const rows = responses.map(response => {
                const row: string[] = [
                    response.id,
                    new Date(response.completed_at).toLocaleString(),
                    response.respondent?.name || response.respondent?.email || 'Anonymous'
                ]

                questions.forEach(q => {
                    const answer = response.answers[q.id]
                    let answerText = ''

                    if (answer === undefined || answer === null) {
                        answerText = ''
                    } else if (Array.isArray(answer)) {
                        // Multiple choice - map IDs to text
                        if (q.options) {
                            answerText = answer
                                .map(id => q.options?.find(o => o.id === id)?.text || id)
                                .join('; ')
                        } else {
                            answerText = answer.join('; ')
                        }
                    } else if (typeof answer === 'string' && q.options) {
                        // Single choice - map ID to text
                        answerText = q.options.find(o => o.id === answer)?.text || String(answer)
                    } else {
                        answerText = String(answer)
                    }

                    // Escape CSV special characters
                    if (answerText.includes(',') || answerText.includes('"') || answerText.includes('\n')) {
                        answerText = `"${answerText.replace(/"/g, '""')}"`
                    }

                    row.push(answerText)
                })

                return row
            })

            // Generate CSV content
            const csvContent = [
                headers.map(h => h.includes(',') ? `"${h}"` : h).join(','),
                ...rows.map(r => r.join(','))
            ].join('\n')

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `${surveyTitle.replace(/[^a-z0-9]/gi, '_')}_responses.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            showToast({
                type: 'success',
                title: 'Export Complete',
                message: `Exported ${responses.length} responses to CSV`
            })
        } catch (error) {
            showToast({
                type: 'error',
                title: 'Export Failed',
                message: 'Failed to export responses'
            })
        } finally {
            setIsExporting(false)
        }
    }

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/research-lab/surveys/${surveyId}`
        await navigator.clipboard.writeText(url)
        setCopied(true)
        showToast({
            type: 'success',
            title: 'Link Copied',
            message: 'Survey link copied to clipboard'
        })
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleCopyLink}
                className="btn btn-outline flex items-center gap-2"
                title="Copy survey link"
            >
                {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                    <Copy className="w-4 h-4" />
                )}
                Copy Link
            </button>
            <button
                onClick={handleExportCSV}
                disabled={isExporting || responses.length === 0}
                className="btn btn-primary flex items-center gap-2"
            >
                {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Download className="w-4 h-4" />
                )}
                Export CSV
            </button>
        </div>
    )
}
