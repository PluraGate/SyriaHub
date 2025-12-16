'use client'

import { useState } from 'react'
import { Quote, Check } from 'lucide-react'

interface CopyCitationButtonProps {
    citation: string
    className?: string
}

export function CopyCitationButton({ citation, className = '' }: CopyCitationButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(citation)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors ${copied
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                } ${className}`}
        >
            {copied ? (
                <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                </>
            ) : (
                <>
                    <Quote className="w-3.5 h-3.5" />
                    Copy Citation
                </>
            )}
        </button>
    )
}
