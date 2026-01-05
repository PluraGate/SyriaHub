import Link from 'next/link'
import { ArrowLeft, FileQuestion } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default async function NotFound() {
    const t = await getTranslations('Common')

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar />
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center mb-8 mx-auto">
                    <FileQuestion className="w-12 h-12 text-gray-400" />
                </div>

                <h1 className="text-4xl font-bold text-text dark:text-dark-text mb-4">
                    404 - {t('pageNotFound' as any) || 'Page Not Found'}
                </h1>

                <p className="text-lg text-text-light dark:text-dark-text-muted mb-12 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link
                    href="/feed"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('backToHome' as any) || 'Back to Home'}
                </Link>
            </main>
            <Footer />
        </div>
    )
}
