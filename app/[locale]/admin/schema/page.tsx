import { SchemaDashboard } from '@/components/admin/schema/SchemaDashboard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { AdminSidebar } from '@/components/admin'

export default async function AdminSchemaPage() {
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

    if (profile?.role !== 'admin') {
        redirect('/feed')
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-6 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        <SchemaDashboard />
                    </div>
                </main>
            </div>
        </div>
    )
}
