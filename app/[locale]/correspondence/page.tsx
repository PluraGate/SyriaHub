import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CorrespondenceInbox } from '@/components/correspondence'
import { redirect } from 'next/navigation'
import { Mail } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Correspondence' })

    return {
        title: `${t('title')} | SyriaHub`,
        description: 'Research correspondence inbox'
    }
}

export default async function CorrespondencePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const t = await getTranslations({ locale, namespace: 'Correspondence' })

    if (!user) {
        redirect(`/${locale}/login`)
    }

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text">
                                {t('title')}
                            </h1>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                Formal inquiries and clarification requests
                            </p>
                        </div>
                    </div>

                    {/* Inbox Component */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
                        <CorrespondenceInbox locale={locale} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
