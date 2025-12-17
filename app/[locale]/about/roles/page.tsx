import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AboutLayout } from '@/components/AboutLayout'
import { Users, User, GraduationCap, Shield, Crown, ArrowUpCircle, CheckCircle } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    return {
        title: `${t('roles')} | Syrealize`,
        description: t('rolesTitle')
    }
}

export default async function RolesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Roles' })
    const tAbout = await getTranslations({ locale, namespace: 'About' })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isArabic = locale === 'ar'

    const roles = [
        {
            key: 'member',
            icon: User,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-800'
        },
        {
            key: 'researcher',
            icon: GraduationCap,
            color: 'text-secondary',
            bgColor: 'bg-secondary/10'
        },
        {
            key: 'moderator',
            icon: Shield,
            color: 'text-primary',
            bgColor: 'bg-primary/10'
        },
        {
            key: 'admin',
            icon: Crown,
            color: 'text-accent',
            bgColor: 'bg-accent/10'
        }
    ]

    return (
        <AboutLayout user={user}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-6 flex items-center gap-3">
                    <Users className="w-7 h-7" />
                    {tAbout('rolesTitle')}
                </h2>

                <p className="text-lg leading-relaxed">
                    {isArabic
                        ? 'لدينا نظام أدوار متدرج يضمن جودة المحتوى ويتيح للأعضاء النمو والتطور داخل المجتمع.'
                        : 'We have a tiered role system that ensures content quality and allows members to grow and develop within the community.'
                    }
                </p>

                {/* Role Cards */}
                <div className="not-prose space-y-6 mt-8">
                    {roles.map((role) => {
                        const Icon = role.icon
                        const capabilities = t.raw(`${role.key}.capabilities`) as string[]

                        return (
                            <div key={role.key} className="rounded-xl border border-border dark:border-dark-border overflow-hidden">
                                <div className={`p-4 ${role.bgColor} flex items-center gap-3`}>
                                    <Icon className={`w-6 h-6 ${role.color}`} />
                                    <h3 className="text-lg font-bold text-text dark:text-dark-text m-0">
                                        {t(`${role.key}.title`)}
                                    </h3>
                                </div>
                                <div className="p-4 bg-white dark:bg-dark-surface">
                                    <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                        {t(`${role.key}.description`)}
                                    </p>
                                    <h4 className="text-sm font-semibold text-text dark:text-dark-text mb-2">
                                        {isArabic ? 'الصلاحيات:' : 'Capabilities:'}
                                    </h4>
                                    <ul className="space-y-2">
                                        {capabilities.map((cap, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-text dark:text-dark-text">
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                {cap}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* How to Advance */}
                <div className="my-8 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 border border-primary/10 dark:border-secondary/10">
                    <div className="flex items-center gap-3 mb-4">
                        <ArrowUpCircle className="w-6 h-6 text-primary dark:text-secondary" />
                        <h3 className="text-xl font-semibold text-primary dark:text-secondary m-0">
                            {t('howToAdvance')}
                        </h3>
                    </div>
                    <p className="text-text dark:text-dark-text m-0">
                        {t('advanceDescription')}
                    </p>
                </div>
            </div>
        </AboutLayout>
    )
}
