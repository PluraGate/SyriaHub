'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, UploadCloud, FileText } from 'lucide-react'

export default function UploadResourcePage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')
    const [license, setLicense] = useState('CC-BY-4.0')
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            showToast('Please select a file to upload.', 'error')
            return
        }

        setUploading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                showToast('Please sign in to upload resources.', 'error')
                router.push('/login')
                return
            }

            // 1. Upload File
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('resources')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(filePath)

            // 2. Create Post
            const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0)

            const { data, error: postError } = await supabase
                .from('posts')
                .insert({
                    title,
                    content: description,
                    tags: tagsArray,
                    content_type: 'resource',
                    author_id: user.id,
                    status: 'published',
                    metadata: {
                        url: publicUrl,
                        size: file.size,
                        mime_type: file.type,
                        original_name: file.name,
                        downloads: 0,
                        license: license
                    }
                })
                .select()
                .single()

            if (postError) throw postError

            showToast('Your resource has been successfully shared.', 'success')

            router.push(`/resources/${data.id}`)
        } catch (error: any) {
            console.error('Error uploading resource:', error)
            showToast(error.message || 'Failed to upload resource.', 'error')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar />

            <main className="flex-1 container-custom max-w-3xl py-12">
                <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-8">
                    Upload Resource
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-dark-surface p-8 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">

                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                            {file ? (
                                <>
                                    <FileText className="w-10 h-10 text-primary" />
                                    <p className="font-medium text-text dark:text-dark-text">{file.name}</p>
                                    <p className="text-sm text-text-light dark:text-dark-text-muted">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-10 h-10 text-gray-400" />
                                    <p className="font-medium text-text dark:text-dark-text">
                                        Click or drag file to upload
                                    </p>
                                    <p className="text-sm text-text-light dark:text-dark-text-muted">
                                        PDF, Documents, Datasets (Max 50MB)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. 2024 Humanitarian Aid Report"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this resource contains..."
                            required
                            className="min-h-[150px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g. report, data, humanitarian (comma separated)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="license">License</Label>
                        <select
                            id="license"
                            value={license}
                            onChange={(e) => setLicense(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="CC-BY-4.0">CC BY 4.0 (Attribution)</option>
                            <option value="CC-BY-SA-4.0">CC BY-SA 4.0 (ShareAlike)</option>
                            <option value="CC-BY-NC-4.0">CC BY-NC 4.0 (NonCommercial)</option>
                            <option value="CC0-1.0">CC0 1.0 (Public Domain)</option>
                            <option value="MIT">MIT License</option>
                            <option value="Apache-2.0">Apache 2.0</option>
                            <option value="Copyright">All Rights Reserved</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={uploading || !file} size="lg">
                            {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {uploading ? 'Uploading...' : 'Upload Resource'}
                        </Button>
                    </div>
                </form>
            </main>

            <Footer />
        </div >
    )
}
