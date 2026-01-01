import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Shield, Users, Bot, Scale, AlertTriangle, Lock, Eye, Coins, CheckCircle2 } from 'lucide-react'

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
                            <div className="p-6 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-5 h-5 text-text-muted dark:text-dark-text-muted" />
                                    <h2 className="text-xl font-semibold text-text dark:text-dark-text m-0">
                                        {t('nonGoals.title')}
                                    </h2>
                                </div>
                                <ul className="text-text-muted dark:text-dark-text-muted space-y-2 text-sm">
                                    <li>• {t('nonGoals.item1')}</li>
                                    <li>• {t('nonGoals.item2')}</li>
                                    <li>• {t('nonGoals.item3')}</li>
                                    <li>• {t('nonGoals.item4')}</li>
                                    <li>• {t('nonGoals.item5')}</li>
                                </ul>
                            </div>
                        </section>

                        {/* Funding Transparency & Allocation */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Coins className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('sustainability.title')}
                                </h2>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                {t('sustainability.intro')}
                            </p>
                            <p className="text-text-muted dark:text-dark-text-muted mb-8">
                                {t('sustainability.ledgerIntroPart1')}
                                <strong className="text-text dark:text-dark-text">{t('sustainability.ledgerIntroHighlight')}</strong>
                                {t('sustainability.ledgerIntroPart2')}
                            </p>

                            {/* Operational Allocation */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-3">
                                    {t('sustainability.operationalTitle')}
                                </h3>
                                <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                    {t('sustainability.operationalIntro')}
                                </p>
                                <div className="not-prose grid gap-3">
                                    {[
                                        { title: t('sustainability.coreInfrastructure'), desc: t('sustainability.coreInfrastructureDesc') },
                                        { title: t('sustainability.maintenanceSecurity'), desc: t('sustainability.maintenanceSecurityDesc') },
                                        { title: t('sustainability.governanceModeration'), desc: t('sustainability.governanceModerationDesc') },
                                        { title: t('sustainability.aiTooling'), desc: t('sustainability.aiToolingDesc') }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                            <span className="text-primary dark:text-secondary font-bold">•</span>
                                            <div>
                                                <span className="font-semibold text-text dark:text-dark-text">{item.title}</span>
                                                <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Surplus Allocation Policy */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-3">
                                    {t('sustainability.surplusTitle')}
                                </h3>
                                <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                    {t('sustainability.surplusIntroPart1')}
                                    <strong className="text-text dark:text-dark-text">{t('sustainability.surplusIntroHighlight')}</strong>
                                    {t('sustainability.surplusIntroPart2')}
                                </p>
                                <p className="text-text-muted dark:text-dark-text-muted text-sm mb-1">
                                    {t('sustainability.surplusExamples')}
                                </p>
                                <ul className="text-text-muted dark:text-dark-text-muted text-sm space-y-0.5 mb-4 ms-4">
                                    <li>• {t('sustainability.surplusExample1')}</li>
                                    <li>• {t('sustainability.surplusExample2')}</li>
                                    <li>• {t('sustainability.surplusExample3')}</li>
                                    <li>• {t('sustainability.surplusExample4')}</li>
                                </ul>
                                <p className="text-text-muted dark:text-dark-text-muted mb-2">
                                    {t('sustainability.surplusNote')}
                                </p>
                                <div className="not-prose flex flex-wrap gap-2">
                                    {[
                                        t('sustainability.surplusNote1'),
                                        t('sustainability.surplusNote2'),
                                        t('sustainability.surplusNote3')
                                    ].map((note, i) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {note}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Transparency Principles */}
                            <div className="p-6 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 mb-6">
                                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
                                    {t('sustainability.transparencyTitle')}
                                </h3>
                                <ul className="text-green-700 dark:text-green-300 space-y-2 text-sm">
                                    <li>• {t('sustainability.transparencyPrinciple1')}</li>
                                    <li>• {t('sustainability.transparencyPrinciple2')}</li>
                                    <li>• {t('sustainability.transparencyPrinciple3')}</li>
                                </ul>
                            </div>

                            <p className="text-text-muted/80 dark:text-dark-text-muted/60 text-sm italic mb-6">
                                {t('sustainability.ledgerNote')}
                            </p>
                        </section>

                        {/* Future Sustainability Measures */}
                        <section className="mb-12">
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
                                {t('futureSustainability.title')}
                            </h2>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                {t('futureSustainability.intro')}
                            </p>
                            <p className="text-text-muted dark:text-dark-text-muted text-sm mb-2">
                                {t('futureSustainability.principlesIntro')}
                            </p>
                            <ul className="text-text-muted dark:text-dark-text-muted text-sm space-y-1 mb-4 ms-4">
                                <li>• {t('futureSustainability.principle1')}</li>
                                <li>• {t('futureSustainability.principle2')}</li>
                                <li>• {t('futureSustainability.principle3')}</li>
                            </ul>
                            <p className="text-text dark:text-dark-text font-medium mb-4">
                                {t('futureSustainability.coreStatement')}
                            </p>
                            <p className="text-text-muted/80 dark:text-dark-text-muted/60 text-sm italic">
                                {t('futureSustainability.credibilityNote')}
                            </p>
                        </section>

                        {/* Stewardship & Legal Context */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('stewardship.title')}
                                </h2>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                {t('stewardship.intro')}
                            </p>
                            <div className="p-4 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface mb-4">
                                <p className="text-sm text-text-muted dark:text-dark-text-muted mb-0 leading-relaxed">
                                    {t('stewardship.operationalFundsPart1')}
                                    <strong className="text-text dark:text-dark-text">{t('stewardship.operationalFundsHighlight')}</strong>
                                    {t('stewardship.operationalFundsPart2')}
                                </p>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                {t('stewardship.ledgerNotePart1')}
                                <strong className="text-text dark:text-dark-text">{t('stewardship.ledgerNoteHighlight')}</strong>
                                {t('stewardship.ledgerNotePart2')}
                            </p>
                            <p className="text-text-muted dark:text-dark-text-muted">
                                {t('stewardship.jurisdictionPart1')}
                                <strong className="text-text dark:text-dark-text">{t('stewardship.jurisdictionHighlight')}</strong>
                                {t('stewardship.jurisdictionPart2')}
                            </p>
                        </section>

                        {/* Role Separation */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Lock className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('roleSeparation.title')}
                                </h2>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                {t('roleSeparation.intro')}
                            </p>
                            <div className="mb-6">
                                <h4 className="text-base font-semibold text-text dark:text-dark-text mb-2">
                                    {t('roleSeparation.noAuthority')}
                                </h4>
                                <ul className="text-sm text-text-muted dark:text-dark-text-muted space-y-1 ms-4">
                                    <li>• {t('roleSeparation.item1')}</li>
                                    <li>• {t('roleSeparation.item2')}</li>
                                    <li>• {t('roleSeparation.item3')}</li>
                                    <li>• {t('roleSeparation.item4')}</li>
                                </ul>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4 leading-relaxed">
                                {t('roleSeparation.independence')}
                            </p>
                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                                <p className="text-sm text-amber-800 dark:text-amber-400 font-medium mb-0">
                                    {t('roleSeparation.technicalAccess')}
                                </p>
                            </div>
                        </section>

                        {/* Governance Framework Closing */}
                        <div className="p-4 rounded-lg border border-primary/20 dark:border-secondary/20 bg-primary/5 dark:bg-secondary/5 text-center">
                            <p className="text-text dark:text-dark-text text-sm font-medium">
                                {t('sustainability.governanceClosing')}
                            </p>
                        </div>
                    </article>
                </div>
            </main>

            <Footer />
        </div>
    )
}
