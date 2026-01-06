'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar as CalendarIcon, MapPin, Clock, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { ImageUpload } from '@/components/ImageUpload'
import { useTranslations } from 'next-intl'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { format } from 'date-fns'

export default function CreateEventPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [location, setLocation] = useState('')
    const [link, setLink] = useState('')
    const [coverImage, setCoverImage] = useState('')
    const [loading, setLoading] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    const t = useTranslations('Events.create')
    const tCommon = useTranslations('Common')
    const tEvents = useTranslations('Events')

    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    const handleSave = async (action: 'publish' | 'draft' | 'preview', e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                showToast(t('signInRequired'), 'error')
                router.push('/login')
                return
            }

            if (action === 'preview') {
                setIsPreviewOpen(true)
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('posts')
                .insert({
                    title,
                    content: description,
                    content_type: 'event',
                    author_id: user.id,
                    status: status,
                    cover_image_url: coverImage,
                    metadata: {
                        start_time: new Date(startTime).toISOString(),
                        end_time: endTime ? new Date(endTime).toISOString() : null,
                        location,
                        link
                    }
                })
                .select()
                .single()

            if (error) throw error

            if (action === 'draft') {
                showToast(t('draftSuccess'), 'success')
                router.refresh()
                router.push('/events')
            } else {
                showToast(t('publishSuccess'), 'success')
                router.refresh()
                router.push(`/events/${data.id}`)
            }
        } catch (error: any) {
            console.error('Error creating event:', JSON.stringify(error, null, 2))
            showToast(error?.message || tCommon('error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar />

            <main className="flex-1 container-custom max-w-3xl py-12">
                <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-8">
                    {t('title')}
                </h1>

                <form onSubmit={(e) => handleSave('publish', e)} className="space-y-6 bg-white dark:bg-dark-surface p-8 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">

                    <div className="space-y-2">
                        <Label htmlFor="title">{t('eventTitleLabel')}</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('eventTitlePlaceholder')}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('coverImageLabel')}</Label>
                        <ImageUpload
                            bucket="post_images"
                            currentImage={coverImage}
                            onUploadComplete={(url) => setCoverImage(url)}
                            cropShape="rect"
                            aspectRatio={16 / 9}
                            className="w-full max-w-xl mx-auto"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">{t('startTimeLabel')}</Label>
                            <Input
                                id="startTime"
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endTime">{t('endTimeLabel')}</Label>
                            <Input
                                id="endTime"
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">{t('locationLabel')}</Label>
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={t('locationPlaceholder')}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link">{t('linkLabel')}</Label>
                        <Input
                            id="link"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder={t('linkPlaceholder')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t('descriptionLabel')}</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('descriptionPlaceholder')}
                            required
                            className="min-h-[150px]"
                        />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/events')}
                            disabled={loading}
                            className="flex-1 sm:flex-none"
                        >
                            {t('cancelButton')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleSave('draft')}
                            disabled={loading}
                            className="flex-1 sm:flex-none"
                        >
                            {t('saveDraftButton')}
                        </Button>

                        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleSave('preview')}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none"
                                >
                                    {t('previewButton')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold text-text dark:text-dark-text">
                                        {t('previewButton')}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="mt-4 space-y-6">
                                    {/* Cover Image Preview */}
                                    {coverImage && (
                                        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border shadow-sm">
                                            <Image src={coverImage} alt="Cover Preview" fill className="object-cover" sizes="100vw" />
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-text dark:text-dark-text">
                                                {title || t('eventTitleLabel')}
                                            </h2>
                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-text-light dark:text-dark-text-muted">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4 text-primary" />
                                                    <span>{startTime ? format(new Date(startTime), 'PPP') : '---'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    <span>
                                                        {startTime ? format(new Date(startTime), 'p') : '--:--'}
                                                        {endTime && ` - ${format(new Date(endTime), 'p')}`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    <span>{location || '---'}</span>
                                                </div>
                                                {link && (
                                                    <div className="flex items-center gap-2 text-primary">
                                                        <ExternalLink className="w-4 h-4" />
                                                        <span className="truncate max-w-[200px]">{link}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
                                            <p className="text-text dark:text-dark-text whitespace-pre-wrap leading-relaxed">
                                                {description || t('descriptionPlaceholder')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-dark-border">
                                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                                            {tCommon('close')}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setIsPreviewOpen(false);
                                                handleSave('publish');
                                            }}
                                            className="bg-primary hover:bg-primary-dark text-white"
                                        >
                                            {t('publishButton')}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            type="submit"
                            disabled={loading}
                            variant="default"
                            className="flex-1 sm:flex-none"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {loading ? t('publishing') : t('publishButton')}
                        </Button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    )
}
