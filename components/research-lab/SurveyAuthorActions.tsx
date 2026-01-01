'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, BarChart2, Share2 } from 'lucide-react'
import { ShareDialog } from './ShareDialog'

interface SurveyAuthorActionsProps {
    surveyId: string
    surveyTitle: string
    publicToken?: string | null
    allowPublicResponses?: boolean
}

export function SurveyAuthorActions({
    surveyId,
    surveyTitle,
    publicToken,
    allowPublicResponses = false
}: SurveyAuthorActionsProps) {
    const [showShareDialog, setShowShareDialog] = useState(false)

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowShareDialog(true)}
                    className="btn btn-ghost flex items-center gap-2"
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </button>
                <Link
                    href={`/research-lab/surveys/${surveyId}/edit`}
                    className="btn btn-outline flex items-center gap-2"
                >
                    <Edit className="w-4 h-4" />
                    Edit
                </Link>
                <Link
                    href={`/research-lab/surveys/${surveyId}/results`}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <BarChart2 className="w-4 h-4" />
                    Results
                </Link>
            </div>

            <ShareDialog
                isOpen={showShareDialog}
                onClose={() => setShowShareDialog(false)}
                type="survey"
                id={surveyId}
                title={surveyTitle}
                currentToken={publicToken}
                isPublic={allowPublicResponses}
            />
        </>
    )
}
