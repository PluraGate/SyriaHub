'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react'

interface Precedent {
    id: string
    title: string
    title_ar?: string
    summary: string
    pattern_id: string
    governorate?: string
    trust_level: string
    is_published: boolean
    created_at: string
}

const PATTERNS = [
    { id: 'P1', name: 'Network bottleneck', name_ar: 'اختناق الشبكة' },
    { id: 'P2', name: 'Service coverage', name_ar: 'تغطية الخدمات' },
    { id: 'P3', name: 'Cross-boundary', name_ar: 'عبر الحدود' },
    { id: 'P4', name: 'Access discontinuity', name_ar: 'انقطاع الوصول' },
    { id: 'P5', name: 'Aid activity', name_ar: 'نشاط المساعدات' }
]

export default function AdminPrecedentsPage() {
    const t = useTranslations('Admin')
    const [precedents, setPrecedents] = useState<Precedent[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [patternFilter, setPatternFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        title_ar: '',
        summary: '',
        summary_ar: '',
        pattern_id: 'P1',
        governorate: '',
        source_url: '',
        source_name: '',
        trust_level: 'medium',
        full_text: '',
        key_lessons: [''],
        is_published: false
    })

    useEffect(() => {
        fetchPrecedents()
    }, [searchQuery, patternFilter])

    async function fetchPrecedents() {
        setLoading(true)
        try {
            let url = '/api/precedents?limit=50'
            if (patternFilter) url += `&pattern=${patternFilter}`
            if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`

            const res = await fetch(url)
            const data = await res.json()
            setPrecedents(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch precedents:', error)
        }
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        const payload = {
            ...formData,
            key_lessons: formData.key_lessons.filter(l => l.trim())
        }

        try {
            const url = editingId ? `/api/precedents/${editingId}` : '/api/precedents'
            const method = editingId ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                resetForm()
                fetchPrecedents()
            }
        } catch (error) {
            console.error('Failed to save precedent:', error)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this precedent?')) return

        try {
            await fetch(`/api/precedents/${id}`, { method: 'DELETE' })
            fetchPrecedents()
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    async function togglePublish(id: string, isPublished: boolean) {
        try {
            await fetch(`/api/precedents/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_published: !isPublished })
            })
            fetchPrecedents()
        } catch (error) {
            console.error('Failed to toggle publish:', error)
        }
    }

    function editPrecedent(precedent: Precedent) {
        setEditingId(precedent.id)
        setFormData({
            title: precedent.title || '',
            title_ar: precedent.title_ar || '',
            summary: precedent.summary || '',
            summary_ar: '',
            pattern_id: precedent.pattern_id,
            governorate: precedent.governorate || '',
            source_url: '',
            source_name: '',
            trust_level: precedent.trust_level || 'medium',
            full_text: '',
            key_lessons: [''],
            is_published: precedent.is_published
        })
        setShowForm(true)
    }

    function resetForm() {
        setEditingId(null)
        setShowForm(false)
        setFormData({
            title: '',
            title_ar: '',
            summary: '',
            summary_ar: '',
            pattern_id: 'P1',
            governorate: '',
            source_url: '',
            source_name: '',
            trust_level: 'medium',
            full_text: '',
            key_lessons: [''],
            is_published: false
        })
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-text dark:text-dark-text">
                    Precedent Management
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Precedent
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                    <input
                        type="text"
                        placeholder="Search precedents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface"
                    />
                </div>
                <select
                    value={patternFilter}
                    onChange={(e) => setPatternFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface"
                >
                    <option value="">All Patterns</option>
                    {PATTERNS.map(p => (
                        <option key={p.id} value={p.id}>{p.id}: {p.name}</option>
                    ))}
                </select>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingId ? 'Edit Precedent' : 'New Precedent'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Title (Arabic)</label>
                                <input
                                    type="text"
                                    value={formData.title_ar}
                                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg"
                                    dir="rtl"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Summary</label>
                            <textarea
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                required
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Pattern</label>
                                <select
                                    value={formData.pattern_id}
                                    onChange={(e) => setFormData({ ...formData, pattern_id: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg"
                                >
                                    {PATTERNS.map(p => (
                                        <option key={p.id} value={p.id}>{p.id}: {p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Governorate</label>
                                <input
                                    type="text"
                                    value={formData.governorate}
                                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                                    placeholder="e.g., Aleppo"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Trust Level</label>
                                <select
                                    value={formData.trust_level}
                                    onChange={(e) => setFormData({ ...formData, trust_level: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg"
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Source Name</label>
                                <input
                                    type="text"
                                    value={formData.source_name}
                                    onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                                    placeholder="e.g., OCHA Report 2023"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Source URL</label>
                                <input
                                    type="url"
                                    value={formData.source_url}
                                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_published"
                                checked={formData.is_published}
                                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                className="w-4 h-4 rounded"
                            />
                            <label htmlFor="is_published" className="text-sm">Publish immediately</label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover"
                            >
                                {editingId ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 bg-gray-100 dark:bg-dark-bg rounded-xl hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="text-center py-12 text-text-light">Loading...</div>
            ) : precedents.length === 0 ? (
                <div className="text-center py-12 text-text-light">
                    No precedents found. Create one to get started.
                </div>
            ) : (
                <div className="space-y-4">
                    {precedents.map(precedent => (
                        <div
                            key={precedent.id}
                            className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 flex items-start justify-between"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                        {precedent.pattern_id}
                                    </span>
                                    {precedent.governorate && (
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-dark-bg rounded-full">
                                            {precedent.governorate}
                                        </span>
                                    )}
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${precedent.is_published
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {precedent.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-text dark:text-dark-text">
                                    {precedent.title}
                                </h3>
                                <p className="text-sm text-text-light dark:text-dark-text-muted line-clamp-2">
                                    {precedent.summary}
                                </p>
                            </div>
                            <div className="flex gap-1 ml-4">
                                <button
                                    onClick={() => togglePublish(precedent.id, precedent.is_published)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg"
                                    title={precedent.is_published ? 'Unpublish' : 'Publish'}
                                >
                                    {precedent.is_published ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={() => editPrecedent(precedent)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(precedent.id)}
                                    className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
