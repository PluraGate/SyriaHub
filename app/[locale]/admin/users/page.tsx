import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
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
                <AdminSidebar className="sticky top-0 h-[calc(100vh-64px)]" />
                <main className="flex-1 p-6 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-2xl font-display font-bold text-primary dark:text-dark-text mb-6">
                            User Management
                        </h1>
                        <UserManagement />
                    </div>
                </main>
            </div>
        </div>
    )
}
