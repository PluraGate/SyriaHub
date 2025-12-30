'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { ImageCropModal } from './ImageCropModal'

interface ImageUploadProps {
    bucket: 'avatars' | 'post_images'
    path?: string // Optional subpath
    onUploadComplete: (url: string) => void
    currentImage?: string | null
    className?: string
    enableCrop?: boolean
    cropShape?: 'round' | 'rect'
    aspectRatio?: number
}

export function ImageUpload({
    bucket,
    path = '',
    onUploadComplete,
    currentImage,
    className = '',
    enableCrop = true,
    cropShape = 'round',
    aspectRatio = 1
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(currentImage || null)
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { showToast } = useToast()
    const supabase = createClient()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }

        const file = e.target.files[0]

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error')
            return
        }

        // Create object URL for cropping
        const objectUrl = URL.createObjectURL(file)

        if (enableCrop) {
            // Open crop modal
            setSelectedImage(objectUrl)
            setCropModalOpen(true)
        } else {
            // Upload directly without cropping
            await uploadImage(file)
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const uploadImage = async (file: File | Blob) => {
        const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg'
        const fileName = `${path ? path + '/' : ''}${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = fileName

        setUploading(true)

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

            setPreview(publicUrl)
            onUploadComplete(publicUrl)
            showToast('Image uploaded successfully', 'success')
        } catch (error: any) {
            console.error('Error uploading image:', error)
            showToast('Error uploading image', 'error')
            setPreview(currentImage || null)
        } finally {
            setUploading(false)
        }
    }

    const handleCropComplete = async (croppedBlob: Blob) => {
        // Upload the cropped image
        await uploadImage(croppedBlob)

        // Clean up
        if (selectedImage) {
            URL.revokeObjectURL(selectedImage)
            setSelectedImage(null)
        }
    }

    const handleCropModalClose = () => {
        setCropModalOpen(false)
        if (selectedImage) {
            URL.revokeObjectURL(selectedImage)
            setSelectedImage(null)
        }
    }

    const handleRemove = () => {
        setPreview(null)
        onUploadComplete('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const previewStyle = cropShape === 'round'
        ? "w-32 h-32 rounded-full"
        : "w-full aspect-video rounded-xl"

    return (
        <>
            <div className={`flex flex-col items-center gap-4 ${className}`}>
                <div
                    className={`relative group cursor-pointer overflow-hidden border-2 border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-dark-surface flex items-center justify-center transition-colors hover:border-primary dark:hover:border-primary ${previewStyle}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {preview ? (
                        <>
                            <Image
                                src={preview}
                                alt="Upload preview"
                                fill
                                className="object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                        </>
                    ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}

                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-bg/80">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    )}
                </div>

                <div className="flex gap-2 justify-center">
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-primary text-white hover:bg-primary-dark"
                    >
                        {preview ? 'Change Image' : 'Upload Image'}
                    </Button>
                    {preview && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleRemove()
                            }}
                            disabled={uploading}
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
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

            {/* Crop Modal */}
            {selectedImage && (
                <ImageCropModal
                    open={cropModalOpen}
                    onClose={handleCropModalClose}
                    imageSrc={selectedImage}
                    onCropComplete={handleCropComplete}
                    aspectRatio={aspectRatio}
                    cropShape={cropShape}
                />
            )}
        </>
    )
}
