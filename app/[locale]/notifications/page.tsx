import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { NotificationsPageContent } from '@/components/NotificationsPageContent'

export const metadata = {
    title: 'Notifications | Syrealize',
    description: 'View and manage your notifications',
}

export default async function NotificationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />
            <main className="container-custom py-8">
                <NotificationsPageContent userId={user.id} />
            </main>
            <Footer />
        </div>
    )
}
