'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, X, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'

interface CoverImageUploadProps {
    value: string | null
    onChange: (url: string | null) => void
    userId: string
}

export function CoverImageUpload({ value, onChange, userId }: CoverImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()
    const { showToast } = useToast()

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please upload an image file', 'error')
            return
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be smaller than 5MB', 'error')
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
            showToast('Cover image uploaded!', 'success')
        } catch (error) {
            console.error('Upload failed:', error)
            showToast('Failed to upload image', 'error')
        } finally {
            setUploading(false)
        }
    }, [supabase, userId, onChange, showToast])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        maxFiles: 1,
        disabled: uploading
    })

    const removeCover = () => {
        onChange(null)
    }

    if (value) {
        return (
            <div className="relative group">
                <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border">
                    <img
                        src={value}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={removeCover}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Remove Cover
                        </button>
                    </div>
                </div>
                <p className="text-xs text-text-light dark:text-dark-text-muted mt-2 text-center">
                    Recommended: 1200×514px (21:9 aspect ratio)
                </p>
            </div>
        )
    }

    return (
        <div
            {...getRootProps()}
            className={`
        relative aspect-[21/9] rounded-2xl border-2 border-dashed cursor-pointer
        transition-all duration-200
        ${isDragActive
                    ? 'border-primary bg-primary/5 dark:border-primary-light dark:bg-primary-light/5'
                    : 'border-gray-300 dark:border-dark-border hover:border-primary dark:hover:border-primary-light'
                }
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            <input {...getInputProps()} />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                {uploading ? (
                    <>
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                        <p className="text-sm font-medium text-text dark:text-dark-text">Uploading...</p>
                    </>
                ) : (
                    <>
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                            {isDragActive ? (
                                <Upload className="w-7 h-7 text-primary" />
                            ) : (
                                <ImagePlus className="w-7 h-7 text-text-light dark:text-dark-text-muted" />
                            )}
                        </div>

                        {isDragActive ? (
                            <p className="text-sm font-medium text-primary dark:text-primary-light">
                                Drop image here
                            </p>
                        ) : (
                            <>
                                <p className="text-sm font-medium text-text dark:text-dark-text mb-1">
                                    Add a cover image
                                </p>
                                <p className="text-xs text-text-light dark:text-dark-text-muted">
                                    Drag & drop or click to upload
                                </p>
                                <p className="text-xs text-text-muted mt-2">
                                    PNG, JPG, GIF, WEBP • Max 5MB
                                </p>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default CoverImageUpload
