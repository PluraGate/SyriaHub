import { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { SearchAnalytics } from '@/components/admin/SearchAnalytics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Search Analytics | Admin - SyriaHub',
    description: 'View search analytics and user search behavior'
}

export default async function SearchAnalyticsPage() {
    const supabase = await createClient()

    // Check if user is authenticated and has admin/moderator role
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['admin', 'moderator'].includes(userData.role)) {
        redirect('/feed')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
            <Navbar user={{ id: user.id, email: user.email }} />

            <div className="flex">
                <AdminSidebar />

                <div className="flex-1 flex flex-col min-w-0">
                    <main className="flex-1 p-3 sm:p-6 overflow-x-hidden">
                        <SearchAnalytics />
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    )
}
