import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdminSidebar, CoordinationCenter } from '@/components/admin'

export default async function AdminCoordinationPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    // Only admins and moderators can access coordination
    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
        redirect('/admin')
    }

    const isAdmin = profile.role === 'admin'

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />
            <div className="flex">
                <AdminSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <main className="flex-1 p-3 sm:p-6 md:p-8">
                        <div className="max-w-5xl mx-auto">
                            <CoordinationCenter isAdmin={isAdmin} />
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    )
}
