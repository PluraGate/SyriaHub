import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CorrespondenceDetail } from '@/components/correspondence'
import { redirect, notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Correspondence' })

    return {
        title: `${t('title')} | SyriaHub`,
        description: 'View correspondence'
    }
}

export default async function CorrespondenceDetailPage({
    params
}: {
    params: Promise<{ locale: string; id: string }>
}) {
    const { locale, id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/${locale}/login`)
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
        notFound()
    }

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <CorrespondenceDetail
                        correspondenceId={id}
                        locale={locale}
                        currentUserId={user.id}
                    />
                </div>
            </main>

            <Footer />
        </div>
    )
}
