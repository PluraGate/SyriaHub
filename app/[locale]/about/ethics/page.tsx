import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AboutLayout } from '@/components/AboutLayout'
import { Shield, BookOpen, Users, Scale, AlertTriangle } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    return {
        title: `${t('ethics')} | Syrealize`,
        description: t('content.ethicsIntro')
    }
}

export default async function EthicsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isArabic = locale === 'ar'

    return (
        <AboutLayout user={user}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-6 flex items-center gap-3">
                    <Shield className="w-7 h-7" />
                    {t('ethicsTitle')}
                </h2>

                <p className="text-lg leading-relaxed">
                    {t('content.ethicsIntro')}
                </p>

                {/* Research Integrity */}
                <div className="my-8 p-6 rounded-xl bg-primary/5 dark:bg-secondary/5 border border-primary/10 dark:border-secondary/10">
                    <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-primary dark:text-secondary" />
                        <h3 className="text-xl font-semibold text-primary dark:text-secondary m-0">
                            {isArabic ? 'نزاهة البحث العلمي' : 'Research Integrity'}
                        </h3>
                    </div>
                    <p className="text-text dark:text-dark-text m-0">
                        {t('content.ethicsResearch')}
                    </p>
                </div>

                {/* Content Guidelines */}
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mt-8 mb-4">
                    {isArabic ? 'إرشادات المحتوى' : 'Content Guidelines'}
                </h3>

                <div className="not-prose space-y-3">
                    {[
                        {
                            title: isArabic ? 'الأصالة' : 'Originality',
                            desc: isArabic
                                ? 'يجب أن يكون المحتوى أصلياً أو مستنداً بشكل صحيح للمصادر.'
                                : 'Content must be original or properly attributed to sources.'
                        },
                        {
                            title: isArabic ? 'الدقة' : 'Accuracy',
                            desc: isArabic
                                ? 'تحقق من المعلومات قبل النشر وصحح الأخطاء عند اكتشافها.'
                                : 'Verify information before publishing and correct errors when discovered.'
                        },
                        {
                            title: isArabic ? 'الشفافية' : 'Transparency',
                            desc: isArabic
                                ? 'أفصح عن تضارب المصالح والمنهجية المستخدمة.'
                                : 'Disclose conflicts of interest and methodology used.'
                        },
                        {
                            title: isArabic ? 'الاحترام' : 'Respect',
                            desc: isArabic
                                ? 'احترم الآراء المختلفة وشارك بنقد بنّاء.'
                                : 'Respect different opinions and engage in constructive criticism.'
                        }
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-border dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                            <Scale className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-text dark:text-dark-text">{item.title}</h4>
                                <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Community Conduct */}
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mt-8 mb-4">
                    {isArabic ? 'قواعد السلوك المجتمعي' : 'Community Conduct'}
                </h3>
                <p>
                    {t('content.ethicsCommunity')}
                </p>

                {/* Prohibited Content */}
                <div className="my-8 p-6 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-accent" />
                        <h3 className="text-xl font-semibold text-accent m-0">
                            {isArabic ? 'المحتوى المحظور' : 'Prohibited Content'}
                        </h3>
                    </div>
                    <ul className="list-disc list-inside text-text dark:text-dark-text space-y-2 m-0">
                        <li>{isArabic ? 'الانتحال أو السرقة الأكاديمية' : 'Plagiarism or academic theft'}</li>
                        <li>{isArabic ? 'المعلومات المضللة عن قصد' : 'Intentional misinformation'}</li>
                        <li>{isArabic ? 'خطاب الكراهية أو التمييز' : 'Hate speech or discrimination'}</li>
                        <li>{isArabic ? 'التحرش أو الإساءة الشخصية' : 'Harassment or personal attacks'}</li>
                        <li>{isArabic ? 'المحتوى غير القانوني' : 'Illegal content'}</li>
                    </ul>
                </div>
            </div>
        </AboutLayout>
    )
}
