'use client'

import { useState, useEffect, useMemo } from 'react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, UploadCloud, FileText, Database, FileType, Wrench, Film, FileSpreadsheet, X, Link2, Sparkles, Check, AlertCircle, PenTool, Search } from 'lucide-react'
import { generateShortTitle, sanitizeForSlug, generateResourceSlug } from '@/lib/utils/slug-generator'

const RESOURCE_TYPES = [
    { value: 'dataset', label: 'Dataset', icon: Database, description: 'CSV, Excel, JSON data files', color: 'text-emerald-500 dark:text-emerald-400', activeBorder: 'border-emerald-500 dark:border-emerald-500', activeBg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { value: 'paper', label: 'Paper/Report', icon: FileType, description: 'PDFs, research papers, reports, documents', color: 'text-blue-500 dark:text-blue-400', activeBorder: 'border-blue-500 dark:border-blue-500', activeBg: 'bg-blue-50 dark:bg-blue-900/20' },
    { value: 'tool', label: 'Tool/Software', icon: Wrench, description: 'Scripts, applications, utilities', color: 'text-purple-500 dark:text-purple-400', activeBorder: 'border-purple-500 dark:border-purple-500', activeBg: 'bg-purple-50 dark:bg-purple-900/20' },
    { value: 'media', label: 'Media', icon: Film, description: 'Images, videos, audio files', color: 'text-pink-500 dark:text-pink-400', activeBorder: 'border-pink-500 dark:border-pink-500', activeBg: 'bg-pink-50 dark:bg-pink-900/20' },
    { value: 'template', label: 'Template', icon: FileSpreadsheet, description: 'Forms, formats, frameworks', color: 'text-amber-500 dark:text-amber-400', activeBorder: 'border-amber-500 dark:border-amber-500', activeBg: 'bg-amber-50 dark:bg-amber-900/20' },
    { value: 'design', label: 'Design', icon: PenTool, description: 'CAD, 3D models, architectural drawings', color: 'text-cyan-500 dark:text-cyan-400', activeBorder: 'border-cyan-500 dark:border-cyan-500', activeBg: 'bg-cyan-50 dark:bg-cyan-900/20' },
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
    const t = useTranslations('Resources.upload')
    const tSlug = useTranslations('Resources.slug')
    const tLicenses = useTranslations('Licenses')
    const [title, setTitle] = useState('')
    const [shortTitle, setShortTitle] = useState('')
    const [shortTitleEdited, setShortTitleEdited] = useState(false)
    const [description, setDescription] = useState('')
    const [resourceType, setResourceType] = useState<string>('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [availableTags, setAvailableTags] = useState<Tag[]>([])
    const [license, setLicense] = useState('CC-BY-4.0')
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSuggesting, setIsSuggesting] = useState(false)
    const [tagSearch, setTagSearch] = useState('')

    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    // Optimized: Debounce slug generation to prevent input lag
    useEffect(() => {
        if (shortTitleEdited || !title) return

        // Wait 500ms after user stops typing before generating slug
        const timer = setTimeout(() => {
            setShortTitle(generateShortTitle(title))
        }, 500)

        return () => clearTimeout(timer)
    }, [title, shortTitleEdited])


    // Get primary discipline from selected tags
    const primaryDiscipline = useMemo(() => {
        if (selectedTags.length === 0) return 'general'
        const firstTag = availableTags.find(t => t.label === selectedTags[0])
        return firstTag?.discipline || 'general'
    }, [selectedTags, availableTags])

    // Generate preview slug (with placeholder UUID)
    const previewSlug = useMemo(() => {
        if (!resourceType || !shortTitle) return null

        // Use a placeholder UUID for preview
        const previewUuid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
        const result = generateResourceSlug({
            resourceType,
            discipline: primaryDiscipline,
            shortTitle,
            date: new Date(),
            uuid: previewUuid
        })

        // Replace the placeholder hash with 'xxxxxx' for display
        return result.slug.replace(/-[a-f0-9]{6}$/, '-xxxxxx')
    }, [resourceType, primaryDiscipline, shortTitle])

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

    // Handle title changes (slug generation is handled by debounced useEffect)
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
    }

    const handleShortTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = sanitizeForSlug(e.target.value, 50)
        setShortTitle(sanitized)
        setShortTitleEdited(true)
    }

    const handleRegenerateShortTitle = () => {
        setShortTitle(generateShortTitle(title))
        setShortTitleEdited(false)
    }

    // AI-powered short title suggestion
    const handleAISuggest = async () => {
        if (!title.trim()) {
            showToast('Please enter a title first', 'error')
            return
        }

        setIsSuggesting(true)
        try {
            const response = await fetch('/api/suggest-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    resourceType,
                    discipline: primaryDiscipline
                })
            })

            if (!response.ok) {
                throw new Error('Failed to get suggestion')
            }

            const data = await response.json()
            if (data.suggestion) {
                setShortTitle(data.suggestion)
                setShortTitleEdited(true)
                showToast(
                    data.source === 'ai' ? tSlug('aiSuggestionApplied') : tSlug('fallbackApplied'),
                    'success'
                )
            }
        } catch (error) {
            console.error('AI suggestion error:', error)
            // Fallback to deterministic
            setShortTitle(generateShortTitle(title))
            showToast(tSlug('suggestionFailed'), 'error')
        } finally {
            setIsSuggesting(false)
        }
    }

    // Group tags by discipline, filtered by search query
    const tagsByDiscipline = useMemo(() => {
        const query = tagSearch.toLowerCase().trim()
        return availableTags.reduce<Record<string, Tag[]>>((acc, tag) => {
            if (query && !tag.label.toLowerCase().includes(query)) return acc

            const discipline = tag.discipline || 'Other'
            if (!acc[discipline]) acc[discipline] = []
            acc[discipline].push(tag)
            return acc
        }, {})
    }, [availableTags, tagSearch])

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagSearch.trim()) {
            e.preventDefault()
            const newTag = tagSearch.trim()
            if (!selectedTags.includes(newTag)) {
                setSelectedTags(prev => [...prev, newTag])
            }
            setTagSearch('')
        }
    }

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
        if (!shortTitle.trim()) {
            showToast(tSlug('shortTitleRequired'), 'error')
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

            // 1. Generate the post UUID first (for slug hash)
            const postId = crypto.randomUUID()

            // 2. Generate the canonical slug
            const slugResult = generateResourceSlug({
                resourceType,
                discipline: primaryDiscipline,
                shortTitle,
                date: new Date(),
                uuid: postId
            })

            // 3. Upload File
            const fileExt = file.name.split('.').pop()
            // Use the postId for storage path consistency
            const fileName = `${postId}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('resources')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(filePath)

            // 4. Create Post with slug and short_title
            const { data, error: postError } = await supabase
                .from('posts')
                .insert({
                    id: postId,
                    title,
                    short_title: slugResult.shortTitle,
                    slug: slugResult.slug,
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

            // Navigate to the new slug-based URL
            router.push(`/resources/${slugResult.slug}`)
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
                    {t('title')}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-dark-surface p-8 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">

                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative">
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
                                        {t('selectFile')}
                                    </p>
                                    <p className="text-sm text-text-light dark:text-dark-text-muted">
                                        {t('fileTypes')}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Resource Type Selection */}
                    <div className="space-y-3">
                        <Label>{t('typeRequired')} <span className="text-red-500">*</span></Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {RESOURCE_TYPES.map((type) => {
                                const Icon = type.icon
                                const isSelected = resourceType === type.value
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setResourceType(type.value)}
                                        className={`p-4 rounded-lg border-2 transition-all text-left group ${isSelected
                                            ? `${type.activeBorder} ${type.activeBg}`
                                            : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 mb-2 transition-colors ${isSelected ? type.color : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                        <p className={`font-medium transition-colors ${isSelected ? 'text-text dark:text-white' : 'text-text dark:text-dark-text'}`}>
                                            {type.label}
                                        </p>
                                        <p className={`text-xs mt-1 transition-colors ${isSelected ? 'text-text-light dark:text-gray-300' : 'text-text-light dark:text-dark-text-muted'}`}>
                                            {type.description}
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">{t('titleLabel')} <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder={t('titlePlaceholder')}
                            required
                        />
                    </div>

                    {/* Short Title / Slug ID - NEW */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="shortTitle">
                                {tSlug('shortTitleLabel')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-2">
                                {/* AI Suggest Button */}
                                <button
                                    type="button"
                                    onClick={handleAISuggest}
                                    disabled={isSuggesting || !title.trim()}
                                    className="text-xs border border-primary/20 dark:border-primary/50 text-primary dark:text-white bg-primary/5 dark:bg-primary/20 hover:bg-primary/10 dark:hover:bg-primary/30 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {isSuggesting ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-3 h-3" />
                                    )}
                                    {tSlug('aiSuggest')}
                                </button>
                                {/* Regenerate Button (basic) */}
                                {shortTitleEdited && (
                                    <button
                                        type="button"
                                        onClick={handleRegenerateShortTitle}
                                        className="text-xs text-primary/70 dark:text-primary-light/70 hover:text-primary dark:hover:text-white flex items-center gap-1 transition-colors font-medium"
                                    >
                                        {tSlug('regenerate')}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <Input
                                id="shortTitle"
                                value={shortTitle}
                                onChange={handleShortTitleChange}
                                placeholder={tSlug('shortTitlePlaceholder')}
                                maxLength={50}
                                className="font-mono text-sm pe-16"
                            />
                            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-text-light dark:text-dark-text-muted">
                                {shortTitle.length}/50
                            </span>
                        </div>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">
                            {tSlug('shortTitleHint')}
                        </p>
                    </div>

                    {/* Slug Preview - NEW */}
                    {previewSlug && (
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border">
                            <div className="flex items-start gap-3">
                                <Link2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-text-light dark:text-dark-text-muted mb-1">
                                        {tSlug('generatedUrl')}
                                    </p>
                                    <code className="text-sm font-mono text-primary dark:text-primary-light break-all">
                                        /resources/{previewSlug}
                                    </code>
                                    <p className="text-xs text-text-light dark:text-dark-text-muted mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {tSlug('immutableWarning')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="description">{t('descriptionLabel')} <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('descriptionPlaceholder')}
                            required
                            className="min-h-[150px]"
                        />
                    </div>

                    {/* Discipline Tags */}
                    <div className="space-y-3">
                        <Label>{t('tagsLabel')}</Label>
                        <p className="text-sm text-text-light dark:text-gray-400">
                            {t('tagsHint')}
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
                                            style={{ borderInlineStart: `3px solid ${tag?.color || '#10b981'}` }}
                                        >
                                            {tagLabel}
                                            <X className="w-3 h-3 opacity-70" />
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Tag Search and Available Tags */}
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light opacity-50" />
                                <Input
                                    value={tagSearch}
                                    onChange={(e) => setTagSearch(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder={t('searchTagsPlaceholder')}
                                    className="ps-10 pe-10"
                                />
                                {tagSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setTagSearch('')}
                                        className="absolute end-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-4 h-4 text-text-light hover:text-primary transition-colors" />
                                    </button>
                                )}
                            </div>

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
                                                    style={!selectedTags.includes(tag.label) ? { borderInlineStart: `3px solid ${tag.color}` } : {}}
                                                >
                                                    {tag.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="license">{t('licenseLabel')}</Label>

                        <Select value={license} onValueChange={setLicense}>
                            <SelectTrigger id="license" className="w-full">
                                <SelectValue placeholder={t('licenseLabel')} />
                            </SelectTrigger>
                            <SelectContent>
                                {LICENSES.map(l => (
                                    <SelectItem key={l.value} value={l.value}>
                                        {l.value === 'Copyright' ? tLicenses('All Rights Reserved') :
                                            l.value === 'Other' ? l.label :
                                                tLicenses(l.value.replace(/\./g, '_'))}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* License Description */}
                        <div className="mt-2 text-sm leading-relaxed text-text-light dark:text-gray-100 space-y-0.5 transition-all animate-in fade-in slide-in-from-top-1">
                            <p>{tLicenses('helpText')}</p>
                            <p className="mt-1.5">
                                <span className="font-semibold text-text dark:text-gray-200">
                                    {license === 'Copyright' ? tLicenses('All Rights Reserved') :
                                        license === 'Other' ? (LICENSES.find(l => l.value === 'Other')?.label || 'Other') :
                                            tLicenses(license.replace(/\./g, '_'))}:
                                </span>{' '}
                                <span className={license === 'Copyright' ? "text-amber-600 dark:text-amber-200" : "text-emerald-600 dark:text-emerald-400/80"}>
                                    {license === 'Copyright'
                                        ? tLicenses('descriptions.All Rights Reserved')
                                        : license === 'Other'
                                            ? tLicenses('descriptions.Other')
                                            : tLicenses('descriptions.' + license.replace(/\./g, '_'))
                                    }
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={uploading || !file || !resourceType || !shortTitle.trim()} size="lg">
                            {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {uploading ? t('uploading') : t('submitButton')}
                        </Button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    )
}
