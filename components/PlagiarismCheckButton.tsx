'use client'

import { useState, useEffect } from 'react'
import { ShieldAlert, ShieldCheck, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { InfoHint } from '@/components/ui/InfoHint'

interface PlagiarismCheckButtonProps {
    postVersionId: string
}

export function PlagiarismCheckButton({ postVersionId }: PlagiarismCheckButtonProps) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const { showToast } = useToast()
    const supabase = createClient()

    // Load existing result on mount
    useEffect(() => {
        async function loadResult() {
            const { data } = await supabase
                .from('plagiarism_checks')
                .select('*')
                .eq('post_version_id', postVersionId)
                .single()

            if (data) setResult(data)
        }
        loadResult()
    }, [postVersionId, supabase])

    const handleCheck = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/plagiarism/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postVersionId }),
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error || 'Check failed')

            setResult(data)
            showToast('Plagiarism check completed', 'success')
        } catch (error: any) {
            console.error('Plagiarism check error:', error)
            showToast(error.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    if (result) {
        const isClean = !result.flagged
        const score = result.score || 0

        return (
            <div className={`p-4 rounded-lg border ${isClean
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900'
                : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900'}`}
            >
                <div className="flex items-start gap-3">
                    {isClean ? (
                        <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold ${isClean
                                ? 'text-green-800 dark:text-green-300'
                                : 'text-amber-800 dark:text-amber-300'}`}
                            >
                                {isClean ? 'Original Content' : 'Review Recommended'}
                            </p>
                            <InfoHint
                                content="Plagiarism check compares your content against a database of sources to detect potential duplication. Lower scores indicate more original content."
                            />
                        </div>

                        <p className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                            <strong>{score}% similarity</strong> — {isClean
                                ? 'Content appears to be original'
                                : 'Some sections may need citation or rewording'}
                        </p>

                        {/* Demo mode notice */}
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-text-light dark:text-dark-text-muted opacity-75">
                            <Info className="w-3 h-3" />
                            <span>Demo mode: Using simulated detection</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleCheck}
                disabled={loading}
                className="gap-2"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                Check Originality
            </Button>
            <InfoHint
                content="Run a plagiarism check to see if this content matches existing sources. Currently in demo mode."
            />
        </div>
    )
}
