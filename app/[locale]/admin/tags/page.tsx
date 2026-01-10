'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdminSidebar } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Check, Tag as TagIcon, X, Palette, Pencil, Trash2, CheckCircle, Clock, Search, Filter } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useTranslations } from 'next-intl'

// Expanded curated palette - 40 colors to ensure 10+ always available
const TAG_COLORS = [
    // Primary palette - Syrian Identity colors
    '#1A3D40', '#4AA3A5', '#C41E3A', '#475569', '#4d7c6f',
    '#8b6f6f', '#4f5d75', '#8b7355', '#3b5f54', '#6b5454',
    '#3d4a5c', '#57534e', '#5c6b5e', '#7a6e5d', '#596e79',
    '#6b5b6b', '#4a5d6b', '#6b6b5b', '#5b4d4d',
    // Extended palette - additional professional colors
    '#2E5266', '#6E8898', '#9FB1BC', '#4A6670', '#3D5A6C',
    '#7B4B3A', '#8C6E5D', '#5D4E60', '#4E6151', '#6B5344',
    '#556270', '#4ECDC4', '#45B7D1', '#5C8374', '#435B66',
    '#352F44', '#5C5470', '#FAD02E', '#B9314F', '#2D4654',
    '#7D6B7D', '#6A7B76', '#5E6472', '#4A5859', '#6B4423',
    '#3E5641', '#594157', '#2C4251', '#7A5C58', '#516B6B',
]


// Detect if text is primarily Arabic
function detectLanguage(text: string): 'ar' | 'en' | 'mixed' {
    if (!text) return 'en'
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/g
    const arabicMatches = text.match(arabicPattern) || []
    const totalLetters = text.replace(/[\s\d\p{P}]/gu, '').length

    if (totalLetters === 0) return 'en'

    const arabicRatio = arabicMatches.length / totalLetters

    if (arabicRatio > 0.5) return 'ar'
    if (arabicRatio > 0.2) return 'mixed'
    return 'en'
}

interface UnverifiedTag {
    tag: string
    usage_count: number
}

interface ApprovedTag {
    id: string
    label: string
    label_ar: string | null
    color: string
    post_count: number
}

// Unified tag type for display
interface DisplayTag {
    id: string
    label: string
    label_ar: string | null
    color: string
    post_count: number
    status: 'approved' | 'pending'
}

type StatusFilter = 'all' | 'approved' | 'pending'

export default function AdminTagsPage() {
    const t = useTranslations('Admin.tagsPage')
    const tCommon = useTranslations('Common')

    // Unverified/Pending tags
    const [unverifiedTags, setUnverifiedTags] = useState<UnverifiedTag[]>([])

    // Approved tags
    const [approvedTags, setApprovedTags] = useState<ApprovedTag[]>([])

    // Filter state
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [search, setSearch] = useState('')

    // Loading states
    const [loading, setLoading] = useState(true)

    // Approve dialog state
    const [approvingTag, setApprovingTag] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
    const [newTagTranslation, setNewTagTranslation] = useState('')

    // Decline dialog state
    const [decliningTag, setDecliningTag] = useState<string | null>(null)
    const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
    const [declining, setDeclining] = useState(false)

    // Edit dialog state
    const [editingTag, setEditingTag] = useState<ApprovedTag | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editLabel, setEditLabel] = useState('')
    const [editLabelAr, setEditLabelAr] = useState('')
    const [editColor, setEditColor] = useState('')
    const [updating, setUpdating] = useState(false)

    // Delete dialog state
    const [deletingTag, setDeletingTag] = useState<ApprovedTag | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Used colors tracking
    const [usedColors, setUsedColors] = useState<string[]>([])

    // Detect language of the tag being approved
    const tagLanguage = approvingTag ? detectLanguage(approvingTag) : 'en'
    const isTagArabic = tagLanguage === 'ar'

    const supabase = createClient()
    const { showToast } = useToast()

    // Generate a unique random color that's not already used
    const generateUniqueColor = (usedSet: Set<string>): string => {
        let attempts = 0
        while (attempts < 100) {
            // Generate pleasing colors with good saturation/lightness
            const hue = Math.floor(Math.random() * 360)
            const saturation = 30 + Math.floor(Math.random() * 40) // 30-70%
            const lightness = 25 + Math.floor(Math.random() * 30) // 25-55%

            // Convert HSL to hex
            const h = hue / 360
            const s = saturation / 100
            const l = lightness / 100
            const a = s * Math.min(l, 1 - l)
            const f = (n: number) => {
                const k = (n + h * 12) % 12
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
                return Math.round(255 * color).toString(16).padStart(2, '0')
            }
            const hex = `#${f(0)}${f(8)}${f(4)}`.toUpperCase()

            if (!usedSet.has(hex)) {
                return hex
            }
            attempts++
        }
        // Fallback: just return a random hex
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    }

    // Get available colors for the palette - always ensures at least 10 options
    const getAvailableColors = useMemo(() => {
        const normalizedUsed = new Set(usedColors.map(c => c.toUpperCase()))

        // Start with curated colors that aren't used
        const available = TAG_COLORS.filter(c => !normalizedUsed.has(c.toUpperCase()))

        // If less than 10 available, generate additional unique colors
        const minColors = 10
        while (available.length < minColors) {
            const newColor = generateUniqueColor(new Set([...normalizedUsed, ...available.map(c => c.toUpperCase())]))
            available.push(newColor)
        }

        return available
    }, [usedColors])

    // Get available colors for editing (excludes current tag's color from "used")
    const getAvailableColorsForEdit = useMemo(() => {
        if (!editingTag) return getAvailableColors

        const normalizedUsed = new Set(
            usedColors
                .filter(c => c.toUpperCase() !== editingTag.color?.toUpperCase())
                .map(c => c.toUpperCase())
        )

        // Include the current tag's color as available
        const available = TAG_COLORS.filter(c => !normalizedUsed.has(c.toUpperCase()))

        // Ensure current color is included
        if (!available.some(c => c.toUpperCase() === editingTag.color?.toUpperCase())) {
            available.unshift(editingTag.color)
        }

        // If less than 10 available, generate additional unique colors
        const minColors = 10
        while (available.length < minColors) {
            const newColor = generateUniqueColor(new Set([...normalizedUsed, ...available.map(c => c.toUpperCase())]))
            available.push(newColor)
        }

        return available
    }, [usedColors, editingTag, getAvailableColors])

    // Suggest next available color for new tags
    const suggestNextColor = useMemo(() => {
        return getAvailableColors[0] || '#1A3D40'
    }, [getAvailableColors])


    // Combine and filter all tags for display
    const displayTags = useMemo((): DisplayTag[] => {
        const approved: DisplayTag[] = approvedTags.map(t => ({
            id: t.id,
            label: t.label,
            label_ar: t.label_ar,
            color: t.color,
            post_count: t.post_count,
            status: 'approved' as const
        }))

        const pending: DisplayTag[] = unverifiedTags.map(t => ({
            id: `pending-${t.tag}`,
            label: t.tag,
            label_ar: null,
            color: '#9CA3AF', // Gray for pending
            post_count: t.usage_count,
            status: 'pending' as const
        }))

        let combined = [...approved, ...pending]

        // Apply status filter
        if (statusFilter !== 'all') {
            combined = combined.filter(t => t.status === statusFilter)
        }

        // Apply search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase()
            combined = combined.filter(t =>
                t.label.toLowerCase().includes(searchLower) ||
                (t.label_ar && t.label_ar.toLowerCase().includes(searchLower))
            )
        }

        return combined
    }, [approvedTags, unverifiedTags, statusFilter, search])

    useEffect(() => {
        fetchAllData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchAllData = async () => {
        setLoading(true)
        await Promise.all([
            fetchUnverifiedTags(),
            fetchApprovedTags(),
            fetchUsedColors()
        ])
        setLoading(false)
    }

    const fetchUsedColors = async () => {
        const { data } = await supabase.from('tags').select('color')
        if (data) {
            setUsedColors(data.map(t => t.color).filter(Boolean))
        }
    }

    const fetchUnverifiedTags = async () => {
        const { data, error } = await supabase.rpc('get_unverified_tags')
        if (error) {
            console.error('Error fetching tags:', error)
        } else {
            setUnverifiedTags(data || [])
        }
    }

    const fetchApprovedTags = async () => {
        try {
            const { data: tags, error } = await supabase
                .from('tags')
                .select('id, label, label_ar, color')
                .order('label')

            if (error) throw error

            const { data: posts } = await supabase
                .from('posts')
                .select('tags')

            const tagCountMap: Record<string, number> = {}
            posts?.forEach((post) => {
                if (post.tags) {
                    post.tags.forEach((tag: string) => {
                        tagCountMap[tag] = (tagCountMap[tag] || 0) + 1
                    })
                }
            })

            const tagsWithCounts: ApprovedTag[] = (tags || []).map(tag => ({
                id: tag.id,
                label: tag.label,
                label_ar: tag.label_ar,
                color: tag.color || '#1A3D40',
                post_count: tagCountMap[tag.label] || 0
            }))

            setApprovedTags(tagsWithCounts)
        } catch (error) {
            console.error('Error fetching approved tags:', error)
        }
    }

    // Check if a color is unique (excluding a specific tag ID for edits)
    const isColorUnique = (color: string, excludeTagId?: string): boolean => {
        return !approvedTags.some(t =>
            t.color?.toUpperCase() === color.toUpperCase() && t.id !== excludeTagId
        )
    }

    // Check if a label is duplicate
    const isDuplicateLabel = (label: string, excludeTagId?: string): boolean => {
        const normalizedLabel = label.toLowerCase().trim()
        return approvedTags.some(t =>
            (t.label.toLowerCase().trim() === normalizedLabel ||
                t.label_ar?.toLowerCase().trim() === normalizedLabel) &&
            t.id !== excludeTagId
        )
    }

    const handleApproveClick = (tag: string) => {
        setApprovingTag(tag)
        setNewTagColor(suggestNextColor)
        setNewTagTranslation('')
        setDialogOpen(true)
    }

    const confirmApproval = async () => {
        if (!approvingTag) return

        if (!isColorUnique(newTagColor)) {
            showToast(t('colorNotUnique'), 'error')
            return
        }

        if (isDuplicateLabel(approvingTag)) {
            showToast(t('duplicateLabel'), 'error')
            return
        }

        try {
            const insertData = isTagArabic
                ? {
                    label: newTagTranslation || approvingTag,
                    label_ar: approvingTag,
                    color: newTagColor,
                }
                : {
                    label: approvingTag,
                    label_ar: newTagTranslation || null,
                    color: newTagColor,
                }

            const { error } = await supabase
                .from('tags')
                .insert(insertData)

            if (error) throw error

            showToast(t('approveSuccess', { tag: approvingTag }), 'success')
            setDialogOpen(false)
            fetchAllData()
        } catch (error) {
            console.error('Error approving tag:', error)
            showToast(t('approveFail'), 'error')
        }
    }

    const handleDeclineClick = (tag: string) => {
        setDecliningTag(tag)
        setDeclineDialogOpen(true)
    }

    const confirmDecline = async () => {
        if (!decliningTag) return

        setDeclining(true)
        try {
            const { data: posts, error: fetchError } = await supabase
                .from('posts')
                .select('id, tags')
                .contains('tags', [decliningTag])

            if (fetchError) throw fetchError

            for (const post of posts || []) {
                const newTags = (post.tags as string[]).filter(t => t !== decliningTag)
                await supabase.from('posts').update({ tags: newTags }).eq('id', post.id)
            }

            showToast(t('declineSuccess', { tag: decliningTag, count: posts?.length || 0 }), 'success')
            setDeclineDialogOpen(false)
            fetchAllData()
        } catch (error) {
            console.error('Error declining tag:', error)
            showToast(t('declineFail'), 'error')
        } finally {
            setDeclining(false)
        }
    }

    const handleEditClick = (tag: ApprovedTag) => {
        setEditingTag(tag)
        setEditLabel(tag.label)
        setEditLabelAr(tag.label_ar || '')
        setEditColor(tag.color)
        setEditDialogOpen(true)
    }

    const confirmEdit = async () => {
        if (!editingTag) return

        if (!isColorUnique(editColor, editingTag.id)) {
            showToast(t('colorNotUnique'), 'error')
            return
        }

        if (editLabel !== editingTag.label && isDuplicateLabel(editLabel, editingTag.id)) {
            showToast(t('duplicateLabel'), 'error')
            return
        }

        if (editLabelAr && editLabelAr !== editingTag.label_ar && isDuplicateLabel(editLabelAr, editingTag.id)) {
            showToast(t('duplicateLabel'), 'error')
            return
        }

        setUpdating(true)
        try {
            const { error } = await supabase
                .from('tags')
                .update({
                    label: editLabel.trim(),
                    label_ar: editLabelAr.trim() || null,
                    color: editColor
                })
                .eq('id', editingTag.id)

            if (error) throw error

            showToast(t('updateSuccess', { tag: editLabel }), 'success')
            setEditDialogOpen(false)
            fetchAllData()
        } catch (error) {
            console.error('Error updating tag:', error)
            showToast(t('updateFail'), 'error')
        } finally {
            setUpdating(false)
        }
    }

    const handleDeleteClick = (tag: ApprovedTag) => {
        setDeletingTag(tag)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!deletingTag) return

        setDeleting(true)
        try {
            const { error } = await supabase
                .from('tags')
                .delete()
                .eq('id', deletingTag.id)

            if (error) throw error

            showToast(t('deleteSuccess', { tag: deletingTag.label }), 'success')
            setDeleteDialogOpen(false)
            fetchAllData()
        } catch (error) {
            console.error('Error deleting tag:', error)
            showToast(t('deleteFail'), 'error')
        } finally {
            setDeleting(false)
        }
    }

    // Status badge component matching Content page style
    const getStatusBadge = (status: 'approved' | 'pending') => {
        const badges = {
            approved: {
                icon: CheckCircle,
                className: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
                label: t('statusApproved')
            },
            pending: {
                icon: Clock,
                className: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
                label: t('statusPending')
            }
        }
        const badge = badges[status]
        const Icon = badge.icon

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        )
    }

    const handleSearch = () => {
        // Search is already reactive via useMemo, but this can trigger explicit refresh if needed
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar />

            <div className="flex">
                <AdminSidebar />

                <div className="flex-1 flex flex-col min-w-0">
                    <main className="flex-1 p-3 sm:p-6 md:p-8">
                        <div className="max-w-6xl mx-auto">
                            {/* Header */}
                            <div className="mb-4 sm:mb-8">
                                <h1 className="text-xl sm:text-3xl font-display font-bold text-primary dark:text-dark-text">
                                    {t('title')}
                                </h1>
                                <p className="text-sm sm:text-base text-text-light dark:text-dark-text-muted mt-1 sm:mt-2">
                                    {t('subtitle')}
                                </p>
                            </div>

                            {/* Filters - matching Content page style */}
                            <div className="card p-3 sm:p-4 mb-4 sm:mb-6">
                                <div className="flex flex-col md:flex-row gap-3">
                                    {/* Search */}
                                    <div className="flex-1 relative order-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                                        <Input
                                            placeholder={t('searchPlaceholder')}
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-9 w-full"
                                        />
                                    </div>

                                    {/* Filters & Button Group */}
                                    <div className="flex flex-col sm:flex-row gap-3 order-2 md:items-center">
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            {/* Status Filter */}
                                            <div className="flex items-center gap-2 flex-1 sm:flex-none min-w-0">
                                                <Filter className="w-4 h-4 text-text-light shrink-0" />
                                                <Select
                                                    value={statusFilter}
                                                    onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                                                >
                                                    <SelectTrigger className="w-full sm:w-[140px] bg-white dark:bg-dark-surface">
                                                        <SelectValue placeholder={t('allTags')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">{t('allTags')}</SelectItem>
                                                        <SelectItem value="approved">{t('approvedTags')}</SelectItem>
                                                        <SelectItem value="pending">{t('pendingTags')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Button onClick={handleSearch} className="w-full sm:w-auto">
                                            {t('search')}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Tags Table */}
                            <div className="card overflow-hidden">
                                {loading ? (
                                    <div className="p-12 flex justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                ) : displayTags.length === 0 ? (
                                    <div className="p-12 text-center text-text-light dark:text-dark-text-muted">
                                        <TagIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>{t('noPending')}</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Mobile Card View */}
                                        <div className="md:hidden divide-y divide-gray-100 dark:divide-dark-border">
                                            {displayTags.map((tag) => (
                                                <div key={tag.id} className="p-4 space-y-3">
                                                    {/* Tag Label & Color */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <div
                                                                className="w-6 h-6 rounded-md flex-shrink-0"
                                                                style={{ backgroundColor: tag.color }}
                                                            />
                                                            <div>
                                                                <span className="font-medium text-text dark:text-dark-text">
                                                                    {tag.label}
                                                                </span>
                                                                {tag.label_ar && (
                                                                    <span className="text-sm text-text-light dark:text-dark-text-muted ml-2" dir="rtl">
                                                                        ({tag.label_ar})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {getStatusBadge(tag.status)}
                                                    </div>

                                                    {/* Meta */}
                                                    <div className="text-sm text-text-light dark:text-dark-text-muted">
                                                        {t('postCount', { count: tag.post_count })}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2 pt-1">
                                                        {tag.status === 'approved' ? (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleEditClick(approvedTags.find(t => t.id === tag.id)!)}
                                                                    className="flex-1"
                                                                >
                                                                    <Pencil className="w-4 h-4 mr-2" />
                                                                    {t('edit')}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteClick(approvedTags.find(t => t.id === tag.id)!)}
                                                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleApproveClick(tag.label)}
                                                                    className="flex-1"
                                                                >
                                                                    <Check className="w-4 h-4 mr-2" />
                                                                    {t('approve')}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeclineClick(tag.label)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop Table View */}
                                        <table className="w-full text-start hidden md:table">
                                            <thead>
                                                <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-border/50">
                                                    <th className="text-start p-4 text-sm font-medium text-text-light dark:text-dark-text-muted">{t('tableTag')}</th>
                                                    <th className="text-start p-4 text-sm font-medium text-text-light dark:text-dark-text-muted">{t('tableTranslation')}</th>
                                                    <th className="text-start p-4 text-sm font-medium text-text-light dark:text-dark-text-muted">{t('tableStatus')}</th>
                                                    <th className="text-start p-4 text-sm font-medium text-text-light dark:text-dark-text-muted">{t('tablePosts')}</th>
                                                    <th className="text-end p-4 text-sm font-medium text-text-light dark:text-dark-text-muted">{t('tableActions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                                                {displayTags.map((tag) => (
                                                    <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-6 h-6 rounded-md flex-shrink-0"
                                                                    style={{ backgroundColor: tag.color }}
                                                                />
                                                                <span className="font-medium text-text dark:text-dark-text">
                                                                    {tag.label}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-start">
                                                            <span className="text-sm text-text-light dark:text-dark-text-muted" dir="rtl">
                                                                {tag.label_ar || '—'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-start">
                                                            {getStatusBadge(tag.status)}
                                                        </td>
                                                        <td className="p-4 text-start">
                                                            <span className="text-sm text-text-light dark:text-dark-text-muted">
                                                                {tag.post_count}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {tag.status === 'approved' ? (
                                                                    <>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleEditClick(approvedTags.find(t => t.id === tag.id)!)}
                                                                            title={t('edit')}
                                                                        >
                                                                            <Pencil className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteClick(approvedTags.find(t => t.id === tag.id)!)}
                                                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                                            title={t('delete')}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleApproveClick(tag.label)}
                                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                            title={t('approve')}
                                                                        >
                                                                            <CheckCircle className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleDeclineClick(tag.label)}
                                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                            title={t('decline')}
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>

            {/* Approve Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('approveDialogTitle', { tag: approvingTag ?? '' })}</DialogTitle>
                        <DialogDescription>
                            {t('approveDialogDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="color" className="text-text dark:text-dark-text font-medium">
                                {t('tagColor')}
                            </Label>
                            <div className="flex items-center gap-3">
                                <label
                                    className="w-10 h-10 rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden cursor-pointer relative group flex-shrink-0"
                                    style={{ backgroundColor: newTagColor }}
                                >
                                    <input
                                        id="color"
                                        type="color"
                                        value={newTagColor}
                                        onChange={(e) => setNewTagColor(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                </label>
                                <Input
                                    type="text"
                                    value={newTagColor}
                                    onChange={(e) => setNewTagColor(e.target.value)}
                                    className="flex-1 font-mono text-sm bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-text dark:text-dark-text"
                                    placeholder={t('colorPlaceholder')}
                                />
                                <div
                                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                                    style={{ backgroundColor: newTagColor, color: '#fff' }}
                                >
                                    {approvingTag}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="labelTranslation" className="text-text dark:text-dark-text font-medium">
                                {isTagArabic ? t('labelEnglish') : t('labelArabic')}
                            </Label>
                            <Input
                                id="labelTranslation"
                                type="text"
                                value={newTagTranslation}
                                onChange={(e) => setNewTagTranslation(e.target.value)}
                                className="bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-text dark:text-dark-text"
                                placeholder={isTagArabic ? t('labelEnglishPlaceholder') : t('labelArabicPlaceholder')}
                                dir={isTagArabic ? 'ltr' : 'rtl'}
                            />
                            <p className="text-xs text-text-light dark:text-dark-text-muted">
                                {isTagArabic ? t('labelEnglishHint') : t('labelArabicHint')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-text dark:text-dark-text font-medium flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                {t('quickSelect')}
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {getAvailableColors.map((color) => {
                                    const isSelected = newTagColor.toUpperCase() === color.toUpperCase()
                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewTagColor(color)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all relative ${isSelected
                                                ? 'border-primary ring-2 ring-primary/30 scale-110'
                                                : 'border-transparent hover:scale-110 hover:border-gray-300'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        >
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="text-xs text-text-light dark:text-dark-text-muted">
                                {t('availableColorsHint')}
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>{tCommon('cancel')}</Button>
                        <Button onClick={confirmApproval}>{t('confirmApproval')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline Dialog */}
            <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">{t('declineDialogTitle', { tag: decliningTag ?? '' })}</DialogTitle>
                        <DialogDescription>
                            {t('declineDialogDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                {t('declineWarning', { tag: decliningTag ?? '' })}
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeclineDialogOpen(false)} disabled={declining}>
                            {tCommon('cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDecline}
                            disabled={declining}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {declining ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                            {t('confirmDecline')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('editDialogTitle', { tag: editingTag?.label ?? '' })}</DialogTitle>
                        <DialogDescription>
                            {t('editDialogDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editLabel" className="text-text dark:text-dark-text font-medium">
                                {t('labelEnglishEdit')}
                            </Label>
                            <Input
                                id="editLabel"
                                type="text"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                className="bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-text dark:text-dark-text"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editLabelAr" className="text-text dark:text-dark-text font-medium">
                                {t('labelArabicEdit')}
                            </Label>
                            <Input
                                id="editLabelAr"
                                type="text"
                                value={editLabelAr}
                                onChange={(e) => setEditLabelAr(e.target.value)}
                                className="bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-text dark:text-dark-text"
                                dir="rtl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editColor" className="text-text dark:text-dark-text font-medium">
                                {t('tagColor')}
                            </Label>
                            <div className="flex items-center gap-3">
                                <label
                                    className="w-10 h-10 rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden cursor-pointer relative group flex-shrink-0"
                                    style={{ backgroundColor: editColor }}
                                >
                                    <input
                                        id="editColor"
                                        type="color"
                                        value={editColor}
                                        onChange={(e) => setEditColor(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                </label>
                                <Input
                                    type="text"
                                    value={editColor}
                                    onChange={(e) => setEditColor(e.target.value)}
                                    className="flex-1 font-mono text-sm bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-text dark:text-dark-text"
                                    placeholder={t('colorPlaceholder')}
                                />
                                <div
                                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                                    style={{ backgroundColor: editColor, color: '#fff' }}
                                >
                                    {editLabel || editingTag?.label}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-text dark:text-dark-text font-medium flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                {t('quickSelect')}
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {getAvailableColorsForEdit.map((color) => {
                                    const isSelected = editColor.toUpperCase() === color.toUpperCase()
                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setEditColor(color)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all relative ${isSelected
                                                ? 'border-primary ring-2 ring-primary/30 scale-110'
                                                : 'border-transparent hover:scale-110 hover:border-gray-300'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        >
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="text-xs text-text-light dark:text-dark-text-muted">
                                {t('availableColorsHint')}
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={updating}>
                            {tCommon('cancel')}
                        </Button>
                        <Button onClick={confirmEdit} disabled={updating || !editLabel.trim()}>
                            {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('updateTag')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">
                            {t('deleteTagDialogTitle', { tag: deletingTag?.label ?? '' })}
                        </DialogTitle>
                        <DialogDescription>
                            {t('deleteTagDialogDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                {deletingTag && deletingTag.post_count > 0
                                    ? t('postCount', { count: deletingTag.post_count }) + ' will no longer show this tag as verified.'
                                    : 'This tag is not used in any posts.'}
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                            {tCommon('cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            {t('confirmDeleteTag')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
