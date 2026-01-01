'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/ui/toast'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, UploadCloud, FileText, Database, FileType, Wrench, Film, FileSpreadsheet, X } from 'lucide-react'

const RESOURCE_TYPES = [
    { value: 'dataset', label: 'Dataset', icon: Database, description: 'CSV, Excel, JSON data files' },
    { value: 'paper', label: 'Paper/Report', icon: FileType, description: 'Research papers, reports, documents' },
    { value: 'tool', label: 'Tool/Software', icon: Wrench, description: 'Scripts, applications, utilities' },
    { value: 'media', label: 'Media', icon: Film, description: 'Images, videos, audio files' },
    { value: 'template', label: 'Template', icon: FileSpreadsheet, description: 'Forms, formats, frameworks' },
]

const LICENSES = [
    { value: 'CC-BY-4.0', label: 'CC BY 4.0 (Attribution)' },
    { value: 'CC-BY-SA-4.0', label: 'CC BY-SA 4.0 (ShareAlike)' },
    { value: 'CC-BY-NC-4.0', label: 'CC BY-NC 4.0 (NonCommercial)' },
    { value: 'CC0-1.0', label: 'CC0 1.0 (Public Domain)' },
    { value: 'MIT', label: 'MIT License' },
    { value: 'Apache-2.0', label: 'Apache 2.0' },
    { value: 'Copyright', label: 'All Rights Reserved' },
    { value: 'Other', label: 'Other' },
]

interface Tag {
    id: string
    label: string
    discipline: string | null
    color: string
}

export default function UploadResourcePage() {
    const tLicenses = useTranslations('Licenses')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [resourceType, setResourceType] = useState<string>('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [availableTags, setAvailableTags] = useState<Tag[]>([])
    const [license, setLicense] = useState('CC-BY-4.0')
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    // Check authentication on mount
    useEffect(() => {
        async function checkAuth() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                showToast('Please sign in to upload resources.', 'error')
                router.push('/auth/login?redirect=/resources/upload')
                return
            }
            setIsLoading(false)
        }
        checkAuth()
    }, [supabase, router, showToast])

    // Fetch available tags from database
    useEffect(() => {
        async function fetchTags() {
            const { data } = await supabase
                .from('tags')
                .select('*')
                .order('discipline', { ascending: true })
                .order('label', { ascending: true })

            if (data) {
                setAvailableTags(data)
            }
        }
        fetchTags()
    }, [supabase])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const toggleTag = (tagLabel: string) => {
        setSelectedTags(prev =>
            prev.includes(tagLabel)
                ? prev.filter(t => t !== tagLabel)
                : [...prev, tagLabel]
        )
    }

    // Group tags by discipline
    const tagsByDiscipline = availableTags.reduce<Record<string, Tag[]>>((acc, tag) => {
        const discipline = tag.discipline || 'Other'
        if (!acc[discipline]) acc[discipline] = []
        acc[discipline].push(tag)
        return acc
    }, {})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            showToast('Please select a file to upload.', 'error')
            return
        }
        if (!resourceType) {
            showToast('Please select a resource type.', 'error')
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
            // SECURITY: Use crypto.randomUUID() for secure filename generation
            const fileName = `${crypto.randomUUID()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('resources')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(filePath)

            // 2. Create Post
            const { data, error: postError } = await supabase
                .from('posts')
                .insert({
                    title,
                    content: description,
                    tags: selectedTags,
                    content_type: 'resource',
                    author_id: user.id,
                    status: 'published',
                    metadata: {
                        url: publicUrl,
                        size: file.size,
                        mime_type: file.type,
                        original_name: file.name,
                        downloads: 0,
                        license: license,
                        resource_type: resourceType
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

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
                <Navbar />
                <main className="flex-1 container-custom max-w-3xl py-12 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </main>
                <Footer />
            </div>
        )
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
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.json,.png,.jpg,.jpeg,.mp4,.mp3"
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
                                        PDF, Documents, Datasets, Media (Max 50MB)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Resource Type Selection */}
                    <div className="space-y-3">
                        <Label>Resource Type <span className="text-red-500">*</span></Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {RESOURCE_TYPES.map((type) => {
                                const Icon = type.icon
                                const isSelected = resourceType === type.value
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setResourceType(type.value)}
                                        className={`p-4 rounded-lg border-2 transition-all text-left ${isSelected
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                            : 'border-gray-200 dark:border-dark-border hover:border-primary/50'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-text-light dark:text-dark-text-muted'}`} />
                                        <p className={`font-medium ${isSelected ? 'text-primary' : 'text-text dark:text-dark-text'}`}>
                                            {type.label}
                                        </p>
                                        <p className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                                            {type.description}
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. 2024 Humanitarian Aid Report"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this resource contains..."
                            required
                            className="min-h-[150px]"
                        />
                    </div>

                    {/* Discipline Tags */}
                    <div className="space-y-3">
                        <Label>Disciplines & Tags</Label>
                        <p className="text-sm text-text-light dark:text-gray-400">
                            Select the disciplines and topics that apply to this resource
                        </p>

                        {/* Selected Tags */}
                        {selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                {selectedTags.map(tagLabel => {
                                    const tag = availableTags.find(t => t.label === tagLabel)
                                    return (
                                        <button
                                            key={tagLabel}
                                            type="button"
                                            onClick={() => toggleTag(tagLabel)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                            style={{ borderLeft: `3px solid ${tag?.color || '#10b981'}` }}
                                        >
                                            {tagLabel}
                                            <X className="w-3 h-3 opacity-70" />
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Available Tags by Discipline */}
                        <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 dark:border-dark-border rounded-lg p-4 bg-gray-50 dark:bg-dark-bg">
                            {Object.entries(tagsByDiscipline).map(([discipline, tags]) => (
                                <div key={discipline}>
                                    <p className="text-xs font-medium text-text-light dark:text-dark-text-muted mb-2 uppercase tracking-wide">
                                        {discipline}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => toggleTag(tag.label)}
                                                className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tag.label)
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-text dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                    }`}
                                                style={!selectedTags.includes(tag.label) ? { borderLeft: `3px solid ${tag.color}` } : {}}
                                            >
                                                {tag.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="license">License</Label>
                        <select
                            id="license"
                            value={license}
                            onChange={(e) => setLicense(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 text-sm text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            {LICENSES.map(l => (
                                <option key={l.value} value={l.value}>
                                    {l.value === 'Copyright' ? tLicenses('All Rights Reserved') :
                                        l.value === 'Other' ? l.label :
                                            tLicenses(l.value.replace(/\./g, '_'))}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={uploading || !file || !resourceType} size="lg">
                            {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {uploading ? 'Uploading...' : 'Upload Resource'}
                        </Button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    )
}
