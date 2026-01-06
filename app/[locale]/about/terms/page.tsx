import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AboutLayout } from '@/components/AboutLayout'
import { FileText } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    return {
        title: `${t('terms')} | SyriaHub`,
        description: t('termsTitle')
    }
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isArabic = locale === 'ar'

    return (
        <AboutLayout user={user}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-6 flex items-center gap-3">
                    <FileText className="w-7 h-7" />
                    {t('termsTitle')}
                </h2>

                <p className="text-sm text-text-muted dark:text-dark-text-muted mb-6">
                    {t('lastUpdated', { date: isArabic ? '17 ديسمبر 2025' : 'December 17, 2025' })}
                </p>

                <h3>{isArabic ? 'قبول الشروط' : 'Acceptance of Terms'}</h3>
                <p>
                    {isArabic
                        ? 'باستخدام SyriaHub، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق على أي جزء من الشروط، فلا يجوز لك استخدام خدماتنا.'
                        : 'By using SyriaHub, you agree to be bound by these terms. If you disagree with any part of the terms, you may not use our services.'
                    }
                </p>

                <h3>{isArabic ? 'الحسابات' : 'Accounts'}</h3>
                <p>
                    {isArabic
                        ? 'أنت مسؤول عن الحفاظ على أمان حسابك وكلمة مرورك. لا يجوز لك مشاركة بيانات اعتماد حسابك مع الآخرين.'
                        : 'You are responsible for maintaining the security of your account and password. You may not share your account credentials with others.'
                    }
                </p>

                <h3>{isArabic ? 'المحتوى' : 'Content'}</h3>
                <p>
                    {isArabic
                        ? 'أنت تحتفظ بملكية المحتوى الذي تنشره. بنشر المحتوى، تمنحنا ترخيصاً لعرضه وتوزيعه على المنصة.'
                        : 'You retain ownership of content you post. By posting content, you grant us a license to display and distribute it on the platform.'
                    }
                </p>

                <h3>{isArabic ? 'السلوك المحظور' : 'Prohibited Conduct'}</h3>
                <ul>
                    <li>{isArabic ? 'انتهاك حقوق الملكية الفكرية' : 'Violating intellectual property rights'}</li>
                    <li>{isArabic ? 'نشر محتوى ضار أو غير قانوني' : 'Posting harmful or illegal content'}</li>
                    <li>{isArabic ? 'الإساءة اللفظية للمستخدمين الآخرين' : 'Harassing other users'}</li>
                    <li>{isArabic ? 'محاولة الوصول غير المصرح به' : 'Attempting unauthorized access'}</li>
                    <li>{isArabic ? 'استخدام المنصة لأغراض تجارية غير مصرح بها' : 'Using the platform for unauthorized commercial purposes'}</li>
                </ul>

                <h3>{isArabic ? 'الإنهاء' : 'Termination'}</h3>
                <p>
                    {isArabic
                        ? 'يجوز لنا إنهاء أو تعليق حسابك في أي وقت بسبب انتهاكات هذه الشروط. يمكنك أيضاً حذف حسابك في أي وقت.'
                        : 'We may terminate or suspend your account at any time for violations of these terms. You may also delete your account at any time.'
                    }
                </p>

                <h3>{isArabic ? 'إخلاء المسؤولية' : 'Disclaimers'}</h3>
                <p>
                    {isArabic
                        ? 'تُقدم الخدمة "كما هي" دون أي ضمانات. لا نتحمل مسؤولية دقة المحتوى الذي ينشره المستخدمون.'
                        : 'The service is provided "as is" without warranties. We are not responsible for the accuracy of user-posted content.'
                    }
                </p>

                <h3>{isArabic ? 'تحديد المسؤولية' : 'Limitation of Liability'}</h3>
                <p>
                    {isArabic
                        ? 'لن نتحمل المسؤولية عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية ناتجة عن استخدامك للمنصة.'
                        : 'We shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the platform.'
                    }
                </p>

                <h3>{isArabic ? 'التغييرات على الشروط' : 'Changes to Terms'}</h3>
                <p>
                    {isArabic
                        ? 'قد نقوم بتحديث هذه الشروط من وقت لآخر. سنقوم بإخطارك بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار على المنصة.'
                        : 'We may update these terms from time to time. We will notify you of material changes via email or a notice on the platform.'
                    }
                </p>
            </div>
        </AboutLayout>
    )
}
