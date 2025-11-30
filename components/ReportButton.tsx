'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postId && !commentId) return
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        showToast('You must be logged in to report content.', 'error')
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

      showToast('Report submitted. Thank you for helping keep our community safe.', 'success')
      setOpen(false)
      setDetails('')
      setReason('spam')
    } catch (error) {
      console.error('Error submitting report:', error)
      showToast('Failed to submit report. Please try again.', 'error')
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
            <span>Report Content</span>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className={`text-text-light dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 ${className}`}>
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Why are you reporting this?</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spam" id="spam" />
                <Label htmlFor="spam">Spam or unwanted commercial content</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="harassment" id="harassment" />
                <Label htmlFor="harassment">Harassment or hate speech</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="misinformation" id="misinformation" />
                <Label htmlFor="misinformation">Misinformation or fake news</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional Details (Optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide more context..."
              className="resize-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
