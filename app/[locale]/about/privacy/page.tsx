import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AboutLayout } from '@/components/AboutLayout'
import { Lock, Bot, Shield, Eye, Server } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    return {
        title: `${t('privacy')} | SyriaHub`,
        description: t('privacyTitle')
    }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isArabic = locale === 'ar'

    return (
        <AboutLayout user={user}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-6 flex items-center gap-3">
                    <Lock className="w-7 h-7" />
                    {t('privacyTitle')}
                </h2>

                <p className="text-sm text-text-muted dark:text-dark-text-muted mb-6">
                    {t('lastUpdated', { date: isArabic ? '5 يناير 2026' : 'January 5, 2026' })}
                </p>

                <h3>{isArabic ? 'المعلومات التي نجمعها' : 'Information We Collect'}</h3>
                <p>
                    {isArabic
                        ? 'نجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب، مثل اسمك وبريدك الإلكتروني وانتمائك المؤسسي. كما نجمع معلومات حول كيفية استخدامك للمنصة.'
                        : 'We collect information you provide directly when creating an account, such as your name, email, and institutional affiliation. We also collect information about how you use the platform.'
                    }
                </p>

                <h3>{isArabic ? 'كيف نستخدم معلوماتك' : 'How We Use Your Information'}</h3>
                <ul>
                    <li>{isArabic ? 'تقديم وتحسين خدماتنا' : 'To provide and improve our services'}</li>
                    <li>{isArabic ? 'التواصل معك بشأن حسابك' : 'To communicate with you about your account'}</li>
                    <li>{isArabic ? 'ضمان أمان المنصة' : 'To ensure platform security'}</li>
                    <li>{isArabic ? 'تخصيص تجربتك' : 'To personalize your experience'}</li>
                </ul>

                {/* AI Content Moderation */}
                <div className="not-prose my-8 p-6 rounded-xl bg-primary/5 dark:bg-secondary/5 border border-primary/10 dark:border-secondary/10">
                    <div className="flex items-center gap-3 mb-4">
                        <Bot className="w-6 h-6 text-primary dark:text-secondary" />
                        <h3 className="text-xl font-semibold text-primary dark:text-secondary m-0">
                            {isArabic ? 'الإشراف الآلي على المحتوى' : 'AI Content Moderation'}
                        </h3>
                    </div>
                    <p className="text-text dark:text-dark-text mb-4">
                        {isArabic
                            ? 'نستخدم خدمات الذكاء الاصطناعي (OpenAI Moderation API و Google Perspective API) لفحص المحتوى المنشور تلقائياً للكشف عن المحتوى الضار.'
                            : 'We use AI services (OpenAI Moderation API and Google Perspective API) to automatically scan published content for harmful material.'
                        }
                    </p>
                    <ul className="text-sm text-text dark:text-dark-text space-y-2 m-0">
                        <li className="flex items-start gap-2">
                            <span className="text-primary dark:text-secondary">•</span>
                            {isArabic
                                ? 'يتم فحص المحتوى للكشف عن خطاب الكراهية والاعتداء اللفظي والعنف والبريد العشوائي'
                                : 'Content is scanned for hate speech, harassment, violence, and spam'
                            }
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary dark:text-secondary">•</span>
                            {isArabic
                                ? 'لا نبني ملفات تعريف سلوكية للمستخدمين'
                                : 'We do not build behavioral profiles of users'
                            }
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary dark:text-secondary">•</span>
                            {isArabic
                                ? 'يمكن لمشرفي المنصة مراجعة قرارات الذكاء الاصطناعي وتجاوزها'
                                : 'Platform moderators can review and override AI decisions'
                            }
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary dark:text-secondary">•</span>
                            {isArabic
                                ? 'بيانات الإشراف لا تُستخدم لأغراض التسويق أو الإعلانات'
                                : 'Moderation data is not used for marketing or advertising purposes'
                            }
                        </li>
                    </ul>
                </div>

                <h3>{isArabic ? 'مشاركة المعلومات' : 'Information Sharing'}</h3>
                <p>
                    {isArabic
                        ? 'لا نبيع معلوماتك الشخصية. قد نشارك المعلومات مع مقدمي الخدمات الذين يساعدوننا في تشغيل المنصة، أو عند الضرورة القانونية.'
                        : 'We do not sell your personal information. We may share information with service providers who help us operate the platform, or when legally required.'
                    }
                </p>

                {/* Data Security - Enhanced */}
                <div className="not-prose my-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-6 h-6 text-primary dark:text-secondary" />
                        <h3 className="text-xl font-semibold text-text dark:text-dark-text m-0">
                            {isArabic ? 'أمان البيانات' : 'Data Security'}
                        </h3>
                    </div>
                    <p className="text-text dark:text-dark-text mb-4">
                        {isArabic
                            ? 'نستخدم تدابير أمنية شاملة لحماية بياناتك:'
                            : 'We use comprehensive security measures to protect your data:'
                        }
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="p-4 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                            <h4 className="font-semibold text-text dark:text-dark-text text-sm mb-2">
                                {isArabic ? 'التحقق من الأصل' : 'Origin Validation'}
                            </h4>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted m-0">
                                {isArabic
                                    ? 'جميع نقاط النهاية محمية بالتحقق من أصل الطلب لمنع هجمات CSRF'
                                    : 'All mutation endpoints are protected with origin validation to prevent CSRF attacks'
                                }
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                            <h4 className="font-semibold text-text dark:text-dark-text text-sm mb-2">
                                {isArabic ? 'تحديد معدل الطلبات' : 'Rate Limiting'}
                            </h4>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted m-0">
                                {isArabic
                                    ? 'حماية من إساءة الاستخدام عبر تحديد معدل الطلبات على جميع نقاط النهاية'
                                    : 'Protection against abuse through rate limiting on all endpoints'
                                }
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                            <h4 className="font-semibold text-text dark:text-dark-text text-sm mb-2">
                                {isArabic ? 'التحقق من الروبوتات' : 'Bot Protection'}
                            </h4>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted m-0">
                                {isArabic
                                    ? 'التحقق عبر Turnstile للحماية من الروبوتات على النماذج العامة'
                                    : 'Turnstile verification for bot protection on public forms'
                                }
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                            <h4 className="font-semibold text-text dark:text-dark-text text-sm mb-2">
                                {isArabic ? 'التشفير' : 'Encryption'}
                            </h4>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted m-0">
                                {isArabic
                                    ? 'جميع البيانات مشفرة أثناء النقل والتخزين'
                                    : 'All data encrypted in transit and at rest'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Data Retention */}
                <div className="not-prose my-8 p-6 rounded-xl border border-border dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                    <div className="flex items-center gap-3 mb-4">
                        <Server className="w-6 h-6 text-primary dark:text-secondary" />
                        <h3 className="text-xl font-semibold text-text dark:text-dark-text m-0">
                            {isArabic ? 'الاحتفاظ بالبيانات' : 'Data Retention'}
                        </h3>
                    </div>
                    <ul className="text-sm text-text dark:text-dark-text space-y-2 m-0">
                        <li className="flex items-start gap-2">
                            <span className="text-primary dark:text-secondary">•</span>
                            {isArabic
                                ? 'بيانات الحساب: يتم الاحتفاظ بها حتى تطلب الحذف'
                                : 'Account data: Retained until you request deletion'
                            }
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary dark:text-secondary">•</span>
                            {isArabic
                                ? 'المحتوى المنشور: يتم الاحتفاظ به ما لم تحذفه أو ينتهك السياسات'
                                : 'Published content: Retained unless you delete it or it violates policies'
                            }
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary dark:text-secondary">•</span>
                            {isArabic
                                ? 'سجلات الإشراف: يتم الاحتفاظ بها لأغراض التدقيق والاستئناف'
                                : 'Moderation logs: Retained for audit and appeal purposes'
                            }
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary dark:text-secondary">•</span>
                            {isArabic
                                ? 'تحليلات البحث: مجمعة ومجهولة الهوية'
                                : 'Search analytics: Aggregated and anonymized'
                            }
                        </li>
                    </ul>
                </div>

                <h3>{isArabic ? 'حقوقك' : 'Your Rights'}</h3>
                <p>
                    {isArabic
                        ? 'لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها وحذفها. يمكنك أيضاً طلب نسخة من بياناتك أو طلب تقييد المعالجة.'
                        : 'You have the right to access, correct, and delete your personal data. You can also request a copy of your data or ask us to restrict processing.'
                    }
                </p>

                {/* No Profiling Commitment */}
                <div className="not-prose my-8 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-2">
                        <Eye className="w-5 h-5 text-green-700 dark:text-green-400" />
                        <h4 className="font-semibold text-green-800 dark:text-green-300 m-0">
                            {isArabic ? 'التزامنا بعدم التنميط' : 'Our No-Profiling Commitment'}
                        </h4>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 m-0">
                        {isArabic
                            ? 'لا نقوم ببناء ملفات تعريف سلوكية، ولا نهدف لتحسين التفاعل والمشاركة، ولا نخصص خلاصات المحتوى، ولا نرتب المستخدمين حسب مقاييس التأثير.'
                            : 'We do not build behavioral profiles, optimize for engagement, personalize content feeds, or rank users by influence metrics.'
                        }
                    </p>
                </div>

                <h3>{isArabic ? 'ملفات تعريف الارتباط' : 'Cookies'}</h3>
                <p>
                    {isArabic
                        ? 'نستخدم ملفات تعريف الارتباط الضرورية لتشغيل المنصة. قد نستخدم أيضاً ملفات تعريف ارتباط تحليلية لفهم كيفية استخدام المنصة.'
                        : 'We use essential cookies to operate the platform. We may also use analytics cookies to understand how the platform is used.'
                    }
                </p>

                <h3>{isArabic ? 'التواصل معنا' : 'Contact Us'}</h3>
                <p>
                    {isArabic
                        ? 'إذا كانت لديك أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر البريد الإلكتروني.'
                        : 'If you have questions about this privacy policy, please contact us via email.'
                    }
                </p>
            </div>
        </AboutLayout>
    )
}
