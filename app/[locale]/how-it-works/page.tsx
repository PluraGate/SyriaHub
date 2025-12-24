import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { BookOpen, FileText, HelpCircle, GitFork, Quote, Map, Lightbulb } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'HowItWorks' })
    return {
        title: `${t('title')} | SyriaHub`,
        description: t('subtitle')
    }
}

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'HowItWorks' })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isArabic = locale === 'ar'

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 dark:bg-secondary/10 mb-4">
                            <BookOpen className="w-8 h-8 text-primary dark:text-secondary" />
                        </div>
                        <h1 className="text-3xl font-bold text-primary dark:text-dark-text mb-3">
                            {t('title')}
                        </h1>
                        <p className="text-lg text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Mental Model */}
                    <div className="p-6 rounded-xl bg-primary/5 dark:bg-secondary/5 border border-primary/10 dark:border-secondary/10 mb-12">
                        <div className="flex items-start gap-4">
                            <Lightbulb className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-lg font-medium text-text dark:text-dark-text mb-2">
                                    {t('mentalModel.line1')}
                                </p>
                                <p className="text-text-muted dark:text-dark-text-muted">
                                    {t('mentalModel.line2')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <article className="prose prose-lg dark:prose-invert max-w-none">
                        {/* Content Types */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <FileText className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('contentTypes.title')}
                                </h2>
                            </div>

                            <div className="not-prose grid gap-4">
                                {[
                                    {
                                        type: t('contentTypes.article'),
                                        desc: t('contentTypes.articleDesc'),
                                        bestFor: t('contentTypes.articleBestFor'),
                                        color: 'blue'
                                    },
                                    {
                                        type: t('contentTypes.question'),
                                        desc: t('contentTypes.questionDesc'),
                                        bestFor: t('contentTypes.questionBestFor'),
                                        color: 'green'
                                    },
                                    {
                                        type: t('contentTypes.trace'),
                                        desc: t('contentTypes.traceDesc'),
                                        bestFor: t('contentTypes.traceBestFor'),
                                        color: 'amber'
                                    },
                                    {
                                        type: t('contentTypes.gap'),
                                        desc: t('contentTypes.gapDesc'),
                                        bestFor: t('contentTypes.gapBestFor'),
                                        color: 'purple'
                                    }
                                ].map((item) => (
                                    <div key={item.type} className="p-4 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                        <h3 className="font-semibold text-text dark:text-dark-text mb-2">{item.type}</h3>
                                        <p className="text-sm text-text-muted dark:text-dark-text-muted mb-2">{item.desc}</p>
                                        <p className="text-xs text-primary dark:text-secondary">
                                            <span className="font-medium">{t('contentTypes.bestFor')}:</span> {item.bestFor}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Forking & Attribution */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <GitFork className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('forking.title')}
                                </h2>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                {t('forking.intro')}
                            </p>
                            <div className="not-prose p-4 rounded-xl bg-gray-50 dark:bg-dark-border">
                                <ol className="space-y-2 text-sm text-text-muted dark:text-dark-text-muted">
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-primary dark:text-secondary">1.</span>
                                        {t('forking.step1')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-primary dark:text-secondary">2.</span>
                                        {t('forking.step2')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-primary dark:text-secondary">3.</span>
                                        {t('forking.step3')}
                                    </li>
                                </ol>
                            </div>
                        </section>

                        {/* Citations & Versioning */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Quote className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('citations.title')}
                                </h2>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                {t('citations.intro')}
                            </p>
                            <div className="not-prose grid md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                    <h4 className="font-semibold text-text dark:text-dark-text mb-2">{t('citations.editWindowTitle')}</h4>
                                    <p className="text-sm text-text-muted dark:text-dark-text-muted">{t('citations.editWindowDesc')}</p>
                                </div>
                                <div className="p-4 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                    <h4 className="font-semibold text-text dark:text-dark-text mb-2">{t('citations.backlinksTitle')}</h4>
                                    <p className="text-sm text-text-muted dark:text-dark-text-muted">{t('citations.backlinksDesc')}</p>
                                </div>
                            </div>
                        </section>

                        {/* Spatial Context */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Map className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('spatial.title')}
                                </h2>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                {t('spatial.intro')}
                            </p>
                            <div className="not-prose p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    <span className="font-semibold">{t('spatial.flagsNote')}:</span> {t('spatial.flagsDesc')}
                                </p>
                            </div>
                        </section>

                        {/* Research Gaps */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <HelpCircle className="w-6 h-6 text-primary dark:text-secondary flex-shrink-0" />
                                <h2 className="text-2xl font-semibold text-text dark:text-dark-text m-0">
                                    {t('gaps.title')}
                                </h2>
                            </div>
                            <p className="text-text-muted dark:text-dark-text-muted mb-4">
                                {t('gaps.intro')}
                            </p>
                            <div className="not-prose">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    {[
                                        t('gaps.step1'),
                                        t('gaps.step2'),
                                        t('gaps.step3'),
                                        t('gaps.step4'),
                                        t('gaps.step5')
                                    ].map((step, i, arr) => (
                                        <span key={i} className="flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary font-medium">
                                                {step}
                                            </span>
                                            {i < arr.length - 1 && (
                                                <span className="text-text-muted dark:text-dark-text-muted">→</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </article>
                </div>
            </main>

            <Footer />
        </div>
    )
}
