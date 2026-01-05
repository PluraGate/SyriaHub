'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Pencil, Loader2, User, Building2, MapPin, Globe, Sparkles, ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ImageUpload'
import { CoverImageUpload } from '@/components/CoverImageUpload'
import { useTranslations } from 'next-intl'

interface Profile {
    id: string
    name: string
    bio: string | null
    affiliation: string | null
    location: string | null
    website: string | null
    research_interests: string[] | null
    avatar_url: string | null
    cover_image_url: string | null
}

interface EditProfileDialogProps {
    profile: Profile
}

export function EditProfileDialog({ profile }: EditProfileDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: profile.name || '',
        bio: profile.bio || '',
        affiliation: profile.affiliation || '',
        location: profile.location || '',
        website: profile.website || '',
        research_interests: profile.research_interests?.join(', ') || '',
        avatar_url: profile.avatar_url || '',
        cover_image_url: profile.cover_image_url || ''
    })

    const supabase = createClient()
    const { showToast } = useToast()
    const router = useRouter()
    const t = useTranslations('Profile')
    const tCommon = useTranslations('Common')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const interestsArray = formData.research_interests
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)

            // First verify user is authenticated
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) {
                throw new Error('You must be logged in to update your profile')
            }

            const { error, data } = await supabase
                .from('users')
                .update({
                    name: formData.name,
                    bio: formData.bio,
                    affiliation: formData.affiliation,
                    location: formData.location,
                    website: formData.website,
                    research_interests: interestsArray,
                    avatar_url: formData.avatar_url,
                    cover_image_url: formData.cover_image_url || null
                })
                .eq('id', profile.id)
                .select()

            if (error) {
                console.error('Supabase error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                })
                throw new Error(error.message || 'Failed to update profile')
            }

            // Check if the update actually affected any rows
            if (!data || data.length === 0) {
                throw new Error('No profile was updated. You may not have permission to edit this profile.')
            }

            showToast('Your profile has been successfully updated.', 'success')

            // Dispatch event to update ProfileCompletionCard
            window.dispatchEvent(new CustomEvent('profile-updated'))

            setOpen(false)
            router.refresh()
        } catch (error: unknown) {
            // Better error logging for Supabase PostgrestError
            const errorMessage = error instanceof Error
                ? error.message
                : typeof error === 'object' && error !== null
                    ? JSON.stringify(error, null, 2)
                    : String(error)
            console.error('Error updating profile:', errorMessage, error)

            // Check for specific error types
            const supabaseError = error as { message?: string; code?: string; details?: string }
            const displayMessage = supabaseError?.message || supabaseError?.details || 'Failed to update profile. Please try again.'
            showToast(displayMessage, 'error')
        } finally {
            setLoading(false)
        }
    }

    // Parse interests for preview
    const interestsList = formData.research_interests
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="w-4 h-4" />
                    {t('editProfile')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Cover Image Section */}
                <div className="relative">
                    {formData.cover_image_url ? (
                        <div
                            className="h-32 bg-cover bg-center"
                            style={{ backgroundImage: `url(${formData.cover_image_url})` }}
                        />
                    ) : (
                        <div className="h-32 bg-gradient-to-br from-primary via-primary-dark to-secondary" />
                    )}

                    {/* Always visible cover edit button - positioned left to avoid dialog X */}
                    <div className="absolute top-3 left-3">
                        <CoverImageUpload
                            value={formData.cover_image_url}
                            onChange={(url) => setFormData({ ...formData, cover_image_url: url || '' })}
                            userId={profile.id}
                            compact
                        />
                    </div>

                    {/* Header text overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <DialogHeader>
                            <DialogTitle className="text-white text-xl font-bold">{t('editProfile')}</DialogTitle>
                            <p className="text-white/70 text-sm">{t('updateInfo')}</p>
                        </DialogHeader>
                    </div>
                </div>

                {/* Avatar - overlapping header */}
                <div className="relative -mt-10 flex justify-center mb-2">
                    <ImageUpload
                        bucket="avatars"
                        path={profile.id}
                        currentImage={formData.avatar_url}
                        onUploadComplete={(url) => setFormData({ ...formData, avatar_url: url })}
                    />
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                    {/* Name field - prominent */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-text dark:text-dark-text">
                            <User className="w-4 h-4 text-gray-400" />
                            {t('displayName')}
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="h-11 text-base font-medium"
                            placeholder="Your full name"
                        />
                    </div>

                    {/* Bio field */}
                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-semibold">
                            {t('bio')}
                        </Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Share a little about yourself and your research focus..."
                            className="resize-none h-24"
                        />
                        <p className="text-xs text-text-light dark:text-dark-text-muted">
                            {formData.bio.length}/300 {t('characters')}
                        </p>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="affiliation" className="text-sm font-medium flex items-center gap-2 text-text dark:text-dark-text">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                {t('affiliation')}
                            </Label>
                            <Input
                                id="affiliation"
                                value={formData.affiliation}
                                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                                placeholder="University / Org"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2 text-text dark:text-dark-text">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {t('location')}
                                <span className="text-xs text-gray-400 font-normal">({tCommon('optional')})</span>
                            </Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="City, Country"
                            />
                        </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                        <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2 text-text dark:text-dark-text">
                            <Globe className="w-4 h-4 text-gray-400" />
                            {t('website')}
                        </Label>
                        <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://yourwebsite.com"
                        />
                    </div>

                    {/* Research Interests */}
                    <div className="space-y-2">
                        <Label htmlFor="interests" className="text-sm font-medium flex items-center gap-2 text-text dark:text-dark-text">
                            <Sparkles className="w-4 h-4 text-gray-400" />
                            {t('researchInterests')}
                        </Label>
                        <Input
                            id="interests"
                            value={formData.research_interests}
                            onChange={(e) => setFormData({ ...formData, research_interests: e.target.value })}
                            placeholder="e.g. Public Health, Migration, Policy"
                        />
                        {interestsList.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {interestsList.map((interest, i) => (
                                    <span
                                        key={i}
                                        className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light rounded-full"
                                    >
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-text-light dark:text-dark-text-muted"
                        >
                            {tCommon('cancel')}
                        </Button>
                        <Button type="submit" disabled={loading} className="min-w-[120px]">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {tCommon('saving')}
                                </>
                            ) : (
                                t('saveChanges')
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
