'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdminSidebar } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Loader2, Check, Tag as TagIcon, X, Palette } from 'lucide-react'
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
import { useTranslations } from 'next-intl'

// Curated palette aligned with Syrian Identity design guidelines
const TAG_COLORS = [
    '#1A3D40', '#4AA3A5', '#C41E3A', '#475569', '#4d7c6f',
    '#8b6f6f', '#4f5d75', '#8b7355', '#3b5f54', '#6b5454',
    '#3d4a5c', '#57534e', '#5c6b5e', '#7a6e5d', '#596e79',
    '#6b5b6b', '#4a5d6b', '#6b6b5b', '#5b4d4d',
]

// Detect if text is primarily Arabic
function detectLanguage(text: string): 'ar' | 'en' | 'mixed' {
    if (!text) return 'en'
    // Arabic Unicode range: \u0600-\u06FF (Arabic), \u0750-\u077F (Arabic Supplement)
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

export default function AdminTagsPage() {
    const t = useTranslations('Admin.tagsPage')
    const tCommon = useTranslations('Common')
    const [unverifiedTags, setUnverifiedTags] = useState<UnverifiedTag[]>([])
    const [loading, setLoading] = useState(true)
    const [approvingTag, setApprovingTag] = useState<string | null>(null)
    const [decliningTag, setDecliningTag] = useState<string | null>(null)
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
    const [newTagTranslation, setNewTagTranslation] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
    const [declining, setDeclining] = useState(false)
    const [usedColors, setUsedColors] = useState<string[]>([])

    // Detect language of the tag being approved
    const tagLanguage = approvingTag ? detectLanguage(approvingTag) : 'en'
    const isTagArabic = tagLanguage === 'ar'

    const supabase = createClient()
    const { showToast } = useToast()

    const suggestNextColor = useMemo(() => {
        const normalizedUsed = usedColors.map(c => c.toUpperCase())
        for (const color of TAG_COLORS) {
            if (!normalizedUsed.includes(color.toUpperCase())) {
                return color
            }
        }
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    }, [usedColors])

    useEffect(() => {
        fetchUnverifiedTags()
        fetchUsedColors()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchUsedColors = async () => {
        const { data } = await supabase.from('tags').select('color')
        if (data) {
            setUsedColors(data.map(t => t.color).filter(Boolean))
        }
    }

    const fetchUnverifiedTags = async () => {
        setLoading(true)
        const { data, error } = await supabase.rpc('get_unverified_tags')

        if (error) {
            console.error('Error fetching tags:', error)
            showToast(t('fetchFail'), 'error')
        } else {
            setUnverifiedTags(data || [])
        }
        setLoading(false)
    }

    const handleApproveClick = (tag: string) => {
        setApprovingTag(tag)
        setNewTagColor(suggestNextColor)
        setNewTagTranslation('')
        setDialogOpen(true)
    }

    const confirmApproval = async () => {
        if (!approvingTag) return

        try {
            // If tag is Arabic, store translation as English label; otherwise as Arabic label
            const insertData = isTagArabic
                ? {
                    label: newTagTranslation || approvingTag, // Use English translation as main label if provided
                    label_ar: approvingTag, // Original Arabic tag
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
            fetchUnverifiedTags()
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
            fetchUnverifiedTags()
        } catch (error) {
            console.error('Error declining tag:', error)
            showToast(t('declineFail'), 'error')
        } finally {
            setDeclining(false)
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar />

            <div className="flex">
                <AdminSidebar />

                <div className="flex-1 flex flex-col">
                    <main className="flex-1 p-6 md:p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text">
                                        {t('title')}
                                    </h1>
                                    <p className="text-text-light dark:text-dark-text-muted mt-2">
                                        {t('subtitle')}
                                    </p>
                                </div>
                                <div className="bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light px-4 py-2 rounded-lg font-medium">
                                    {t('pendingCount', { count: unverifiedTags.length })}
                                </div>
                            </div>

                            <div className="card overflow-hidden">
                                {loading ? (
                                    <div className="p-12 flex justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                ) : unverifiedTags.length === 0 ? (
                                    <div className="p-12 text-center text-text-light dark:text-dark-text-muted">
                                        <Check className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>{t('noPending')}</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-dark-border">
                                        {unverifiedTags.map((item) => (
                                            <div key={item.tag} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-gray-100 dark:bg-dark-border p-2 rounded-lg">
                                                        <TagIcon className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-text dark:text-dark-text">{item.tag}</h3>
                                                        <p className="text-sm text-text-light dark:text-dark-text-muted">
                                                            {t('usedIn', { count: item.usage_count })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeclineClick(item.tag)}
                                                        className="text-text-light dark:text-dark-text-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        {t('decline')}
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleApproveClick(item.tag)}>
                                                        <Check className="w-4 h-4 mr-1" />
                                                        {t('approve')}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>

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

                        {/* Dynamic Translation Input - shows English or Arabic based on tag language */}
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
                                {TAG_COLORS.map((color) => {
                                    const isUsed = usedColors.some(c => c.toUpperCase() === color.toUpperCase())
                                    const isSelected = newTagColor.toUpperCase() === color.toUpperCase()
                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewTagColor(color)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all relative ${isSelected
                                                ? 'border-primary ring-2 ring-primary/30 scale-110'
                                                : isUsed
                                                    ? 'border-gray-300 dark:border-gray-600 opacity-40'
                                                    : 'border-transparent hover:scale-110 hover:border-gray-300'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={isUsed ? t('alreadyUsed', { color }) : color}
                                        >
                                            {isUsed && !isSelected && (
                                                <X className="w-4 h-4 text-white absolute inset-0 m-auto opacity-70" />
                                            )}
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="text-xs text-text-light dark:text-dark-text-muted">
                                {t('usedColorHint')}
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>{tCommon('cancel')}</Button>
                        <Button onClick={confirmApproval}>{t('confirmApproval')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
        </div>
    )
}
