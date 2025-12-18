import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { SettingsPage } from '@/components/SettingsPage'

export const metadata = {
    title: 'Settings | SyriaHub',
    description: 'Manage your account settings and preferences',
}

export default async function Settings() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />
            <div className="container-custom py-8">
                <SettingsPage user={{ id: user.id, email: user.email }} />
            </div>
        </div>
    )
}
