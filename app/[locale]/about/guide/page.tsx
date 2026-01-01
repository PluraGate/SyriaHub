import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AboutLayout } from '@/components/AboutLayout'
import { Link } from '@/navigation'
import {
    BookOpen,
    PenSquare,
    Scale,
    FlaskConical,
    Trophy,
    Shield,
    BarChart3,
    ArrowRight,
    ExternalLink
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    return {
        title: `User Guide | SyriaHub`,
        description: 'Complete guide to using SyriaHub - content creation, licensing, research tools, and more.'
    }
}

const sections = [
    {
        icon: PenSquare,
        titleEn: 'Creating Content',
        titleAr: 'إنشاء المحتوى',
        descEn: 'Learn how to write articles, ask questions, share resources, and create events.',
        descAr: 'تعلم كيفية كتابة المقالات وطرح الأسئلة ومشاركة الموارد وإنشاء الفعاليات.',
        anchor: '#creating-content'
    },
    {
        icon: Scale,
        titleEn: 'Understanding Licenses',
        titleAr: 'فهم التراخيص',
        descEn: 'Choose the right license for your work - CC BY, CC0, MIT, Apache, and more.',
        descAr: 'اختر الترخيص المناسب لعملك - CC BY، CC0، MIT، Apache، والمزيد.',
        anchor: '#licenses'
    },
    {
        icon: FlaskConical,
        titleEn: 'Research Lab Tools',
        titleAr: 'أدوات مختبر البحث',
        descEn: 'Multi-source search, AI question advisor, polls, surveys, and statistics.',
        descAr: 'البحث متعدد المصادر، مستشار الأسئلة الذكي، الاستطلاعات، والإحصائيات.',
        anchor: '#research-lab'
    },
    {
        icon: Trophy,
        titleEn: 'Gamification & Levels',
        titleAr: 'المكافآت والمستويات',
        descEn: 'Earn XP, level up, and unlock badges for your contributions.',
        descAr: 'اكسب نقاط الخبرة، ارتقِ بمستواك، واحصل على شارات لمساهماتك.',
        anchor: '#gamification'
    },
    {
        icon: Shield,
        titleEn: 'Moderation & Community',
        titleAr: 'الإشراف والمجتمع',
        descEn: 'How content review works, reporting, and the appeals process.',
        descAr: 'كيف تعمل مراجعة المحتوى، الإبلاغ، وعملية الاستئناف.',
        anchor: '#moderation'
    },
    {
        icon: BarChart3,
        titleEn: 'Analytics & Insights',
        titleAr: 'التحليلات والرؤى',
        descEn: 'Track your content performance, views, engagement, and impact.',
        descAr: 'تتبع أداء محتواك، المشاهدات، التفاعل، والتأثير.',
        anchor: '#analytics'
    },
    {
        icon: Shield,
        titleEn: 'Settings & Personalization',
        titleAr: 'الإعدادات والتخصيص',
        descEn: 'Customize appearance, privacy, notifications, and editor preferences.',
        descAr: 'تخصيص المظهر، الخصوصية، الإشعارات، وإعدادات المحرر.',
        anchor: '#settings'
    },
]

const licenses = [
    { code: 'CC BY 4.0', name: 'Attribution', descEn: 'Others can share and build upon your work with credit', descAr: 'يمكن للآخرين المشاركة والبناء على عملك مع الإسناد' },
    { code: 'CC BY-SA 4.0', name: 'ShareAlike', descEn: 'Same as CC BY, derivatives must use same license', descAr: 'مثل CC BY، المشتقات يجب أن تستخدم نفس الترخيص' },
    { code: 'CC BY-NC 4.0', name: 'NonCommercial', descEn: 'Non-commercial use only with credit', descAr: 'استخدام غير تجاري فقط مع الإسناد' },
    { code: 'CC0 1.0', name: 'Public Domain', descEn: 'No restrictions, full public domain', descAr: 'بدون قيود، ملكية عامة كاملة' },
    { code: 'MIT', name: 'MIT License', descEn: 'Maximum freedom for code/software', descAr: 'أقصى حرية للأكواد والبرمجيات' },
    { code: 'Apache 2.0', name: 'Apache License', descEn: 'Includes patent protection', descAr: 'يتضمن حماية براءات الاختراع' },
]

export default async function UserGuidePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isArabic = locale === 'ar'

    return (
        <AboutLayout user={user}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-secondary/10">
                        <BookOpen className="w-6 h-6 text-primary dark:text-secondary" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary dark:text-secondary m-0">
                        {isArabic ? 'دليل المستخدم' : 'User Guide'}
                    </h1>
                </div>

                <p className="text-lg text-text-light dark:text-dark-text-muted mb-8">
                    {isArabic
                        ? 'دليل شامل لاستخدام SyriaHub - من إنشاء المحتوى إلى أدوات البحث المتقدمة.'
                        : 'Everything you need to know to make the most of SyriaHub - from content creation to advanced research tools.'}
                </p>

                {/* Quick Navigation */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 not-prose mb-12">
                    {sections.map((section, i) => {
                        const Icon = section.icon
                        return (
                            <a
                                key={i}
                                href={section.anchor}
                                className="group flex items-start gap-3 p-4 rounded-lg border border-border dark:border-dark-border hover:border-primary dark:hover:border-secondary transition-colors bg-white dark:bg-dark-surface"
                            >
                                <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-secondary transition-colors text-sm">
                                        {isArabic ? section.titleAr : section.titleEn}
                                    </h3>
                                    <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                                        {isArabic ? section.descAr : section.descEn}
                                    </p>
                                </div>
                            </a>
                        )
                    })}
                </div>

                {/* Getting Started */}
                <h2 id="getting-started" className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4">
                    {isArabic ? 'البداية' : 'Getting Started'}
                </h2>
                <p>
                    {isArabic
                        ? 'SyriaHub تستخدم نظام الدعوات فقط للحفاظ على جودة المجتمع. ستحتاج إلى رمز دعوة من عضو موجود لإنشاء حساب.'
                        : 'SyriaHub uses an invitation-only system to maintain community quality. You\'ll need an invitation code from an existing member to create an account.'}
                </p>
                <div className="not-prose my-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-border dark:border-dark-border rounded-lg overflow-hidden">
                            <thead className="bg-gray-50 dark:bg-dark-surface">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-text dark:text-dark-text">{isArabic ? 'الدور' : 'Role'}</th>
                                    <th className="px-4 py-3 text-left font-semibold text-text dark:text-dark-text">{isArabic ? 'الصلاحيات' : 'Capabilities'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-dark-border">
                                <tr className="bg-white dark:bg-dark-bg">
                                    <td className="px-4 py-3 font-medium text-text dark:text-dark-text">{isArabic ? 'عضو' : 'Member'}</td>
                                    <td className="px-4 py-3 text-text-light dark:text-dark-text-muted">{isArabic ? 'أسئلة، تعليقات، متابعة، فعاليات' : 'Ask questions, comment, follow, join events'}</td>
                                </tr>
                                <tr className="bg-white dark:bg-dark-bg">
                                    <td className="px-4 py-3 font-medium text-text dark:text-dark-text">{isArabic ? 'باحث' : 'Researcher'}</td>
                                    <td className="px-4 py-3 text-text-light dark:text-dark-text-muted">{isArabic ? '+ نشر مقالات، مشاركة موارد، تنظيم فعاليات' : '+ Publish articles, share resources, organize events'}</td>
                                </tr>
                                <tr className="bg-white dark:bg-dark-bg">
                                    <td className="px-4 py-3 font-medium text-text dark:text-dark-text">{isArabic ? 'مشرف' : 'Moderator'}</td>
                                    <td className="px-4 py-3 text-text-light dark:text-dark-text-muted">{isArabic ? '+ مراجعة محتوى، إدارة تقارير، إدارة وسوم' : '+ Review content, handle reports, manage tags'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Creating Content */}
                <h2 id="creating-content" className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4">
                    {isArabic ? 'إنشاء المحتوى' : 'Creating Content'}
                </h2>
                <p>
                    {isArabic
                        ? 'يدعم SyriaHub عدة أنواع من المحتوى: المقالات البحثية، الأسئلة والأجوبة، الموارد (مجموعات البيانات، الأدوات)، والفعاليات.'
                        : 'SyriaHub supports several content types: Research articles, Questions & Answers, Resources (datasets, tools), and Events.'}
                </p>
                <p>
                    {isArabic
                        ? 'لإنشاء محتوى، انقر على زر "كتابة" في شريط التنقل، اختر نوع المحتوى، واملأ التفاصيل.'
                        : 'To create content, click "Write" in the navbar, select your content type, and fill in the details.'}
                </p>

                {/* Licenses Section */}
                <h2 id="licenses" className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4">
                    {isArabic ? 'فهم التراخيص' : 'Understanding Licenses'}
                </h2>
                <p>
                    {isArabic
                        ? 'عند نشر محتوى، تختار كيف يمكن للآخرين استخدامه. اختيار الترخيص الصحيح يزيد من تأثير عملك مع حماية حقوقك.'
                        : 'When you publish content, you choose how others can use it. Choosing the right license maximizes your work\'s impact while protecting your rights.'}
                </p>
                <div className="not-prose my-6">
                    <div className="grid gap-3 md:grid-cols-2">
                        {licenses.map((license, i) => (
                            <div key={i} className="p-4 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary text-xs font-mono font-bold">
                                        {license.code}
                                    </span>
                                    <span className="font-medium text-text dark:text-dark-text text-sm">{license.name}</span>
                                </div>
                                <p className="text-xs text-text-light dark:text-dark-text-muted">
                                    {isArabic ? license.descAr : license.descEn}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 not-prose">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>{isArabic ? 'نصيحة:' : 'Tip:'}</strong> {isArabic
                            ? 'CC BY 4.0 هو الأفضل للأوراق البحثية (يزيد الاستشهادات). CC0 أو CC BY مثالي لمجموعات البيانات.'
                            : 'CC BY 4.0 is best for research papers (maximizes citations). CC0 or CC BY is ideal for datasets.'}
                    </p>
                </div>

                {/* Research Lab */}
                <h2 id="research-lab" className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4">
                    {isArabic ? 'مختبر البحث' : 'Research Lab Tools'}
                </h2>
                <p>
                    {isArabic
                        ? 'الوصول إلى مختبر البحث عبر زر التنقل أو من خلال /research-lab.'
                        : 'Access the Research Lab via the navigation button or at /research-lab.'}
                </p>
                <ul className="not-prose my-4 space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-primary dark:text-secondary">•</span>
                        <span className="text-text dark:text-dark-text"><strong>{isArabic ? 'البحث متعدد المصادر:' : 'Multi-Source Search:'}</strong> {isArabic ? 'ابحث في SyriaHub + ReliefWeb + HDX + World Bank' : 'Search SyriaHub + ReliefWeb + HDX + World Bank'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary dark:text-secondary">•</span>
                        <span className="text-text dark:text-dark-text"><strong>{isArabic ? 'مستشار الأسئلة:' : 'AI Question Advisor:'}</strong> {isArabic ? 'احصل على ملاحظات حول أسئلتك البحثية' : 'Get feedback on your research questions'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary dark:text-secondary">•</span>
                        <span className="text-text dark:text-dark-text"><strong>{isArabic ? 'الاستطلاعات:' : 'Polls & Surveys:'}</strong> {isArabic ? 'أنشئ أدوات بحث احترافية' : 'Create professional research instruments'}</span>
                    </li>
                </ul>

                {/* Gamification */}
                <h2 id="gamification" className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4">
                    {isArabic ? 'المكافآت والمستويات' : 'Gamification & Levels'}
                </h2>
                <p>
                    {isArabic
                        ? 'اكسب نقاط الخبرة (XP) من خلال المشاركة: نشر مقالات (+50)، الإجابة على الأسئلة (+20)، استلام تصويت (+5)، وأكثر.'
                        : 'Earn XP through participation: publishing articles (+50), answering questions (+20), receiving upvotes (+5), and more.'}
                </p>
                <p>
                    {isArabic
                        ? 'ارتقِ بمستواك واحصل على شارات للإنجازات. شاهد تقدمك في صفحة ملفك الشخصي.'
                        : 'Level up and earn badges for achievements. View your progress on your Profile page.'}
                </p>

                {/* Moderation */}
                <h2 id="moderation" className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4">
                    {isArabic ? 'الإشراف والمجتمع' : 'Moderation & Community'}
                </h2>
                <p>
                    {isArabic
                        ? 'يتم مراجعة كل المحتوى المنشور للحفاظ على الجودة. إذا تم رفض محتواك، يمكنك الاستئناف مع شرح.'
                        : 'All published content goes through review to ensure quality. If your content is rejected, you can appeal with an explanation.'}
                </p>

                {/* Analytics */}
                <h2 id="analytics" className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4">
                    {isArabic ? 'التحليلات' : 'Analytics & Insights'}
                </h2>
                <p>
                    {isArabic
                        ? 'الوصول إلى لوحة التحليلات الخاصة بك عبر القائمة المنسدلة لصورتك الشخصية ← التحليلات. تتبع المشاهدات، التفاعل، المنشورات، الاستشهادات، المتابعين، ونقاط الثقة.'
                        : 'Access your analytics dashboard via your avatar dropdown → Analytics. Track views, engagement, publications, citations, followers, and trust score.'}
                </p>

                {/* Settings & Personalization */}
                <h2 id="settings" className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4">
                    {isArabic ? 'الإعدادات والتخصيص' : 'Settings & Personalization'}
                </h2>
                <p>
                    {isArabic
                        ? 'قم بتخصيص تجربتك في SyriaHub من خلال صفحة الإعدادات (القائمة المنسدلة للصورة الشخصية ← الإعدادات).'
                        : 'Customize your SyriaHub experience via the Settings page (avatar dropdown → Settings).'}
                </p>
                <ul className="not-prose my-4 space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-primary dark:text-secondary">•</span>
                        <span className="text-text dark:text-dark-text"><strong>{isArabic ? 'المظهر:' : 'Appearance:'}</strong> {isArabic ? 'اختر بين الوضع الفاتح أو الداكن أو النظام.' : 'Choose between Light, Dark, or System theme.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary dark:text-secondary">•</span>
                        <span className="text-text dark:text-dark-text"><strong>{isArabic ? 'العرض:' : 'Display:'}</strong> {isArabic ? 'الوضع المضغوط، إظهار الصور الرمزية، عدد المنشورات لكل صفحة، التقويم (هجري/ميلادي).' : 'Compact mode, show avatars, posts per page, calendar (Hijri/Gregorian).'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary dark:text-secondary">•</span>
                        <span className="text-text dark:text-dark-text"><strong>{isArabic ? 'الخصوصية:' : 'Privacy:'}</strong> {isArabic ? 'التحكم في رؤية ملفك الشخصي، عرض البريد الإلكتروني، والسماح بالرسائل من المستخدمين الآخرين.' : 'Control your profile visibility, email display, and allow messages from other users.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary dark:text-secondary">•</span>
                        <span className="text-text dark:text-dark-text"><strong>{isArabic ? 'المحرر:' : 'Editor:'}</strong> {isArabic ? 'الحفظ التلقائي، التدقيق الإملائي، وأرقام الأسطر.' : 'Auto-save, spellcheck, and line numbers.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary dark:text-secondary">•</span>
                        <span className="text-text dark:text-dark-text"><strong>{isArabic ? 'الإشعارات:' : 'Notifications:'}</strong> {isArabic ? 'تحكم في إشعارات البريد الإلكتروني للإشارات والردود والمتابعين الجدد.' : 'Control email notifications for mentions, replies, and new followers.'}</span>
                    </li>
                </ul>
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 not-prose">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>{isArabic ? 'ملاحظة:' : 'Note:'}</strong>{' '}
                        {isArabic
                            ? 'الإعدادات الافتراضية: الوضع الداكن، جميع الإشعارات مفعلة، الملف الشخصي عام، البريد الإلكتروني مخفي، الرسائل معطلة.'
                            : 'Default settings: Dark mode, all notifications ON, public profile, email hidden, messages OFF.'}
                    </p>
                </div>

                {/* Help Links */}
                <div className="mt-12 p-6 rounded-xl bg-primary/5 dark:bg-secondary/5 border border-primary/10 dark:border-secondary/10 not-prose">
                    <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
                        {isArabic ? 'روابط مفيدة' : 'Helpful Links'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/about/faq" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-sm text-text dark:text-dark-text hover:border-primary dark:hover:border-secondary transition-colors">
                            {isArabic ? 'الأسئلة الشائعة' : 'FAQ'}
                            <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                        </Link>
                        <Link href="/about/roles" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-sm text-text dark:text-dark-text hover:border-primary dark:hover:border-secondary transition-colors">
                            {isArabic ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}
                            <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                        </Link>
                        <Link href="/about/ethics" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-sm text-text dark:text-dark-text hover:border-primary dark:hover:border-secondary transition-colors">
                            {isArabic ? 'قواعد المجتمع' : 'Community Guidelines'}
                            <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                        </Link>
                    </div>
                </div>
            </div>
        </AboutLayout>
    )
}
