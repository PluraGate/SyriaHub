import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { FaqPageClient } from './FaqPageClient'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    return {
        title: `${t('faq')} | Syrealize`,
        description: t('faqTitle')
    }
}

export default async function FaqPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return <FaqPageClient user={user} />
}
