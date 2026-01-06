'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdminSidebar } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Loader2, Award, Search, Pencil, Trash2, GitMerge, Check, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const SKILL_CATEGORIES = [
    'Research Methods',
    'Technical',
    'Domain Knowledge',
    'Work Field',
    'Practical Expertise'
]

interface Skill {
    id: string
    name: string
    category: string
    is_recognized: boolean
    created_by: string | null
    created_at: string
    user_count: number
    creator_name?: string | null
}

export default function AdminSkillsPage() {
    const t = useTranslations('Admin.skillsPage')
    const tCommon = useTranslations('Common')
    const [skills, setSkills] = useState<Skill[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [recognizedFilter, setRecognizedFilter] = useState<'all' | 'recognized' | 'user'>('all')

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
    const [editName, setEditName] = useState('')
    const [editCategory, setEditCategory] = useState('')
    const [editRecognized, setEditRecognized] = useState(false)
    const [saving, setSaving] = useState(false)

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Merge dialog state
    const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
    const [mergingSkill, setMergingSkill] = useState<Skill | null>(null)
    const [mergeTargetId, setMergeTargetId] = useState<string>('')
    const [merging, setMerging] = useState(false)

    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()

    useEffect(() => {
        fetchSkills()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchSkills = async () => {
        setLoading(true)
        try {
            // Get all skills with user count
            const { data: skillsData, error: skillsError } = await supabase
                .from('skills')
                .select('*')
                .order('name')

            if (skillsError) throw skillsError

            // Get user counts for each skill
            const { data: userSkillsCounts } = await supabase
                .from('user_skills')
                .select('skill_id')

            const countMap: Record<string, number> = {}
            userSkillsCounts?.forEach(us => {
                countMap[us.skill_id] = (countMap[us.skill_id] || 0) + 1
            })

            // Get creator names
            const creatorIds = skillsData?.filter(s => s.created_by).map(s => s.created_by) || []
            const { data: creators } = await supabase
                .from('users')
                .select('id, name')
                .in('id', creatorIds)

            const creatorMap: Record<string, string> = {}
            creators?.forEach(c => {
                creatorMap[c.id] = c.name || 'Unknown'
            })

            const enrichedSkills: Skill[] = (skillsData || []).map(s => ({
                ...s,
                user_count: countMap[s.id] || 0,
                creator_name: s.created_by ? creatorMap[s.created_by] : null
            }))

            setSkills(enrichedSkills)
        } catch (error) {
            console.error('Error fetching skills:', error)
            showToast(t('fetchFail'), 'error')
        } finally {
            setLoading(false)
        }
    }

    // Filter skills
    const filteredSkills = useMemo(() => {
        return skills.filter(skill => {
            // Search filter
            if (searchQuery && !skill.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false
            }
            // Category filter
            if (categoryFilter !== 'all' && skill.category !== categoryFilter) {
                return false
            }
            // Recognized filter
            if (recognizedFilter === 'recognized' && !skill.is_recognized) {
                return false
            }
            if (recognizedFilter === 'user' && skill.is_recognized) {
                return false
            }
            return true
        })
    }, [skills, searchQuery, categoryFilter, recognizedFilter])

    // Available merge targets (exclude the skill being merged)
    const mergeTargets = useMemo(() => {
        if (!mergingSkill) return []
        return skills.filter(s => s.id !== mergingSkill.id).sort((a, b) => a.name.localeCompare(b.name))
    }, [skills, mergingSkill])

    const handleEditClick = (skill: Skill) => {
        setEditingSkill(skill)
        setEditName(skill.name)
        setEditCategory(skill.category)
        setEditRecognized(skill.is_recognized)
        setEditDialogOpen(true)
    }

    const handleSaveEdit = async () => {
        if (!editingSkill || !editName.trim()) return
        setSaving(true)

        try {
            const { error } = await supabase
                .from('skills')
                .update({
                    name: editName.trim(),
                    category: editCategory,
                    is_recognized: editRecognized
                })
                .eq('id', editingSkill.id)

            if (error) throw error

            showToast(t('updateSuccess'), 'success')
            setEditDialogOpen(false)
            fetchSkills()
        } catch (error) {
            console.error('Error updating skill:', error)
            showToast(t('updateFail'), 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteClick = (skill: Skill) => {
        setDeletingSkill(skill)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!deletingSkill) return
        setDeleting(true)

        try {
            // First delete all user_skills references
            await supabase
                .from('user_skills')
                .delete()
                .eq('skill_id', deletingSkill.id)

            // Then delete the skill
            const { error } = await supabase
                .from('skills')
                .delete()
                .eq('id', deletingSkill.id)

            if (error) throw error

            showToast(t('deleteSuccess'), 'success')
            setDeleteDialogOpen(false)
            fetchSkills()
        } catch (error) {
            console.error('Error deleting skill:', error)
            showToast(t('deleteFail'), 'error')
        } finally {
            setDeleting(false)
        }
    }

    const handleMergeClick = (skill: Skill) => {
        setMergingSkill(skill)
        setMergeTargetId('')
        setMergeDialogOpen(true)
    }

    const handleConfirmMerge = async () => {
        if (!mergingSkill || !mergeTargetId) return
        setMerging(true)

        try {
            // Update all user_skills to point to the target skill
            // First, get users who have both skills (to avoid duplicates)
            const { data: usersWithTarget } = await supabase
                .from('user_skills')
                .select('user_id')
                .eq('skill_id', mergeTargetId)

            const targetUserIds = new Set(usersWithTarget?.map(u => u.user_id) || [])

            // Update user_skills that don't conflict
            const { data: usersWithSource } = await supabase
                .from('user_skills')
                .select('user_id')
                .eq('skill_id', mergingSkill.id)

            // Delete duplicates (users who have both)
            for (const us of usersWithSource || []) {
                if (targetUserIds.has(us.user_id)) {
                    await supabase
                        .from('user_skills')
                        .delete()
                        .eq('skill_id', mergingSkill.id)
                        .eq('user_id', us.user_id)
                }
            }

            // Update remaining to point to target
            await supabase
                .from('user_skills')
                .update({ skill_id: mergeTargetId })
                .eq('skill_id', mergingSkill.id)

            // Delete the merged skill
            await supabase
                .from('skills')
                .delete()
                .eq('id', mergingSkill.id)

            showToast(t('mergeSuccess'), 'success')
            setMergeDialogOpen(false)
            fetchSkills()
        } catch (error) {
            console.error('Error merging skills:', error)
            showToast(t('mergeFail'), 'error')
        } finally {
            setMerging(false)
        }
    }

    const categoryColors: Record<string, string> = {
        'Research Methods': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        'Technical': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        'Domain Knowledge': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        'Work Field': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
        'Practical Expertise': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar />

            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 p-3 sm:p-6 md:p-8 min-w-0">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-8">
                            <div>
                                <h1 className="text-xl sm:text-3xl font-display font-bold text-primary dark:text-dark-text">
                                    {t('title')}
                                </h1>
                                <p className="text-sm sm:text-base text-text-light dark:text-dark-text-muted mt-1 sm:mt-2">
                                    {t('subtitle')}
                                </p>
                            </div>
                            <div className="bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base self-start sm:self-auto">
                                {t('totalSkills', { count: skills.length })}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-3 sm:p-4 mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                {/* Search */}
                                <div className="flex-1 min-w-0 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder={t('searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-white dark:bg-dark-bg text-sm"
                                    />
                                </div>

                                {/* Category Filter */}
                                <Select
                                    value={categoryFilter}
                                    onValueChange={(value) => setCategoryFilter(value)}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-dark-surface text-sm">
                                        <SelectValue placeholder={t('allCategories')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('allCategories')}</SelectItem>
                                        {SKILL_CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Recognized Filter */}
                                <div className="flex rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden w-full sm:w-auto">
                                    <button
                                        onClick={() => setRecognizedFilter('all')}
                                        className={cn(
                                            "flex-1 sm:flex-none px-2 sm:px-3 py-2 text-xs sm:text-sm transition-colors",
                                            recognizedFilter === 'all'
                                                ? "bg-primary text-white"
                                                : "bg-white dark:bg-dark-bg text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border"
                                        )}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setRecognizedFilter('recognized')}
                                        className={cn(
                                            "flex-1 sm:flex-none px-2 sm:px-3 py-2 text-xs sm:text-sm transition-colors border-x border-gray-200 dark:border-dark-border",
                                            recognizedFilter === 'recognized'
                                                ? "bg-primary text-white"
                                                : "bg-white dark:bg-dark-bg text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border"
                                        )}
                                    >
                                        {t('recognized')}
                                    </button>
                                    <button
                                        onClick={() => setRecognizedFilter('user')}
                                        className={cn(
                                            "flex-1 sm:flex-none px-2 sm:px-3 py-2 text-xs sm:text-sm transition-colors",
                                            recognizedFilter === 'user'
                                                ? "bg-primary text-white"
                                                : "bg-white dark:bg-dark-bg text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border"
                                        )}
                                    >
                                        {t('userCreated')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Skills List */}
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                            {loading ? (
                                <div className="p-12 flex justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : filteredSkills.length === 0 ? (
                                <div className="p-12 text-center text-text-light dark:text-dark-text-muted">
                                    <Award className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>{t('noSkills')}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-dark-border">
                                    {filteredSkills.map((skill) => (
                                        <div key={skill.id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors">
                                            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                                <div className={cn(
                                                    "p-2 rounded-lg flex-shrink-0",
                                                    skill.is_recognized ? "bg-primary/10" : "bg-gray-100 dark:bg-dark-border"
                                                )}>
                                                    <Award className={cn(
                                                        "w-4 h-4 sm:w-5 sm:h-5",
                                                        skill.is_recognized ? "text-primary" : "text-text-light dark:text-dark-text-muted"
                                                    )} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                        <h3 className="font-medium text-sm sm:text-base text-text dark:text-dark-text">
                                                            {skill.name}
                                                        </h3>
                                                        {skill.is_recognized && (
                                                            <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-primary/10 text-primary font-medium">
                                                                {t('recognized')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <span className={cn(
                                                            "px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full font-medium",
                                                            categoryColors[skill.category] || 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'
                                                        )}>
                                                            {skill.category}
                                                        </span>
                                                        <span className="text-xs sm:text-sm text-text-light dark:text-dark-text-muted">
                                                            {t('usedBy', { count: skill.user_count })}
                                                        </span>
                                                        {skill.creator_name && (
                                                            <span className="text-xs sm:text-sm text-text-light dark:text-dark-text-muted hidden sm:inline">
                                                                • {t('createdBy')} {skill.creator_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditClick(skill)}
                                                        className="text-text-light dark:text-dark-text-muted hover:text-primary p-1.5 sm:p-2 h-auto"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMergeClick(skill)}
                                                        className="text-text-light dark:text-dark-text-muted hover:text-amber-600 p-1.5 sm:p-2 h-auto"
                                                    >
                                                        <GitMerge className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(skill)}
                                                        className="text-text-light dark:text-dark-text-muted hover:text-red-600 p-1.5 sm:p-2 h-auto"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('editDialogTitle', { name: editingSkill?.name ?? '' })}</DialogTitle>
                        <DialogDescription>
                            {t('editDialogDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="skillName" className="text-text dark:text-dark-text font-medium">
                                {t('skillName')}
                            </Label>
                            <Input
                                id="skillName"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-white dark:bg-dark-bg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="skillCategory" className="text-text dark:text-dark-text font-medium">
                                {t('skillCategory')}
                            </Label>
                            <Select
                                value={editCategory}
                                onValueChange={(value) => setEditCategory(value)}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-dark-surface">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SKILL_CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setEditRecognized(!editRecognized)}
                                className={cn(
                                    "w-10 h-6 rounded-full transition-colors relative",
                                    editRecognized ? "bg-primary" : "bg-gray-300 dark:bg-dark-border"
                                )}
                            >
                                <span className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                    editRecognized ? "left-5" : "left-1"
                                )} />
                            </button>
                            <div>
                                <Label className="text-text dark:text-dark-text font-medium">
                                    {t('markRecognized')}
                                </Label>
                                <p className="text-xs text-text-light dark:text-dark-text-muted">
                                    {t('recognizedHint')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
                            {tCommon('cancel')}
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={saving || !editName.trim()}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {tCommon('save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">
                            {t('deleteDialogTitle', { name: deletingSkill?.name ?? '' })}
                        </DialogTitle>
                        <DialogDescription>
                            {t('deleteDialogDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                {t('deleteWarning', { count: deletingSkill?.user_count ?? 0 })}
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                            {tCommon('cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            {t('confirmDelete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Merge Dialog */}
            <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-amber-600 dark:text-amber-400">
                            {t('mergeDialogTitle', { name: mergingSkill?.name ?? '' })}
                        </DialogTitle>
                        <DialogDescription>
                            {t('mergeDialogDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mergeTarget" className="text-text dark:text-dark-text font-medium">
                                {t('mergeInto')}
                            </Label>
                            <Select
                                value={mergeTargetId}
                                onValueChange={(value) => setMergeTargetId(value)}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-dark-surface">
                                    <SelectValue placeholder={t('selectMergeTarget')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {mergeTargets.map(skill => (
                                        <SelectItem key={skill.id} value={skill.id}>
                                            {skill.name} ({skill.category})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setMergeDialogOpen(false)} disabled={merging}>
                            {tCommon('cancel')}
                        </Button>
                        <Button
                            onClick={handleConfirmMerge}
                            disabled={merging || !mergeTargetId}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {merging ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitMerge className="w-4 h-4 mr-2" />}
                            {t('confirmMerge')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    )
}
