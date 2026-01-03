'use client'

import { useState } from 'react'
import { Download, Loader2, Check, Copy, FileJson, FileSpreadsheet, Upload, ChevronDown } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

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
    const t = useTranslations('ResearchLab')
    const [isExporting, setIsExporting] = useState(false)
    const [isSavingToResources, setIsSavingToResources] = useState(false)
    const [copied, setCopied] = useState(false)
    const [showExportMenu, setShowExportMenu] = useState(false)

    const getProcessedResponses = () => {
        return responses.map(response => {
            const processedAnswers: Record<string, unknown> = {}
            
            questions.forEach(q => {
                const answer = response.answers[q.id]
                let processedAnswer: unknown = answer

                if (Array.isArray(answer) && q.options) {
                    processedAnswer = answer.map(id => 
                        q.options?.find(o => o.id === id)?.text || id
                    )
                } else if (typeof answer === 'string' && q.options) {
                    processedAnswer = q.options.find(o => o.id === answer)?.text || answer
                }

                processedAnswers[q.question_text] = processedAnswer
            })

            return {
                responseId: response.id,
                submittedAt: response.completed_at,
                respondent: response.respondent?.name || response.respondent?.email || 'Anonymous',
                answers: processedAnswers
            }
        })
    }

    const getSurveyData = () => {
        return {
            survey: {
                id: surveyId,
                title: surveyTitle,
                totalResponses: responses.length,
                questions: questions.map(q => ({
                    id: q.id,
                    text: q.question_text,
                    type: q.question_type,
                    options: q.options?.map(o => o.text) || []
                }))
            },
            responses: getProcessedResponses(),
            exportedAt: new Date().toISOString()
        }
    }

    const handleExportCSV = async () => {
        if (responses.length === 0) {
            showToast('No responses to export', 'error')
            return
        }

        setIsExporting(true)
        setShowExportMenu(false)

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
                        if (q.options) {
                            answerText = answer
                                .map(id => q.options?.find(o => o.id === id)?.text || id)
                                .join('; ')
                        } else {
                            answerText = answer.join('; ')
                        }
                    } else if (typeof answer === 'string' && q.options) {
                        answerText = q.options.find(o => o.id === answer)?.text || String(answer)
                    } else {
                        answerText = String(answer)
                    }

                    if (answerText.includes(',') || answerText.includes('"') || answerText.includes('\n')) {
                        answerText = `"${answerText.replace(/"/g, '""')}"`
                    }

                    row.push(answerText)
                })

                return row
            })

            const csvContent = [
                headers.map(h => h.includes(',') ? `"${h}"` : h).join(','),
                ...rows.map(r => r.join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `${surveyTitle.replace(/[^a-z0-9]/gi, '_')}_responses.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            showToast(`Exported ${responses.length} responses to CSV`, 'success')
        } catch {
            showToast('Failed to export responses', 'error')
        } finally {
            setIsExporting(false)
        }
    }

    const handleExportJSON = async () => {
        if (responses.length === 0) {
            showToast('No responses to export', 'error')
            return
        }

        setIsExporting(true)
        setShowExportMenu(false)

        try {
            const data = getSurveyData()
            const jsonContent = JSON.stringify(data, null, 2)

            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `${surveyTitle.replace(/[^a-z0-9]/gi, '_')}_responses.json`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            showToast(`Exported ${responses.length} responses to JSON`, 'success')
        } catch {
            showToast('Failed to export responses', 'error')
        } finally {
            setIsExporting(false)
        }
    }

    const handleSaveToResources = async () => {
        if (responses.length === 0) {
            showToast('No responses to save', 'error')
            return
        }

        setIsSavingToResources(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                showToast('Please log in to save to resources', 'error')
                return
            }

            const data = getSurveyData()
            const jsonContent = JSON.stringify(data, null, 2)
            const fileName = `survey_${surveyTitle.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('resources')
                .upload(`${user.id}/${fileName}`, new Blob([jsonContent], { type: 'application/json' }), {
                    contentType: 'application/json',
                    upsert: false
                })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(`${user.id}/${fileName}`)

            // Create resource post
            const { error: postError } = await supabase
                .from('posts')
                .insert({
                    title: `Survey Results: ${surveyTitle}`,
                    content: `Dataset exported from survey "${surveyTitle}" with ${responses.length} responses.`,
                    tags: ['dataset', 'survey-results', 'research-data'],
                    content_type: 'resource',
                    author_id: user.id,
                    status: 'published',
                    metadata: {
                        url: publicUrl,
                        size: jsonContent.length,
                        mime_type: 'application/json',
                        original_name: fileName,
                        downloads: 0,
                        resource_type: 'dataset',
                        source_type: 'survey',
                        source_id: surveyId
                    }
                })

            if (postError) throw postError

            showToast(t('surveysPage.savedToResources') || 'Survey results saved to Resources!', 'success')
        } catch (error) {
            console.error('Error saving to resources:', error)
            showToast(t('surveysPage.saveToResourcesError') || 'Failed to save to resources', 'error')
        } finally {
            setIsSavingToResources(false)
        }
    }

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/research-lab/surveys/${surveyId}`
        await navigator.clipboard.writeText(url)
        setCopied(true)
        showToast('Survey link copied to clipboard', 'success')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <button
                onClick={handleCopyLink}
                className="btn btn-outline btn-sm flex items-center gap-2"
                title="Copy survey link"
            >
                {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                    <Copy className="w-4 h-4" />
                )}
                {t('surveysPage.copyLink') || 'Copy Link'}
            </button>
            
            {/* Export Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={isExporting || responses.length === 0}
                    className="btn btn-outline btn-sm flex items-center gap-2"
                >
                    {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {t('surveysPage.export') || 'Export'}
                    <ChevronDown className="w-3 h-3" />
                </button>
                
                {showExportMenu && (
                    <div className="absolute top-full mt-1 right-0 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-10 min-w-[140px]">
                        <button
                            onClick={handleExportCSV}
                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            CSV
                        </button>
                        <button
                            onClick={handleExportJSON}
                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                        >
                            <FileJson className="w-4 h-4" />
                            JSON
                        </button>
                    </div>
                )}
            </div>

            <button
                onClick={handleSaveToResources}
                disabled={isSavingToResources || responses.length === 0}
                className="btn btn-primary btn-sm flex items-center gap-2"
            >
                {isSavingToResources ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Upload className="w-4 h-4" />
                )}
                {t('surveysPage.saveToResources') || 'Save to Resources'}
            </button>
        </div>
    )
}
