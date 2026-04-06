import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'UserGuide' })
    return {
        title: `${t('title')} | SyriaHub`,
        description: t('subtitle')
    }
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
    return children
}
