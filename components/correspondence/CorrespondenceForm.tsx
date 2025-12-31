'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import type { CorrespondenceKind, SendCorrespondenceInput } from '@/types'

interface CorrespondenceFormProps {
    recipientId: string
    recipientName: string
    postId?: string
    postTitle?: string
    parentId?: string
    kind?: CorrespondenceKind
    onSuccess?: () => void
}

const SUBJECT_MIN = 10
const SUBJECT_MAX = 200
const BODY_MIN = 50
const BODY_MAX = 2000

export function CorrespondenceForm({
    recipientId,
    recipientName,
    postId,
    postTitle,
    parentId,
    kind = 'clarification_request',
    onSuccess
}: CorrespondenceFormProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const t = useTranslations('Correspondence')

    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isReply = !!parentId
    const subjectValid = subject.length >= SUBJECT_MIN && subject.length <= SUBJECT_MAX
    const bodyValid = body.length >= BODY_MIN && body.length <= BODY_MAX
    const canSubmit = subjectValid && bodyValid && !isSubmitting

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!canSubmit) return

        setIsSubmitting(true)

        try {
            const input: SendCorrespondenceInput = {
                kind: isReply ? 'response' : kind,
                recipient_id: recipientId,
                subject: subject.trim(),
                body: body.trim(),
                post_id: postId,
                parent_id: parentId
            }

            const response = await fetch('/api/correspondence/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            })

            const result = await response.json()

            if (!result.success) {
                showToast(result.error || 'Failed to send correspondence', 'error')
                return
            }

            showToast(t('deliveryNote'), 'success')

            if (onSuccess) {
                onSuccess()
            } else {
                router.push('/correspondence')
            }
        } catch (error) {
            console.error('Error sending correspondence:', error)
            showToast('Failed to send correspondence', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Context Display */}
            {postTitle && (
                <div className="flex items-start gap-3 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
                    <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-text dark:text-dark-text">
                            {t('regardingPost', { title: '' })}
                        </p>
                        <p className="text-sm text-text-light dark:text-dark-text-muted">
                            {postTitle}
                        </p>
                    </div>
                </div>
            )}

            {/* Recipient */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                    To
                </label>
                <p className="text-text-light dark:text-dark-text-muted">
                    {recipientName}
                </p>
            </div>

            {/* Subject */}
            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                    {t('subject')} *
                </label>
                <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t('subjectPlaceholder')}
                    maxLength={SUBJECT_MAX}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={isSubmitting}
                />
                <div className="flex justify-between mt-1.5 text-xs">
                    <span className={subject.length < SUBJECT_MIN ? 'text-amber-600 dark:text-amber-400' : 'text-text-light dark:text-dark-text-muted'}>
                        {subject.length < SUBJECT_MIN && t('minCharacters', { count: SUBJECT_MIN })}
                    </span>
                    <span className={subject.length > SUBJECT_MAX ? 'text-red-500' : 'text-text-light dark:text-dark-text-muted'}>
                        {t('charactersRemaining', { count: SUBJECT_MAX - subject.length })}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div>
                <label htmlFor="body" className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                    {t('body')} *
                </label>
                <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={t('bodyPlaceholder')}
                    maxLength={BODY_MAX}
                    rows={8}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    disabled={isSubmitting}
                />
                <div className="flex justify-between mt-1.5 text-xs">
                    <span className={body.length < BODY_MIN ? 'text-amber-600 dark:text-amber-400' : 'text-text-light dark:text-dark-text-muted'}>
                        {body.length < BODY_MIN && t('minCharacters', { count: BODY_MIN })}
                    </span>
                    <span className={body.length > BODY_MAX ? 'text-red-500' : 'text-text-light dark:text-dark-text-muted'}>
                        {t('charactersRemaining', { count: BODY_MAX - body.length })}
                    </span>
                </div>
            </div>

            {/* Anti-chat notice */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium">{t('maxOneReply')}</p>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">{t('noAttachments')}</p>
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            {isReply ? t('reply') : t('send')}
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
