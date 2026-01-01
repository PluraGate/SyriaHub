'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { ImageUpload } from '@/components/ImageUpload'
import { Loader2 } from 'lucide-react'

interface ProfileEditFormProps {
    profile: any
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: profile.name || '',
        bio: profile.bio || '',
        affiliation: profile.affiliation || '',
        avatar_url: profile.avatar_url || ''
    })

    const router = useRouter()
    const { showToast } = useToast()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    name: formData.name,
                    bio: formData.bio,
                    affiliation: formData.affiliation,
                    avatar_url: formData.avatar_url
                })
                .eq('id', profile.id)

            if (error) throw error

            showToast('Profile updated successfully', 'success')
            router.push(`/profile/${profile.id}`)
            router.refresh()
        } catch (error: any) {
            console.error('Error updating profile:', error)
            showToast('Failed to update profile', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-6">
                <ImageUpload
                    bucket="avatars"
                    path={profile.id} // Store in a folder named after the user ID
                    currentImage={formData.avatar_url}
                    onUploadComplete={(url) => setFormData({ ...formData, avatar_url: url })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="affiliation">Affiliation</Label>
                <Input
                    id="affiliation"
                    value={formData.affiliation}
                    onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                    placeholder="University, Organization, or Company"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                />
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
