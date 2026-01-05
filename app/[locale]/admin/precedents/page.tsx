import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { AdminSidebar } from '@/components/admin'
import PrecedentManagementClient from './PrecedentManagementClient'

export default async function AdminPrecedentsPage() {
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
                <main className="flex-1 p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <PrecedentManagementClient />
                    </div>
                </main>
            </div>
        </div>
    )
}
