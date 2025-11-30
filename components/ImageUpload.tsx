'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import Image from 'next/image'

interface ImageUploadProps {
    bucket: 'avatars' | 'post_images'
    path?: string // Optional subpath
    onUploadComplete: (url: string) => void
    currentImage?: string | null
    className?: string
}

export function ImageUpload({ bucket, path = '', onUploadComplete, currentImage, className = '' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(currentImage || null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { showToast } = useToast()
    const supabase = createClient()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${path ? path + '/' : ''}${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = fileName

        setUploading(true)

        // Create local preview
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)

        try {
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath)

            onUploadComplete(publicUrl)
            showToast('Image uploaded successfully', 'success')
        } catch (error: any) {
            console.error('Error uploading image:', error)
            showToast('Error uploading image', 'error')
            setPreview(currentImage || null) // Revert preview on error
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        setPreview(null)
        onUploadComplete('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 dark:border-dark-border">
                        <Image
                            src={preview}
                            alt="Upload preview"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                    </div>
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-border hover:border-primary dark:hover:border-primary transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-bg/80 rounded-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    {preview ? 'Change Image' : 'Upload Image'}
                </Button>
                {preview && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleRemove()
                        }}
                        disabled={uploading}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        Remove
                    </Button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    )
}
