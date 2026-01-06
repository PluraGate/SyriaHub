import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdminSidebar } from '@/components/admin'
import { PlatformSettingsDashboard } from '@/components/admin/settings/PlatformSettingsDashboard'

export default async function PlatformSettingsPage() {
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

    // Only admins can access platform settings
    if (profile?.role !== 'admin') {
        redirect('/admin')
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />
            <div className="flex">
                <AdminSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <main className="flex-1 p-3 sm:p-6 md:p-8">
                        <div className="max-w-4xl mx-auto">
                            <PlatformSettingsDashboard />
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    )
}
