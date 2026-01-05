import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AboutLayout } from '@/components/AboutLayout'
import { Settings, FileSearch, Users, CheckCircle, Shield, Eye, Bot, AlertTriangle } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    return {
        title: `${t('methodology')} | SyriaHub`,
        description: t('content.methodologyIntro')
    }
}

export default async function MethodologyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isArabic = locale === 'ar'

    const steps = [
        {
            icon: Bot,
            title: isArabic ? 'الفحص الآلي' : 'AI Pre-Screening',
            desc: isArabic
                ? 'يتم فحص كل محتوى جديد تلقائياً باستخدام OpenAI Moderation API للكشف عن خطاب الكراهية والتحرش والمحتوى الضار.'
                : 'Every new submission is automatically scanned using OpenAI Moderation API for hate speech, harassment, and harmful content.'
        },
        {
            icon: FileSearch,
            title: isArabic ? 'المراجعة الأولية' : 'Initial Review',
            desc: isArabic
                ? 'يُراجَع كل منشور جديد للتحقق من التزامه بإرشادات المحتوى والجودة الأساسية.'
                : 'Every new submission is reviewed to verify compliance with content guidelines and basic quality standards.'
        },
        {
            icon: Shield,
            title: isArabic ? 'فحص الانتحال' : 'Plagiarism Check',
            desc: isArabic
                ? 'نستخدم أدوات متقدمة للكشف عن أي محتوى منسوخ أو غير أصلي.'
                : 'We use advanced tools to detect any copied or unoriginal content.'
        },
        {
            icon: Users,
            title: isArabic ? 'مراجعة المجتمع' : 'Community Review',
            desc: isArabic
                ? 'يمكن لأعضاء المجتمع التصويت والتعليق وتزكية المحتوى عالي الجودة.'
                : 'Community members can vote, comment, and endorse high-quality content.'
        },
        {
            icon: CheckCircle,
            title: isArabic ? 'النشر والمتابعة' : 'Publication & Monitoring',
            desc: isArabic
                ? 'بعد الموافقة، يُنشر المحتوى ويظل خاضعاً للمراقبة المستمرة.'
                : 'After approval, content is published and remains subject to ongoing monitoring.'
        }
    ]

    return (
        <AboutLayout user={user}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-6 flex items-center gap-3">
                    <Settings className="w-7 h-7" />
                    {t('methodologyTitle')}
                </h2>

                <p className="text-lg leading-relaxed">
                    {t('content.methodologyIntro')}
                </p>

                {/* Process Steps */}
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mt-8 mb-6">
                    {isArabic ? 'مراحل ضمان الجودة' : 'Quality Assurance Process'}
                </h3>

                <div className="not-prose space-y-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon
                        return (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 dark:bg-secondary/10 flex items-center justify-center">
                                    <span className="text-sm font-bold text-primary dark:text-secondary">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon className="w-5 h-5 text-primary dark:text-secondary" />
                                        <h4 className="font-semibold text-text dark:text-dark-text">{step.title}</h4>
                                    </div>
                                    <p className="text-sm text-text-muted dark:text-dark-text-muted">{step.desc}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* AI Moderation Details */}
                <div className="my-8 p-6 rounded-xl bg-primary/5 dark:bg-secondary/5 border border-primary/10 dark:border-secondary/10">
                    <div className="flex items-center gap-3 mb-4">
                        <Bot className="w-6 h-6 text-primary dark:text-secondary" />
                        <h3 className="text-xl font-semibold text-primary dark:text-secondary m-0">
                            {isArabic ? 'تفاصيل الإشراف الآلي' : 'AI Moderation Details'}
                        </h3>
                    </div>
                    <div className="not-prose grid gap-3 md:grid-cols-2">
                        <div className="p-3 rounded-lg bg-white/50 dark:bg-dark-bg/50">
                            <h4 className="font-semibold text-text dark:text-dark-text text-sm mb-1">
                                {isArabic ? 'الكشف متعدد الفئات' : 'Multi-Category Detection'}
                            </h4>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted m-0">
                                {isArabic
                                    ? 'الكراهية، التحرش، العنف، المحتوى الجنسي، البريد العشوائي'
                                    : 'Hate, harassment, violence, sexual content, spam'
                                }
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/50 dark:bg-dark-bg/50">
                            <h4 className="font-semibold text-text dark:text-dark-text text-sm mb-1">
                                {isArabic ? 'تصميم آمن' : 'Fail-Safe Design'}
                            </h4>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted m-0">
                                {isArabic
                                    ? 'المحتوى يُسمح به إذا كانت خدمات AI غير متوفرة'
                                    : 'Content is allowed if AI services are unavailable'
                                }
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/50 dark:bg-dark-bg/50">
                            <h4 className="font-semibold text-text dark:text-dark-text text-sm mb-1">
                                {isArabic ? 'إنشاء تقرير تلقائي' : 'Auto-Report Creation'}
                            </h4>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted m-0">
                                {isArabic
                                    ? 'المحتوى المُبلَّغ عنه ينشئ تقريراً للمراجعة البشرية'
                                    : 'Flagged content creates report for human review'
                                }
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/50 dark:bg-dark-bg/50">
                            <h4 className="font-semibold text-text dark:text-dark-text text-sm mb-1">
                                {isArabic ? 'قابلية التجاوز' : 'Human Override'}
                            </h4>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted m-0">
                                {isArabic
                                    ? 'المشرفون البشريون يمكنهم تجاوز قرارات AI'
                                    : 'Human moderators can override AI decisions'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Plagiarism Detection Infrastructure */}
                <div className="my-8 p-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-300 m-0">
                            {isArabic ? 'الكشف عن الانتحال' : 'Plagiarism Detection'}
                        </h3>
                    </div>
                    <p className="text-text dark:text-dark-text mb-3">
                        {isArabic
                            ? 'بنية تحتية جاهزة للتكامل مع خدمات الكشف عن الانتحال:'
                            : 'Infrastructure ready for integration with plagiarism detection services:'
                        }
                    </p>
                    <ul className="not-prose text-sm text-text-muted dark:text-dark-text-muted space-y-1 m-0">
                        <li className="flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-400">•</span>
                            Copyscape, Turnitin, iThenticate
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-400">•</span>
                            {isArabic ? 'حلول مخصصة تعتمد على التضمينات' : 'Custom embedding-based solutions'}
                        </li>
                    </ul>
                </div>

                {/* Peer Review */}
                <div className="my-8 p-6 rounded-xl bg-secondary/5 border border-secondary/20">
                    <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-6 h-6 text-secondary" />
                        <h3 className="text-xl font-semibold text-secondary m-0">
                            {isArabic ? 'نظام مراجعة الأقران' : 'Peer Review System'}
                        </h3>
                    </div>
                    <p className="text-text dark:text-dark-text m-0">
                        {t('content.methodologyPeer')}
                    </p>
                </div>

                {/* Moderation */}
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mt-8 mb-4">
                    {isArabic ? 'الإشراف والرقابة' : 'Moderation'}
                </h3>
                <p>
                    {t('content.methodologyModeration')}
                </p>
                <p>
                    {isArabic
                        ? 'يعمل فريق الإشراف على مدار الساعة لضمان التزام المحتوى بمعايير المنصة. يمكن لأي عضو الإبلاغ عن محتوى يعتقد أنه ينتهك الإرشادات، وسيتم مراجعته في أسرع وقت.'
                        : 'Our moderation team works around the clock to ensure content meets platform standards. Any member can report content they believe violates guidelines, and it will be reviewed promptly.'
                    }
                </p>
            </div>
        </AboutLayout>
    )
}
