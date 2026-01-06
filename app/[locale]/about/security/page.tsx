import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AboutLayout } from '@/components/AboutLayout'
import { Link } from '@/navigation'
import {
    Shield,
    Mail,
    Clock,
    CheckCircle,
    AlertTriangle,
    Lock,
    FileText,
    ExternalLink
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    return {
        title: `${t('security.title')} | SyriaHub`,
        description: t('security.subtitle')
    }
}

export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isRTL = locale === 'ar'

    return (
        <AboutLayout user={user}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-4">
                    {t('security.title')}
                </h2>

                <p className="text-lg text-text-light dark:text-dark-text-muted mb-8">
                    {t('security.subtitle')}
                </p>

                {/* Vulnerability Disclosure Section */}
                <div className="not-prose mb-8">
                    <div className="p-6 rounded-xl bg-primary/5 dark:bg-secondary/5 border border-primary/10 dark:border-secondary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10 dark:bg-secondary/10">
                                <AlertTriangle className="w-6 h-6 text-primary dark:text-secondary" />
                            </div>
                            <h3 className="text-xl font-semibold text-primary dark:text-secondary">
                                {t('security.vdp.title')}
                            </h3>
                        </div>
                        <p className="text-text dark:text-dark-text mb-4">
                            {t('security.vdp.intro')}
                        </p>

                        {/* Reporting Steps */}
                        <div className="grid gap-4 md:grid-cols-3 mt-6">
                            <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-dark-bg/50 rounded-lg">
                                <Mail className="w-5 h-5 text-primary dark:text-secondary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-text dark:text-dark-text text-sm">
                                        {t('security.vdp.step1Title')}
                                    </p>
                                    <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                                        security@syriahub.org
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-dark-bg/50 rounded-lg">
                                <Clock className="w-5 h-5 text-primary dark:text-secondary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-text dark:text-dark-text text-sm">
                                        {t('security.vdp.step2Title')}
                                    </p>
                                    <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                                        {t('security.vdp.step2Desc')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-dark-bg/50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-primary dark:text-secondary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-text dark:text-dark-text text-sm">
                                        {t('security.vdp.step3Title')}
                                    </p>
                                    <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                                        {t('security.vdp.step3Desc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* What to Report */}
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mt-8 mb-4">
                    {t('security.scope.title')}
                </h3>

                <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
                    {/* In Scope */}
                    <div className="p-5 rounded-lg border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20">
                        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {t('security.scope.inScope')}
                        </h4>
                        <ul className="space-y-2 text-sm text-text dark:text-dark-text">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400">•</span>
                                {t('security.scope.item1')}
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400">•</span>
                                {t('security.scope.item2')}
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400">•</span>
                                {t('security.scope.item3')}
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400">•</span>
                                {t('security.scope.item4')}
                            </li>
                        </ul>
                    </div>

                    {/* Out of Scope */}
                    <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-surface">
                        <h4 className="font-semibold text-text-muted dark:text-dark-text-muted mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {t('security.scope.outOfScope')}
                        </h4>
                        <ul className="space-y-2 text-sm text-text-muted dark:text-dark-text-muted">
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                {t('security.scope.outItem1')}
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                {t('security.scope.outItem2')}
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                {t('security.scope.outItem3')}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Our Commitment */}
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mt-8 mb-4">
                    {t('security.commitment.title')}
                </h3>

                <div className="not-prose grid gap-3 mb-8">
                    {[
                        { icon: Clock, key: 'commitment1' },
                        { icon: FileText, key: 'commitment2' },
                        { icon: CheckCircle, key: 'commitment3' },
                        { icon: Lock, key: 'commitment4' },
                    ].map((item) => {
                        const Icon = item.icon
                        return (
                            <div
                                key={item.key}
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface border border-border dark:border-dark-border"
                            >
                                <Icon className="w-5 h-5 text-primary dark:text-secondary flex-shrink-0" />
                                <span className="text-text dark:text-dark-text text-sm">
                                    {t(`security.commitment.${item.key}`)}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Security Infrastructure (from Jan 2026 Audit) */}
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mt-8 mb-4">
                    {isRTL ? 'البنية التحتية للأمان' : 'Security Infrastructure'}
                </h3>

                <p className="text-text-muted dark:text-dark-text-muted mb-4">
                    {isRTL
                        ? 'تخضع منصتنا لمراجعات أمنية منتظمة. فيما يلي التدابير الأمنية المطبقة اعتباراً من يناير 2026:'
                        : 'Our platform undergoes regular security reviews. Here are the security measures implemented as of January 2026:'
                    }
                </p>

                <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
                    <div className="p-5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                        <h4 className="font-semibold text-text dark:text-dark-text mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary dark:text-secondary" />
                            {isRTL ? 'التحقق من الأصل' : 'Origin Validation'}
                        </h4>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted">
                            {isRTL
                                ? 'جميع نقاط النهاية المتغيرة محمية بالتحقق من أصل الطلب لمنع هجمات تزوير الطلبات عبر المواقع (CSRF).'
                                : 'All mutation endpoints are protected with origin validation to prevent Cross-Site Request Forgery (CSRF) attacks.'
                            }
                        </p>
                    </div>
                    <div className="p-5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                        <h4 className="font-semibold text-text dark:text-dark-text mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary dark:text-secondary" />
                            {isRTL ? 'تحديد معدل الطلبات' : 'Rate Limiting'}
                        </h4>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted">
                            {isRTL
                                ? 'حماية من إساءة الاستخدام عبر تحديد معدل الطلبات المستند إلى IP على جميع نقاط النهاية.'
                                : 'IP-based rate limiting on all endpoints protects against abuse and brute-force attacks.'
                            }
                        </p>
                    </div>
                    <div className="p-5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                        <h4 className="font-semibold text-text dark:text-dark-text mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary dark:text-secondary" />
                            {isRTL ? 'التحقق عبر Turnstile' : 'Turnstile Verification'}
                        </h4>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted">
                            {isRTL
                                ? 'حماية من الروبوتات على النماذج العامة مع فشل آمن في وضع الإنتاج.'
                                : 'Bot protection on public forms with fail-closed behavior in production mode.'
                            }
                        </p>
                    </div>
                    <div className="p-5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                        <h4 className="font-semibold text-text dark:text-dark-text mb-3 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-primary dark:text-secondary" />
                            {isRTL ? 'الرموز التشفيرية' : 'Cryptographic Tokens'}
                        </h4>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted">
                            {isRTL
                                ? 'جميع الرموز العامة يتم إنشاؤها باستخدام دوال تشفير آمنة (gen_random_bytes).'
                                : 'All public tokens are generated using secure cryptographic functions (gen_random_bytes).'
                            }
                        </p>
                    </div>
                </div>

                {/* Protected Endpoints */}
                <div className="not-prose mb-8 p-5 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {isRTL ? 'نقاط النهاية المحمية' : 'Protected Endpoints'}
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                        {isRTL
                            ? 'جميع نقاط النهاية الحساسة محمية بالتحقق من الأصل وتحديد معدل الطلبات:'
                            : 'All sensitive endpoints are protected with origin validation and rate limiting:'
                        }
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Posts', 'Comments', 'Reports', 'Moderation', 'Votes', 'Bookmarks', 'Polls', 'Surveys'].map((endpoint) => (
                            <span key={endpoint} className="px-2 py-1 rounded bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 text-xs font-mono">
                                {endpoint}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Security.txt Link */}
                <div className="not-prose mt-8 p-4 rounded-lg bg-gray-100 dark:bg-dark-bg border border-border dark:border-dark-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-text-muted dark:text-dark-text-muted" />
                            <span className="text-sm text-text-muted dark:text-dark-text-muted">
                                {t('security.securityTxt')}
                            </span>
                        </div>
                        <a
                            href="/.well-known/security.txt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary dark:text-secondary hover:underline"
                        >
                            security.txt
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </AboutLayout>
    )
}
