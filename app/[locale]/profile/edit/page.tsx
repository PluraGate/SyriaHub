
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { ProfileEditForm } from '@/components/ProfileEditForm'

export default async function ProfileEditPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error || !profile) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="container-custom max-w-2xl py-12">
                <div className="card p-8">
                    <h1 className="text-2xl font-display font-bold text-primary dark:text-dark-text mb-6">
                        Edit Profile
                    </h1>

                    <ProfileEditForm profile={profile} />
                </div>
            </main>
        </div>
    )
}
