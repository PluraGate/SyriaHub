'use client'

import { useState } from 'react'
import { Flag, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface ReportButtonProps {
  contentId: string
  contentType: 'post' | 'comment'
  label?: string
  className?: string
}

export function ReportButton({
  contentId,
  contentType,
  label = 'Report',
  className = '',
}: ReportButtonProps) {
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    const trimmed = reason.trim()
    if (trimmed.length < 10) {
      showToast('Please provide at least 10 characters.', 'warning')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          reason: trimmed,
        }),
      })

      const payload = await response.json()

      if (!response.ok || !payload.success) {
        showToast(payload.error || 'Unable to submit report.', 'error')
        return
      }

      showToast('Report submitted. Thank you for keeping the hub safe.', 'success')
      setReason('')
      setOpen(false)
    } catch (error) {
      console.error('Report error:', error)
      showToast('Something went wrong while submitting the report.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-text-light hover:text-accent dark:text-dark-text-muted dark:hover:text-accent-light transition-colors ${className}`}
      >
        <Flag className="w-3.5 h-3.5" />
        {label}
      </button>
    )
  }

  return (
    <div className={`border border-gray-200 dark:border-dark-border rounded-lg p-3 bg-white dark:bg-dark-surface ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-text dark:text-dark-text">
          <Flag className="w-4 h-4 text-accent dark:text-accent-light" />
          Report {contentType}
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setReason('')
          }}
          className="text-text-light hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text transition-colors"
          aria-label="Close report form"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Describe the issue. This will be reviewed by moderators."
        className="w-full rounded-lg border border-gray-200 dark:border-dark-border bg-background-white dark:bg-dark-bg text-sm text-text dark:text-dark-text p-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
        rows={3}
        maxLength={1000}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-text-light dark:text-dark-text-muted">
          {reason.length}/1000
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Sending...' : 'Submit'}
        </button>
      </div>
    </div>
  )
}
