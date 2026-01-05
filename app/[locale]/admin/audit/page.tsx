import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { AdminSidebar, AuditLogs } from '@/components/admin'

export default async function AdminAuditPage() {
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

    // Only admins can view audit logs
    if (!profile || profile.role !== 'admin') {
        redirect('/admin')
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-6 md:p-8">
                    <div className="max-w-5xl mx-auto">
                        <AuditLogs />
                    </div>
                </main>
            </div>
        </div>
    )
}
