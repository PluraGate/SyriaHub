import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AboutLayout } from '@/components/AboutLayout'
import { Lock } from 'lucide-react'

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
                    {t('lastUpdated', { date: isArabic ? '17 ديسمبر 2025' : 'December 17, 2025' })}
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

                <h3>{isArabic ? 'مشاركة المعلومات' : 'Information Sharing'}</h3>
                <p>
                    {isArabic
                        ? 'لا نبيع معلوماتك الشخصية. قد نشارك المعلومات مع مقدمي الخدمات الذين يساعدوننا في تشغيل المنصة، أو عند الضرورة القانونية.'
                        : 'We do not sell your personal information. We may share information with service providers who help us operate the platform, or when legally required.'
                    }
                </p>

                <h3>{isArabic ? 'أمان البيانات' : 'Data Security'}</h3>
                <p>
                    {isArabic
                        ? 'نستخدم تدابير أمنية معيارية في الصناعة لحماية بياناتك، بما في ذلك التشفير والتحكم في الوصول.'
                        : 'We use industry-standard security measures to protect your data, including encryption and access controls.'
                    }
                </p>

                <h3>{isArabic ? 'حقوقك' : 'Your Rights'}</h3>
                <p>
                    {isArabic
                        ? 'لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها وحذفها. يمكنك أيضاً طلب نسخة من بياناتك أو طلب تقييد المعالجة.'
                        : 'You have the right to access, correct, and delete your personal data. You can also request a copy of your data or ask us to restrict processing.'
                    }
                </p>

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
