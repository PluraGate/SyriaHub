'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Pencil, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ImageUpload'

interface Profile {
    id: string
    name: string
    bio: string | null
    affiliation: string | null
    location: string | null
    website: string | null
    research_interests: string[] | null
    avatar_url: string | null
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
        avatar_url: profile.avatar_url || ''
    })

    const supabase = createClient()
    const { showToast } = useToast()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const interestsArray = formData.research_interests
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)

            const { error } = await supabase
                .from('users')
                .update({
                    name: formData.name,
                    bio: formData.bio,
                    affiliation: formData.affiliation,
                    location: formData.location,
                    website: formData.website,
                    research_interests: interestsArray,
                    avatar_url: formData.avatar_url
                })
                .eq('id', profile.id)

            if (error) throw error

            showToast('Your profile has been successfully updated.', 'success')

            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error updating profile:', error)
            showToast('Failed to update profile. Please try again.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="w-4 h-4" />
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="flex justify-center mb-6">
                        <ImageUpload
                            bucket="avatars"
                            path={profile.id}
                            currentImage={formData.avatar_url}
                            onUploadComplete={(url) => setFormData({ ...formData, avatar_url: url })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            className="resize-none h-24"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="affiliation">Affiliation</Label>
                            <Input
                                id="affiliation"
                                value={formData.affiliation}
                                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                                placeholder="University / Organization"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="City, Country"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="interests">Research Interests (comma separated)</Label>
                        <Input
                            id="interests"
                            value={formData.research_interests}
                            onChange={(e) => setFormData({ ...formData, research_interests: e.target.value })}
                            placeholder="e.g. Humanitarian Aid, Public Health, Migration"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
