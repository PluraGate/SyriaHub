import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AboutLayout } from '@/components/AboutLayout'
import { Link } from '@/navigation'
import {
    Target,
    Shield,
    Settings,
    Users,
    HelpCircle,
    BookOpen,
    ArrowRight
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    return {
        title: `${t('title')} | SyriaHub`,
        description: t('subtitle')
    }
}

const sections = [
    { href: '/about/guide', icon: BookOpen, key: 'guide', descKey: 'guideDesc' },
    { href: '/about/mission', icon: Target, key: 'mission', descKey: 'content.missionIntro' },
    { href: '/about/ethics', icon: Shield, key: 'ethics', descKey: 'content.ethicsIntro' },
    { href: '/about/methodology', icon: Settings, key: 'methodology', descKey: 'content.methodologyIntro' },
    { href: '/about/roles', icon: Users, key: 'roles', descKey: 'content.methodologyIntro' },
    { href: '/about/security', icon: Shield, key: 'security.title', descKey: 'security.subtitle' },
    { href: '/about/faq', icon: HelpCircle, key: 'faq', descKey: 'subtitle' },
]

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <AboutLayout user={user}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-4">
                    {t('navigation.overview')}
                </h2>

                <p className="text-lg text-text-light dark:text-dark-text-muted mb-8">
                    {t('content.missionIntro')}
                </p>

                {/* Section Cards */}
                <div className="grid gap-4 md:grid-cols-2 not-prose">
                    {sections.map((section) => {
                        const Icon = section.icon
                        return (
                            <Link
                                key={section.href}
                                href={section.href}
                                className="group flex items-start gap-4 p-4 rounded-lg border border-border dark:border-dark-border hover:border-primary dark:hover:border-secondary transition-colors bg-gray-50 dark:bg-dark-bg"
                            >
                                <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-secondary transition-colors">
                                        {t(section.key)}
                                    </h3>
                                    <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1 line-clamp-2">
                                        {t(section.descKey)}
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-text-muted dark:text-dark-text-muted group-hover:text-primary dark:group-hover:text-secondary transition-colors flex-shrink-0 rtl:rotate-180" />
                            </Link>
                        )
                    })}
                </div>

                {/* Values Section */}
                <div className="mt-12 p-6 rounded-xl bg-primary/5 dark:bg-secondary/5 border border-primary/10 dark:border-secondary/10">
                    <h3 className="text-xl font-semibold text-primary dark:text-secondary mb-3">
                        {locale === 'ar' ? 'قيمنا الجوهرية' : 'Our Core Values'}
                    </h3>
                    <p className="text-text dark:text-dark-text">
                        {t('content.missionValues')}
                    </p>
                </div>

                {/* Institutional Context */}
                <div className="mt-8 p-6 rounded-xl bg-gray-50 dark:bg-dark-surface border border-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4">
                        {t('institutionalContext.title')}
                    </h3>
                    <div className="space-y-3 text-text-muted dark:text-dark-text-muted text-sm">
                        <p>{t('institutionalContext.line1')}</p>
                        <p>{t('institutionalContext.line2')}</p>
                        <p className="font-medium text-text dark:text-dark-text">{t('institutionalContext.line3')}</p>
                    </div>
                </div>
            </div>
        </AboutLayout>
    )
}
