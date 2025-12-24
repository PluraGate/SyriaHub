import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Shield, Users, Bot, Scale, AlertTriangle, Lock, Eye } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Governance' })
    return {
        title: `${t('title')} | SyriaHub`,
        description: t('subtitle')
    }
}

export default async function GovernancePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Governance' })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isArabic = locale === 'ar'

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 dark:bg-secondary/10 mb-4">
                            <Shield className="w-8 h-8 text-primary dark:text-secondary" />
                        </div>
                        <h1 className="text-3xl font-bold text-primary dark:text-dark-text mb-3">
                            {t('title')}
                        </h1>
                        <p className="text-lg text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>

                    <article className="prose prose-lg dark:prose-invert max-w-none">
                        {/* Moderation Flow */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('moderation.title')}
                                </h2>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-6">
                                {t('moderation.intro')}
                            </p>

                            <div className="not-prose grid gap-4">
                                {[
                                    { step: '1', title: t('moderation.layer1Title'), desc: t('moderation.layer1Desc'), icon: Bot },
                                    { step: '2', title: t('moderation.layer2Title'), desc: t('moderation.layer2Desc'), icon: Users },
                                    { step: '3', title: t('moderation.layer3Title'), desc: t('moderation.layer3Desc'), icon: Eye },
                                    { step: '4', title: t('moderation.layer4Title'), desc: t('moderation.layer4Desc'), icon: Scale }
                                ].map((layer) => (
                                    <div key={layer.step} className="flex items-start gap-4 p-4 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 dark:bg-secondary/10 flex items-center justify-center">
                                            <span className="text-sm font-bold text-primary dark:text-secondary">{layer.step}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-text dark:text-dark-text mb-1">{layer.title}</h3>
                                            <p className="text-sm text-text-muted dark:text-dark-text-muted">{layer.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Trust Scores */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Scale className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('trust.title')}
                                </h2>
                            </div>

                            <div className="not-prose grid md:grid-cols-2 gap-4 mb-4">
                                <div className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                                    <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                                        {t('trust.whatItIs')}
                                    </h4>
                                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                        <li>• {t('trust.is1')}</li>
                                        <li>• {t('trust.is2')}</li>
                                        <li>• {t('trust.is3')}</li>
                                    </ul>
                                </div>
                                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">
                                        {t('trust.whatItIsNot')}
                                    </h4>
                                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                                        <li>• {t('trust.isNot1')}</li>
                                        <li>• {t('trust.isNot2')}</li>
                                        <li>• {t('trust.isNot3')}</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* AI Constraints */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Bot className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('ai.title')}
                                </h2>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                {t('ai.intro')}
                            </p>
                            <div className="not-prose space-y-2">
                                {[
                                    { title: t('ai.principle1Title'), desc: t('ai.principle1Desc') },
                                    { title: t('ai.principle2Title'), desc: t('ai.principle2Desc') },
                                    { title: t('ai.principle3Title'), desc: t('ai.principle3Desc') },
                                    { title: t('ai.principle4Title'), desc: t('ai.principle4Desc') }
                                ].map((principle, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-border">
                                        <span className="text-primary dark:text-secondary font-bold">•</span>
                                        <div>
                                            <span className="font-medium text-text dark:text-dark-text">{principle.title}:</span>
                                            <span className="text-text-muted dark:text-dark-text-muted ml-1">{principle.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Limits of Authority */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Lock className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('limits.title')}
                                </h2>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4 italic">
                                {t('limits.intro')}
                            </p>

                            <div className="not-prose space-y-4">
                                <div className="p-4 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                    <h4 className="font-semibold text-text dark:text-dark-text mb-2">{t('limits.moderatorsTitle')}</h4>
                                    <ul className="text-sm text-text-muted dark:text-dark-text-muted space-y-1">
                                        <li>• {t('limits.mod1')}</li>
                                        <li>• {t('limits.mod2')}</li>
                                        <li>• {t('limits.mod3')}</li>
                                    </ul>
                                </div>
                                <div className="p-4 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                    <h4 className="font-semibold text-text dark:text-dark-text mb-2">{t('limits.adminsTitle')}</h4>
                                    <ul className="text-sm text-text-muted dark:text-dark-text-muted space-y-1">
                                        <li>• {t('limits.admin1')}</li>
                                        <li>• {t('limits.admin2')}</li>
                                        <li>• {t('limits.admin3')}</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Non-Goals */}
                        <section className="mb-12">
                            <div className="p-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-300 m-0">
                                        {t('nonGoals.title')}
                                    </h2>
                                </div>
                                <ul className="text-amber-700 dark:text-amber-300 space-y-2 text-sm">
                                    <li>• {t('nonGoals.item1')}</li>
                                    <li>• {t('nonGoals.item2')}</li>
                                    <li>• {t('nonGoals.item3')}</li>
                                    <li>• {t('nonGoals.item4')}</li>
                                    <li>• {t('nonGoals.item5')}</li>
                                </ul>
                            </div>
                        </section>
                    </article>
                </div>
            </main>

            <Footer />
        </div>
    )
}
