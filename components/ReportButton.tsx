'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/ui/toast'
import { Flag, Loader2 } from 'lucide-react'

interface ReportButtonProps {
  postId?: string
  commentId?: string
  className?: string
  asMenuItem?: boolean
}

export function ReportButton({ postId, commentId, className, asMenuItem }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('spam')
  const [details, setDetails] = useState('')

  const supabase = createClient()
  const { showToast } = useToast()
  const t = useTranslations('Report')
  const tPost = useTranslations('Post')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postId && !commentId) return
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        showToast(t('loginRequired'), 'error')
        return
      }

      const { error } = await supabase
        .from('reports')
        .insert({
          post_id: postId,
          comment_id: commentId,
          reporter_id: user.id,
          reason: details ? `${reason}: ${details}` : reason,
          status: 'pending'
        })

      if (error) throw error

      showToast(t('success'), 'success')
      setOpen(false)
      setDetails('')
      setReason('spam')
    } catch (error) {
      console.error('Error submitting report:', error)
      showToast(t('error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {asMenuItem ? (
          <div className={`flex items-center gap-2 w-full ${className}`}>
            <Flag className="w-4 h-4" />
            <span>{t('title')}</span>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className={`text-text-light dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 ${className}`}>
            <Flag className="w-4 h-4 mr-2" />
            {tPost('report')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>{t('whyReporting')}</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spam" id="spam" />
                <Label htmlFor="spam">{t('spam')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="harassment" id="harassment" />
                <Label htmlFor="harassment">{t('harassment')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="misinformation" id="misinformation" />
                <Label htmlFor="misinformation">{t('misinformation')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">{t('other')}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">{t('details')}</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t('detailsPlaceholder')}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
