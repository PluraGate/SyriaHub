'use client'

import { useState } from 'react'
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'

interface PlagiarismCheckButtonProps {
    postVersionId: string
}

export function PlagiarismCheckButton({ postVersionId }: PlagiarismCheckButtonProps) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const { showToast } = useToast()
    const supabase = createClient()

    // Load existing result on mount
    useState(() => {
        async function loadResult() {
            const { data } = await supabase
                .from('plagiarism_checks')
                .select('*')
                .eq('post_version_id', postVersionId)
                .single()

            if (data) setResult(data)
        }
        loadResult()
    })

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
        return (
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${isClean ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900'}`}>
                {isClean ? (
                    <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                    <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <div>
                    <p className={`text-sm font-medium ${isClean ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                        {isClean ? 'Content Verified' : 'Potential Issues Found'}
                    </p>
                    <p className="text-xs opacity-80">
                        Score: {result.score}% • Status: {result.status}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleCheck}
            disabled={loading}
            className="gap-2"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            Check Plagiarism
        </Button>
    )
}
