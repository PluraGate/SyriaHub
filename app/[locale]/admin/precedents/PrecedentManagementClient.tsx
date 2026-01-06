'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Plus, Edit, Trash2, Eye, EyeOff, Search, FileText, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge' // Assuming we can use a custom badge or tailwind classes if not present. I'll use tailwind for now as I didn't see Badge.tsx in the list, but I saw BadgeDisplay. 
// Actually, I didn't see Badge.tsx in components/ui, so I will stick to Tailwind badges for now or check if there is a generic one. 
// Wait, I will use valid Tailwind classes for badges to be safe.
import { EmptyState } from '@/components/ui/EmptyState'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'

interface Precedent {
    id: string
    title: string
    title_ar?: string
    summary: string
    summary_ar?: string
    pattern_id: string
    governorate?: string
    trust_level: string
    is_published: boolean
    created_at: string
    source_url?: string
    source_name?: string
    full_text?: string
    key_lessons?: string[]
}

const PATTERNS = [
    { id: 'P1', name: 'Network bottleneck', name_ar: 'اختناق الشبكة' },
    { id: 'P2', name: 'Service coverage', name_ar: 'تغطية الخدمات' },
    { id: 'P3', name: 'Cross-boundary', name_ar: 'عبر الحدود' },
    { id: 'P4', name: 'Access discontinuity', name_ar: 'انقطاع الوصول' },
    { id: 'P5', name: 'Aid activity', name_ar: 'نشاط المساعدات' }
]

export default function PrecedentManagementClient() {
    const t = useTranslations('Admin')
    const locale = useLocale()
    const { showToast } = useToast()
    const [precedents, setPrecedents] = useState<Precedent[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [patternFilter, setPatternFilter] = useState('all') // Changed default to 'all' for Select compatibility
    const [isDialogOpen, setIsDialogOpen] = useState(false)
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

    const fetchPrecedents = useCallback(async () => {
        setLoading(true)
        try {
            let url = '/api/precedents?limit=50'
            if (patternFilter && patternFilter !== 'all') url += `&pattern=${patternFilter}`
            if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`

            const res = await fetch(url)
            const data = await res.json()
            setPrecedents(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch precedents:', error)
            showToast('Failed to fetch precedents', 'error')
        }
        setLoading(false)
    }, [searchQuery, patternFilter, showToast])

    useEffect(() => {
        let isMounted = true

        const loadData = async () => {
            setLoading(true)
            try {
                let url = '/api/precedents?limit=50'
                if (patternFilter && patternFilter !== 'all') url += `&pattern=${patternFilter}`
                if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`

                const res = await fetch(url)
                const data = await res.json()
                if (isMounted) {
                    setPrecedents(Array.isArray(data) ? data : [])
                }
            } catch (error) {
                console.error('Failed to fetch precedents:', error)
                if (isMounted) {
                    showToast('Failed to fetch precedents', 'error')
                }
            }
            if (isMounted) {
                setLoading(false)
            }
        }

        loadData()

        return () => {
            isMounted = false
        }
    }, [searchQuery, patternFilter, showToast])

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
                showToast(editingId ? 'Precedent updated successfully' : 'Precedent created successfully', 'success')
                resetForm()
                fetchPrecedents()
            } else {
                showToast('Failed to save precedent', 'error')
            }
        } catch (error) {
            console.error('Failed to save precedent:', error)
            showToast('An unexpected error occurred', 'error')
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this precedent?')) return

        try {
            await fetch(`/api/precedents/${id}`, { method: 'DELETE' })
            showToast('Precedent deleted successfully', 'success')
            fetchPrecedents()
        } catch (error) {
            console.error('Failed to delete:', error)
            showToast('Failed to delete precedent', 'error')
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
            showToast(
                `Precedent is now ${isPublished ? 'hidden' : 'visible'}`,
                'info'
            )
        } catch (error) {
            console.error('Failed to toggle publish:', error)
            showToast('Failed to update status', 'error')
        }
    }

    function editPrecedent(precedent: Precedent) {
        setEditingId(precedent.id)
        setFormData({
            title: precedent.title || '',
            title_ar: precedent.title_ar || '',
            summary: precedent.summary || '',
            summary_ar: precedent.summary_ar || '',
            pattern_id: precedent.pattern_id,
            governorate: precedent.governorate || '',
            source_url: precedent.source_url || '',
            source_name: precedent.source_name || '',
            trust_level: precedent.trust_level || 'medium',
            full_text: precedent.full_text || '',
            key_lessons: precedent.key_lessons && precedent.key_lessons.length > 0 ? precedent.key_lessons : [''],
            is_published: precedent.is_published
        })
        setIsDialogOpen(true)
    }

    function resetForm() {
        setEditingId(null)
        setIsDialogOpen(false)
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

    // Helper to handle key lessons changes
    const handleKeyLessonChange = (index: number, value: string) => {
        const newLessons = [...formData.key_lessons]
        newLessons[index] = value
        setFormData({ ...formData, key_lessons: newLessons })
    }

    const addKeyLesson = () => {
        setFormData({ ...formData, key_lessons: [...formData.key_lessons, ''] })
    }

    const removeKeyLesson = (index: number) => {
        const newLessons = formData.key_lessons.filter((_, i) => i !== index)
        setFormData({ ...formData, key_lessons: newLessons })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text">
                        {t('precedentManagement.title')}
                    </h1>
                    <p className="text-text-light dark:text-dark-text-muted mt-1">
                        {t('precedentManagement.subtitle')}
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm} className="gap-2 shadow-lg hover:shadow-primary/25 transition-all">
                            <Plus className="w-4 h-4" />
                            {t('precedentManagement.addPrecedent')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border p-0 gap-0">
                        <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-dark-border">
                            <DialogTitle className="text-2xl font-display font-bold text-text dark:text-dark-text">
                                {editingId ? t('precedentManagement.editPrecedent') : t('precedentManagement.newPrecedent')}
                            </DialogTitle>
                            <DialogDescription className="text-text-light dark:text-dark-text-muted mt-1.5">
                                Add a historical case study that matches specific spatial patterns.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            {/* Section 1: Basic Information */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-light mb-2 flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> {t('precedentManagement.basicInfo')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-text dark:text-dark-text font-medium">{t('precedentManagement.titleEn')}</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            placeholder="e.g. 2018 Idlib Supply Route Crisis"
                                            className="bg-surface-elevated dark:bg-dark-bg border-gray-200 dark:border-dark-border"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="title_ar" className="text-text dark:text-dark-text font-medium">{t('precedentManagement.titleAr')}</Label>
                                        <Input
                                            id="title_ar"
                                            value={formData.title_ar}
                                            onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                                            dir="rtl"
                                            placeholder="مثال: أزمة طريق إمداد إدلب ٢٠١٨"
                                            className="bg-surface-elevated dark:bg-dark-bg border-gray-200 dark:border-dark-border font-arabic"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="summary" className="text-text dark:text-dark-text font-medium">{t('precedentManagement.summaryEn')}</Label>
                                        <Textarea
                                            id="summary"
                                            value={formData.summary}
                                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                            required
                                            rows={3}
                                            placeholder="Brief description of the event..."
                                            className="resize-none bg-surface-elevated dark:bg-dark-bg border-gray-200 dark:border-dark-border"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="summary_ar" className="text-text dark:text-dark-text font-medium">{t('precedentManagement.summaryAr')}</Label>
                                        <Textarea
                                            id="summary_ar"
                                            value={formData.summary_ar}
                                            onChange={(e) => setFormData({ ...formData, summary_ar: e.target.value })}
                                            dir="rtl"
                                            rows={3}
                                            placeholder="وصف موجز للحدث..."
                                            className="resize-none bg-surface-elevated dark:bg-dark-bg border-gray-200 dark:border-dark-border font-arabic"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Detailed Content */}
                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-light mb-2 flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> {t('precedentManagement.detailedContent')}
                                </h4>
                                <div className="space-y-2">
                                    <Label htmlFor="full_text" className="text-text dark:text-dark-text font-medium">{t('precedentManagement.fullAnalysis')}</Label>
                                    <Textarea
                                        id="full_text"
                                        value={formData.full_text}
                                        onChange={(e) => setFormData({ ...formData, full_text: e.target.value })}
                                        rows={6}
                                        placeholder="Detailed analysis of the precedent..."
                                        className="resize-none bg-surface-elevated dark:bg-dark-bg border-gray-200 dark:border-dark-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-text dark:text-dark-text font-medium">{t('precedentManagement.keyLessons')}</Label>
                                    {formData.key_lessons.map((lesson, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={lesson}
                                                onChange={(e) => handleKeyLessonChange(index, e.target.value)}
                                                placeholder={`Lesson ${index + 1}`}
                                                className="bg-surface-elevated dark:bg-dark-bg border-gray-200 dark:border-dark-border"
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeKeyLesson(index)} disabled={formData.key_lessons.length === 1}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addKeyLesson} className="mt-2 text-primary border-primary hover:bg-primary/5">
                                        <Plus className="w-3 h-3 mr-1" /> Add Lesson
                                    </Button>
                                </div>
                            </div>

                            {/* Section 2: Classification */}
                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-light mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3" /> {t('precedentManagement.classification')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-text dark:text-dark-text font-medium">{t('precedentManagement.patternType')}</Label>
                                        <Select
                                            value={formData.pattern_id}
                                            onValueChange={(val) => setFormData({ ...formData, pattern_id: val })}
                                        >
                                            <SelectTrigger className="bg-surface-elevated dark:bg-dark-bg border-gray-200 dark:border-dark-border text-text dark:text-dark-text">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border">
                                                {PATTERNS.map(p => (
                                                    <SelectItem key={p.id} value={p.id} className="text-text dark:text-dark-text focus:bg-gray-100 dark:focus:bg-dark-border">
                                                        <span className="font-semibold text-primary dark:text-primary-light">{p.id}:</span> {locale === 'ar' ? p.name_ar : p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="governorate" className="text-text dark:text-dark-text font-medium">{t('precedentManagement.governorate')}</Label>
                                        <Input
                                            id="governorate"
                                            value={formData.governorate}
                                            onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                                            placeholder="e.g. Aleppo"
                                            className="bg-surface-elevated dark:bg-dark-bg border-gray-200 dark:border-dark-border"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-text dark:text-dark-text font-medium">{t('precedentManagement.trustLevel')}</Label>
                                        <Select
                                            value={formData.trust_level}
                                            onValueChange={(val) => setFormData({ ...formData, trust_level: val })}
                                        >
                                            <SelectTrigger className="bg-surface-elevated dark:bg-dark-bg border-gray-200 dark:border-dark-border text-text dark:text-dark-text">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border">
                                                <SelectItem value="high" className="text-emerald-600 dark:text-emerald-400 font-medium focus:bg-gray-100 dark:focus:bg-dark-border">High Confidence</SelectItem>
                                                <SelectItem value="medium" className="text-amber-600 dark:text-amber-400 font-medium focus:bg-gray-100 dark:focus:bg-dark-border">Medium Confidence</SelectItem>
                                                <SelectItem value="low" className="text-red-600 dark:text-red-400 font-medium focus:bg-gray-100 dark:focus:bg-dark-border">Low Confidence</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Source & Verification */}
                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-light mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" /> Source Verification
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="source_name" className="text-text dark:text-dark-text font-medium">{t('precedentManagement.sourceName')}</Label>
                                        <Input
                                            id="source_name"
                                            value={formData.source_name}
                                            onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                                            placeholder="e.g. OCHA"
                                            className="bg-surface-elevated dark:bg-dark-bg border-gray-200 dark:border-dark-border"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="source_url" className="text-text dark:text-dark-text font-medium">{t('precedentManagement.sourceUrl')}</Label>
                                        <div className="relative">
                                            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light dark:text-dark-text-muted" />
                                            <Input
                                                id="source_url"
                                                type="url"
                                                value={formData.source_url}
                                                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                                                placeholder="https://..."
                                                className="pl-9 bg-surface-elevated dark:bg-dark-bg border-gray-200 dark:border-dark-border"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 pt-2 bg-surface-elevated dark:bg-dark-bg p-4 rounded-lg border border-gray-100 dark:border-dark-border">
                                <Switch
                                    id="is_published"
                                    checked={formData.is_published}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                                />
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_published" className="text-base font-medium text-text dark:text-dark-text cursor-pointer">{t('precedentManagement.publishImmediately')}</Label>
                                    <p className="text-xs text-text-light dark:text-dark-text-muted">
                                        {t('precedentManagement.publishHint')}
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="gap-3 sm:gap-0 pt-4 border-t border-gray-100 dark:border-dark-border">
                                <Button type="button" variant="outline" onClick={resetForm} className="border-gray-200 dark:border-dark-border text-text dark:text-dark-text hover:bg-surface-elevated dark:hover:bg-dark-border">{t('precedentManagement.cancel')}</Button>
                                <Button type="submit" className="bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25">
                                    {editingId ? t('precedentManagement.update') : t('precedentManagement.create')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder={t('precedentManagement.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 focus:border-primary dark:focus:border-primary focus:ring-primary/20 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 h-10"
                    />
                </div>
                <div className="w-full md:w-56">
                    <Select value={patternFilter} onValueChange={setPatternFilter}>
                        <SelectTrigger className="bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-900 dark:text-dark-text h-10 w-full">
                            <SelectValue placeholder={t('precedentManagement.allPatterns')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('precedentManagement.allPatterns')}
                            </SelectItem>
                            {PATTERNS.map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                    <span className="font-semibold text-primary">{p.id}:</span> {locale === 'ar' ? p.name_ar : p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-xl bg-gray-100 dark:bg-dark-surface animate-pulse" />
                    ))}
                </div>
            ) : precedents.length === 0 ? (
                <EmptyState
                    variant={searchQuery ? 'no-results' : 'no-posts'}
                    title={searchQuery ? t('precedentManagement.noResults') : t('precedentManagement.noPosts')}
                    description={searchQuery ? t('precedentManagement.noResultsDesc') : t('precedentManagement.noPostsDesc')}
                    actionLabel={searchQuery ? undefined : t('precedentManagement.create')}
                    onAction={searchQuery ? undefined : () => { resetForm(); setIsDialogOpen(true); }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {precedents.map(precedent => (
                        <Card key={precedent.id} className="flex flex-col hover:border-primary/50 transition-colors group">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex flex-wrap gap-1.5">
                                        <Badge variant="default">
                                            {precedent.pattern_id}
                                        </Badge>
                                        {precedent.governorate && (
                                            <Badge variant="secondary">
                                                {precedent.governorate}
                                            </Badge>
                                        )}
                                        <Badge variant={precedent.is_published ? 'success' : 'warning'}>
                                            {precedent.is_published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </div>
                                </div>
                                <CardTitle className="text-lg line-clamp-1 mt-2" title={precedent.title}>
                                    {precedent.title}
                                </CardTitle>
                                {precedent.title_ar && (
                                    <CardDescription className="font-arabic text-sm line-clamp-1">
                                        {precedent.title_ar}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1 pb-3">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {precedent.summary}
                                </p>
                                {precedent.source_url && (
                                    <a
                                        href={precedent.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 mt-2"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Source
                                    </a>
                                )}
                            </CardContent>
                            <CardFooter className="pt-2 border-t bg-muted/20 flex gap-2 justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePublish(precedent.id, precedent.is_published)}
                                    title={precedent.is_published ? "Unpublish" : "Publish"}
                                >
                                    {precedent.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editPrecedent(precedent)}
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(precedent.id)}
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
