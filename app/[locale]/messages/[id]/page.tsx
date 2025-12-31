import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { MessageSquare, ArrowLeft } from 'lucide-react'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
    return {
        title: 'Messages | SyriaHub',
        description: 'Start a conversation'
    }
}

export default async function MessagesPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        notFound()
    }

    // Fetch the target user's profile
    const { data: targetProfile } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .eq('id', id)
        .single()

    if (!targetProfile) {
        notFound()
    }

    const isArabic = locale === 'ar'

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="flex-1">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Back button */}
                    <Link href={`/profile/${id}`} className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary mb-6">
                        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                        {isArabic ? 'العودة إلى الملف الشخصي' : 'Back to profile'}
                    </Link>

                    {/* Placeholder Card */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 dark:bg-secondary/10 flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-primary dark:text-secondary" />
                        </div>
                        <h1 className="text-2xl font-bold text-text dark:text-dark-text mb-2">
                            {isArabic ? `مراسلة ${targetProfile.name}` : `Message ${targetProfile.name}`}
                        </h1>
                        <p className="text-text-light dark:text-dark-text-muted mb-6">
                            {isArabic
                                ? 'ميزة الرسائل المباشرة قيد التطوير حالياً. ستتمكن قريباً من إرسال رسائل للباحثين مباشرة.'
                                : 'Direct messaging is currently under development. Soon you\'ll be able to send messages directly to researchers.'}
                        </p>
                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                <strong>{isArabic ? 'بديل:' : 'Alternative:'}</strong>{' '}
                                {isArabic
                                    ? 'يمكنك حالياً التعليق على منشورات هذا الباحث أو الإشارة إليه في منشوراتك.'
                                    : 'You can currently comment on this researcher\'s posts or mention them in your publications.'}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
