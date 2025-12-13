'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCw, Check, X } from 'lucide-react'

interface Point {
    x: number
    y: number
}

interface Area {
    x: number
    y: number
    width: number
    height: number
}

interface ImageCropModalProps {
    open: boolean
    onClose: () => void
    imageSrc: string
    onCropComplete: (croppedBlob: Blob) => void
    aspectRatio?: number
    cropShape?: 'rect' | 'round'
}

// Helper function to create cropped image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('No 2d context')
    }

    // Set canvas size to the cropped area
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Draw the cropped image
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    // Convert to blob
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob)
                } else {
                    reject(new Error('Canvas is empty'))
                }
            },
            'image/jpeg',
            0.9
        )
    })
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new window.Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.crossOrigin = 'anonymous'
        image.src = url
    })
}

export function ImageCropModal({
    open,
    onClose,
    imageSrc,
    onCropComplete,
    aspectRatio = 1,
    cropShape = 'round'
}: ImageCropModalProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [processing, setProcessing] = useState(false)

    const onCropChange = useCallback((location: Point) => {
        setCrop(location)
    }, [])

    const onZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom)
    }, [])

    const onCropCompleteHandler = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360)
    }

    const handleSave = async () => {
        if (!croppedAreaPixels) return

        setProcessing(true)
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
            onCropComplete(croppedBlob)
            onClose()
        } catch (error) {
            console.error('Error cropping image:', error)
        } finally {
            setProcessing(false)
        }
    }

    const handleCancel = () => {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setRotation(0)
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle>Crop Image</DialogTitle>
                </DialogHeader>

                {/* Crop area */}
                <div className="relative h-[300px] bg-gray-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspectRatio}
                        cropShape={cropShape}
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                    />
                </div>

                {/* Controls */}
                <div className="px-6 py-4 space-y-4 bg-gray-50 dark:bg-dark-surface">
                    {/* Zoom slider */}
                    <div className="flex items-center gap-4">
                        <ZoomOut className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 dark:bg-dark-border rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <ZoomIn className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                    </div>

                    {/* Rotation button */}
                    <div className="flex justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRotate}
                            className="gap-2"
                        >
                            <RotateCw className="w-4 h-4" />
                            Rotate 90°
                        </Button>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-dark-border">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={processing}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={processing || !croppedAreaPixels}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        {processing ? 'Processing...' : 'Apply'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
