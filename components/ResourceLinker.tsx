'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X, Link2, FileText, Database, FileType, Wrench, Film, FileSpreadsheet, Plus, Loader2, Upload, UploadCloud, PenTool } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

interface ResourceMetadata {
    url?: string
    size?: number
    mime_type?: string
    original_name?: string
    downloads?: number
    license?: string
    resource_type?: 'dataset' | 'paper' | 'tool' | 'media' | 'template' | 'design'
}

interface Resource {
    id: string
    title: string
    content?: string
    created_at: string
    metadata: ResourceMetadata
    tags?: string[]
    author?: { name?: string | null; email?: string | null } | null
}

interface ResourceLinkerProps {
    selectedResources: Resource[]
    onChange: (resources: Resource[]) => void
    maxResources?: number
    userId?: string
}

const RESOURCE_TYPES = [
    { value: 'dataset', label: 'Dataset', icon: Database },
    { value: 'paper', label: 'Paper/Report', icon: FileType },
    { value: 'tool', label: 'Tool/Software', icon: Wrench },
    { value: 'media', label: 'Media', icon: Film },
    { value: 'template', label: 'Template', icon: FileSpreadsheet },
    { value: 'design', label: 'Design', icon: PenTool },
]

const RESOURCE_TYPE_ICONS = {
    dataset: Database,
    paper: FileType,
    tool: Wrench,
    media: Film,
    template: FileSpreadsheet,
    design: PenTool,
}

const RESOURCE_TYPE_COLORS = {
    dataset: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    paper: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    tool: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    media: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    template: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    design: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
}

export function ResourceLinker({
    selectedResources,
    onChange,
    maxResources = 10,
    userId,
}: ResourceLinkerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Resource[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Quick Upload Modal State
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploadFile, setUploadFile] = useState<File | null>(null)
    const [uploadTitle, setUploadTitle] = useState('')
    const [uploadDescription, setUploadDescription] = useState('')
    const [uploadResourceType, setUploadResourceType] = useState<string>('paper')
    const [isUploading, setIsUploading] = useState(false)

    const supabase = createClient()
    const t = useTranslations('Resources')

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(async () => {
            setIsSearching(true)
            setError(null)

            try {
                const response = await fetch(
                    `/api/resources/search?q=${encodeURIComponent(searchQuery)}&limit=10`,
                    { signal: controller.signal }
                )

                if (!response.ok) {
                    throw new Error('Failed to search resources')
                }

                const data = await response.json()
                // Filter out already selected resources
                const filtered = data.resources.filter(
                    (r: Resource) => !selectedResources.some(sr => sr.id === r.id)
                )
                setSearchResults(filtered)
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    setError('Failed to search resources')
                    console.error('Resource search error:', err)
                }
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => {
            clearTimeout(timeoutId)
            controller.abort()
        }
    }, [searchQuery, selectedResources])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleAddResource = useCallback(
        (resource: Resource) => {
            if (selectedResources.length >= maxResources) {
                setError(`Maximum ${maxResources} resources allowed`)
                return
            }
            onChange([...selectedResources, resource])
            setSearchQuery('')
            setSearchResults([])
            setIsOpen(false)
        },
        [selectedResources, onChange, maxResources]
    )

    const handleRemoveResource = useCallback(
        (resourceId: string) => {
            onChange(selectedResources.filter(r => r.id !== resourceId))
        },
        [selectedResources, onChange]
    )

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setUploadFile(file)
            // Auto-fill title from filename if empty
            if (!uploadTitle) {
                setUploadTitle(file.name.replace(/\.[^/.]+$/, ''))
            }
        }
    }

    const handleQuickUpload = async () => {
        if (!uploadFile || !uploadTitle.trim() || !userId) {
            setError('Please fill in all required fields')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            // 1. Upload file to storage
            const fileExt = uploadFile.name.split('.').pop()
            // SECURITY: Use crypto.randomUUID() for secure filename generation
            const fileName = `${crypto.randomUUID()}.${fileExt}`
            const filePath = `${userId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('resources')
                .upload(filePath, uploadFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(filePath)

            // 2. Create resource post
            const { data, error: postError } = await supabase
                .from('posts')
                .insert({
                    title: uploadTitle.trim(),
                    content: uploadDescription.trim() || `Resource: ${uploadTitle}`,
                    tags: [],
                    content_type: 'resource',
                    author_id: userId,
                    status: 'published',
                    metadata: {
                        url: publicUrl,
                        size: uploadFile.size,
                        mime_type: uploadFile.type,
                        original_name: uploadFile.name,
                        downloads: 0,
                        license: 'CC-BY-4.0',
                        resource_type: uploadResourceType
                    }
                })
                .select('id, title, content, created_at, metadata')
                .single()

            if (postError) throw postError

            // 3. Add to selected resources
            const newResource: Resource = {
                id: data.id,
                title: data.title,
                content: data.content,
                created_at: data.created_at,
                metadata: data.metadata as ResourceMetadata
            }
            handleAddResource(newResource)

            // 4. Reset upload form
            setShowUploadModal(false)
            setUploadFile(null)
            setUploadTitle('')
            setUploadDescription('')
            setUploadResourceType('paper')
        } catch (err) {
            console.error('Upload error:', err)
            setError('Failed to upload resource. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    const getResourceIcon = (resourceType?: string) => {
        const IconComponent = resourceType
            ? RESOURCE_TYPE_ICONS[resourceType as keyof typeof RESOURCE_TYPE_ICONS]
            : FileText
        return IconComponent || FileText
    }

    const getResourceColor = (resourceType?: string) => {
        return resourceType
            ? RESOURCE_TYPE_COLORS[resourceType as keyof typeof RESOURCE_TYPE_COLORS]
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }

    const formatSize = (bytes?: number) => {
        if (!bytes) return ''
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text dark:text-dark-text flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    {t('linkedResources')}
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted dark:text-dark-text-muted">
                        {selectedResources.length}/{maxResources}
                    </span>
                    {userId && (
                        <button
                            type="button"
                            onClick={() => setShowUploadModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/50 rounded-lg transition-all"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {t('uploadNew')}
                        </button>
                    )}
                </div>
            </div>

            {/* Selected Resources */}
            {selectedResources.length > 0 && (
                <div className="space-y-2">
                    {selectedResources.map(resource => {
                        const Icon = getResourceIcon(resource.metadata?.resource_type)
                        const colorClass = getResourceColor(resource.metadata?.resource_type)

                        return (
                            <div
                                key={resource.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border group"
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-text dark:text-dark-text truncate text-sm">
                                        {resource.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-text-muted dark:text-dark-text-muted">
                                        {resource.metadata?.resource_type && (
                                            <span className="capitalize">{resource.metadata.resource_type}</span>
                                        )}
                                        {resource.metadata?.size && (
                                            <>
                                                <span>•</span>
                                                <span>{formatSize(resource.metadata.size)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveResource(resource.id)}
                                    className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label={`Remove ${resource.title}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Search Input & Dropdown */}
            <div ref={dropdownRef} className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted dark:text-dark-text-muted" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value)
                            setIsOpen(true)
                        }}
                        onFocus={() => setIsOpen(true)}
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                    )}
                </div>

                {/* Search Results Dropdown */}
                {isOpen && (searchResults.length > 0 || searchQuery.trim()) && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-lg overflow-hidden">
                        {searchResults.length > 0 ? (
                            <ul className="max-h-64 overflow-y-auto py-2">
                                {searchResults.map(resource => {
                                    const Icon = getResourceIcon(resource.metadata?.resource_type)
                                    const colorClass = getResourceColor(resource.metadata?.resource_type)

                                    return (
                                        <li key={resource.id}>
                                            <button
                                                type="button"
                                                onClick={() => handleAddResource(resource)}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors text-left"
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-text dark:text-dark-text truncate text-sm">
                                                        {resource.title}
                                                    </h4>
                                                    <p className="text-xs text-text-muted dark:text-dark-text-muted truncate">
                                                        {resource.content}
                                                    </p>
                                                </div>
                                                <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : searchQuery.trim() && !isSearching ? (
                            <div className="p-4 text-center text-sm text-text-muted dark:text-dark-text-muted">
                                <p>{t('noResourcesFound', { query: searchQuery })}</p>
                                {userId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadModal(true)
                                            setIsOpen(false)
                                        }}
                                        className="inline-flex items-center gap-1 mt-2 text-primary hover:underline"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        {t('uploadNewResource')}
                                    </button>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-xs text-accent">{error}</p>
            )}

            {/* Help Text */}
            <p className="text-xs text-text-light dark:text-dark-text-muted">
                {t('helpText')}
            </p>

            {/* Quick Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border shadow-xl w-full max-w-lg mx-4 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-text dark:text-dark-text flex items-center gap-2">
                                <Upload className="w-5 h-5 text-primary" />
                                {t('quickUpload')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* File Upload Area */}
                            <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.json,.png,.jpg,.jpeg,.mp4,.mp3"
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    {uploadFile ? (
                                        <>
                                            <FileText className="w-8 h-8 text-primary" />
                                            <p className="font-medium text-text dark:text-dark-text text-sm">{uploadFile.name}</p>
                                            <p className="text-xs text-text-muted">
                                                {formatSize(uploadFile.size)}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-8 h-8 text-gray-400" />
                                            <p className="font-medium text-text dark:text-dark-text text-sm">
                                                {t('clickOrDrag')}
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                {t('fileTypes')}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Resource Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text dark:text-dark-text">{t('type')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {RESOURCE_TYPES.map(type => {
                                        const Icon = type.icon
                                        const isSelected = uploadResourceType === type.value
                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setUploadResourceType(type.value)}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 dark:bg-dark-surface-hover text-text dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {type.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text dark:text-dark-text">{t('titleRequired')}</label>
                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={e => setUploadTitle(e.target.value)}
                                    placeholder={t('resourceTitle')}
                                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text dark:text-dark-text">{t('descriptionOptional')}</label>
                                <textarea
                                    value={uploadDescription}
                                    onChange={e => setUploadDescription(e.target.value)}
                                    placeholder={t('briefDescription')}
                                    rows={2}
                                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-dark-border text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleQuickUpload}
                                    disabled={isUploading || !uploadFile || !uploadTitle.trim()}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t('uploading')}
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            {t('uploadAndLink')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

