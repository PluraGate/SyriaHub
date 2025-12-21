import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { FeedbackList } from '@/components/feedback'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Feedback')
    return {
        title: t('adminTitle'),
        description: t('adminDescription'),
    }
}

export default async function AdminFeedbackPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    // Check if user is admin or moderator
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['admin', 'moderator'].includes(userData.role)) {
        redirect('/feed')
    }

    const t = await getTranslations('Feedback')

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={{ id: user.id, email: user.email }} />

            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-display font-bold text-text dark:text-dark-text">
                                {t('adminTitle')}
                            </h1>
                            <p className="text-text-light dark:text-dark-text-muted mt-2">
                                {t('adminDescription')}
                            </p>
                        </div>

                        <FeedbackList isAdmin={true} />
                    </div>
                </main>
            </div>
        </div>
    )
}
