'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, X, Loader2, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface CoverImageUploadProps {
    value: string | null
    onChange: (url: string | null) => void
    userId: string
    compact?: boolean
}

export function CoverImageUpload({ value, onChange, userId, compact = false }: CoverImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()
    const { showToast } = useToast()
    const inputRef = useRef<HTMLInputElement>(null)
    const t = useTranslations('Editor')
    const tCommon = useTranslations('Common')

    const handleUpload = useCallback(async (file: File) => {
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast(t('upload.invalidType'), 'error')
            return
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast(t('upload.tooLarge'), 'error')
            return
        }

        setUploading(true)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `covers/${userId}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('post_images')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('post_images')
                .getPublicUrl(fileName)

            onChange(publicUrl)
            showToast(t('upload.success'), 'success')
        } catch (error) {
            console.error('Upload failed:', error)
            showToast(t('upload.failed'), 'error')
        } finally {
            setUploading(false)
        }
    }, [supabase, userId, onChange, showToast, t])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
    }

    const removeCover = () => {
        onChange(null)
    }

    // Compact mode - just a button for corner placement
    if (compact) {
        return (
            <div className="flex gap-2">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Button
                    type="button"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="bg-black/60 hover:bg-black/80 text-white shadow-md gap-2 backdrop-blur-sm"
                >
                    {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Camera className="w-4 h-4" />
                    )}
                    {value ? t('changeCover') : t('addCover')}
                </Button>
                {value && (
                    <Button
                        type="button"
                        size="sm"
                        onClick={removeCover}
                        disabled={uploading}
                        className="bg-red-500/90 hover:bg-red-500 text-white shadow-md"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>
        )
    }

    // Full mode with preview
    if (value) {
        return (
            <div className="relative group">
                <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border">
                    <Image
                        src={value}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            data-testid="cover-image-input"
                        />
                        <Button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            {tCommon('edit')}
                        </Button>
                        <Button
                            type="button"
                            onClick={removeCover}
                            variant="destructive"
                        >
                            <X className="w-4 h-4 mr-2" />
                            {tCommon('remove')}
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-text-light dark:text-dark-text-muted mt-2 text-center">
                    {t('recommendedAspect')}
                </p>
            </div>
        )
    }

    // Empty state - dropzone style
    return (
        <div
            onClick={() => inputRef.current?.click()}
            className="relative aspect-[21/9] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 border-gray-300 dark:border-dark-border hover:border-primary dark:hover:border-primary-light"
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                data-testid="cover-image-input"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                {uploading ? (
                    <>
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                        <p className="text-sm font-medium text-text dark:text-dark-text">{t('draft.saving')}</p>
                    </>
                ) : (
                    <>
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center mb-4">
                            <ImagePlus className="w-7 h-7 text-text-light dark:text-dark-text-muted" />
                        </div>
                        <p className="text-sm font-medium text-text dark:text-dark-text mb-1">
                            {t('addCoverImage')}
                        </p>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">
                            {t('clickToUpload')}
                        </p>
                        <p className="text-xs text-text-muted mt-2">
                            {t('imageFormats')}
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}

export default CoverImageUpload
