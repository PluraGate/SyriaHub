import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdminSidebar } from '@/components/admin'
import { UserManagement } from '@/components/admin'

export default async function AdminUsersPage() {
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

    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
        redirect('/feed')
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />
            <div className="flex">
                <AdminSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <main className="flex-1 p-3 sm:p-6 md:p-8">
                        <div className="max-w-6xl mx-auto">
                            <h1 className="text-xl sm:text-2xl font-display font-bold text-primary dark:text-dark-text mb-4 sm:mb-6">
                                User Management
                            </h1>
                            <UserManagement />
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    )
}
