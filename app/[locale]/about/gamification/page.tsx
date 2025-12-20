import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AboutLayout } from '@/components/AboutLayout'
import { Link } from '@/navigation'
import {
    Trophy,
    Star,
    Flame,
    Medal,
    Crown,
    Zap,
    Award,
    TrendingUp,
    Users,
    Gift
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    return {
        title: `Gamification & Levels | SyriaHub`,
        description: 'Learn how to earn XP, level up, unlock achievements, and build community trust on SyriaHub.'
    }
}

const xpActivities = [
    { action: 'Publish a post', xp: 20, icon: '📝' },
    { action: 'Leave a comment', xp: 2, icon: '💬' },
    { action: 'Answer accepted', xp: 30, icon: '✅' },
    { action: 'Receive upvote', xp: 5, icon: '👍' },
    { action: 'Complete profile', xp: 50, icon: '👤' },
    { action: 'Invite a member', xp: 25, icon: '📨' },
]

const tiers = [
    { name: 'Bronze', levels: '1-10', xp: '0 - 2,700', color: 'bg-amber-500', emoji: '🥉' },
    { name: 'Silver', levels: '11-25', xp: '3,300 - 22,200', color: 'bg-gray-400', emoji: '🥈' },
    { name: 'Gold', levels: '26-40', xp: '24,300 - 64,200', color: 'bg-yellow-500', emoji: '🥇' },
    { name: 'Platinum', levels: '41-50', xp: '67,800 - 104,700', color: 'bg-purple-500', emoji: '💎' },
]

const achievements = [
    { name: 'First Steps', desc: 'Create your first post', icon: Star, xp: 25, category: 'contribution' },
    { name: 'Prolific Writer', desc: 'Create 10 posts', icon: Award, xp: 100, category: 'contribution' },
    { name: 'Helpful Hand', desc: '5 answers accepted', icon: Users, xp: 150, category: 'community' },
    { name: 'Community Pillar', desc: '25 answers accepted', icon: Trophy, xp: 500, category: 'community' },
    { name: 'Rising Star', desc: '100 reputation points', icon: Star, xp: 50, category: 'expertise' },
    { name: 'Expert', desc: '500 reputation points', icon: Medal, xp: 200, category: 'expertise' },
    { name: 'Master', desc: '2,000 reputation points', icon: Crown, xp: 750, category: 'expertise' },
    { name: 'Consistent', desc: '7-day login streak', icon: Flame, xp: 100, category: 'special' },
    { name: 'Dedicated', desc: '30-day login streak', icon: Zap, xp: 500, category: 'special' },
]

export default async function GamificationPage({ params }: { params: Promise<{ locale: string }> }) {
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
                        <Trophy className="w-6 h-6 text-primary dark:text-secondary" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary dark:text-secondary m-0">
                        {isArabic ? 'نظام المكافآت والمستويات' : 'Gamification & Levels'}
                    </h1>
                </div>

                <p className="text-lg text-text-light dark:text-dark-text-muted mb-8">
                    {isArabic
                        ? 'اكسب نقاط الخبرة (XP) وارتقِ بمستواك واحصل على شارات إنجاز لمساهماتك في المجتمع.'
                        : 'Earn XP, level up, and unlock achievement badges for your contributions to the community.'}
                </p>

                {/* XP Activities */}
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mt-8 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {isArabic ? 'كيف تكسب نقاط الخبرة' : 'How to Earn XP'}
                </h2>

                <div className="not-prose grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {xpActivities.map((activity, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                            <span className="text-2xl">{activity.icon}</span>
                            <div className="flex-1">
                                <p className="font-medium text-text dark:text-dark-text text-sm">
                                    {activity.action}
                                </p>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold">
                                +{activity.xp} XP
                            </span>
                        </div>
                    ))}
                </div>

                {/* Tiers */}
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    {isArabic ? 'مستويات الرتب' : 'Tier Progression'}
                </h2>

                <div className="not-prose grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    {tiers.map((tier, i) => (
                        <div key={i} className="p-4 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-center">
                            <span className="text-4xl mb-2 block">{tier.emoji}</span>
                            <h3 className="font-bold text-text dark:text-dark-text">{tier.name}</h3>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                {isArabic ? 'المستويات' : 'Levels'} {tier.levels}
                            </p>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                                {tier.xp} XP
                            </p>
                            <div className={`w-full h-1 rounded-full mt-3 ${tier.color}`}></div>
                        </div>
                    ))}
                </div>

                {/* Level Benefits Highlight */}
                <div className="not-prose p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 border border-primary/20 dark:border-secondary/20 mb-8">
                    <h3 className="text-lg font-bold text-primary dark:text-secondary mb-3">
                        {isArabic ? 'مميزات الترقية' : 'Level-Up Benefits'}
                    </h3>
                    <ul className="space-y-2 text-sm text-text dark:text-dark-text">
                        <li className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary dark:text-secondary" />
                            <span><strong>{isArabic ? 'المستوى 4:' : 'Level 4:'}</strong> {isArabic ? 'صورة شخصية مخصصة' : 'Custom avatar'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary dark:text-secondary" />
                            <span><strong>{isArabic ? 'المستوى 15:' : 'Level 15:'}</strong> {isArabic ? 'إنشاء مجموعات' : 'Create groups'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary dark:text-secondary" />
                            <span><strong>{isArabic ? 'المستوى 16:' : 'Level 16:'}</strong> {isArabic ? 'حالة التحقق' : 'Verified status'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary dark:text-secondary" />
                            <span><strong>{isArabic ? 'المستوى 32:' : 'Level 32:'}</strong> {isArabic ? 'وصول VIP للفعاليات' : 'VIP event access'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary dark:text-secondary" />
                            <span><strong>{isArabic ? 'المستوى 50:' : 'Level 50:'}</strong> {isArabic ? 'تاج القمة + كل المميزات' : 'Apex crown + all perks'}</span>
                        </li>
                    </ul>
                </div>

                {/* Achievements */}
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4 flex items-center gap-2">
                    <Medal className="w-5 h-5" />
                    {isArabic ? 'الإنجازات والشارات' : 'Achievements & Badges'}
                </h2>

                <p className="mb-6">
                    {isArabic
                        ? 'اكسب شارات خاصة لإنجازات محددة. كل شارة تمنحك نقاط XP إضافية!'
                        : 'Earn special badges for specific accomplishments. Each badge grants bonus XP!'}
                </p>

                <div className="not-prose grid gap-3 md:grid-cols-2 mb-8">
                    {achievements.map((achievement, i) => {
                        const Icon = achievement.icon
                        return (
                            <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                <div className="p-2 rounded-lg bg-primary/10 dark:bg-secondary/10">
                                    <Icon className="w-5 h-5 text-primary dark:text-secondary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-text dark:text-dark-text text-sm">
                                        {achievement.name}
                                    </p>
                                    <p className="text-xs text-text-muted dark:text-dark-text-muted">
                                        {achievement.desc}
                                    </p>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
                                    +{achievement.xp} XP
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Community Trust */}
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {isArabic ? 'ثقة المجتمع' : 'Community Trust'}
                </h2>

                <p>
                    {isArabic
                        ? 'مستواك وإنجازاتك تساهم في درجة ثقة المجتمع الخاصة بك. الثقة الأعلى تفتح:'
                        : 'Your level and achievements contribute to your community trust score. Higher trust unlocks:'}
                </p>

                <ul className="not-prose my-4 space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-text dark:text-dark-text">{isArabic ? 'دعوات موسعة لأعضاء جدد' : 'Extended invitations for new members'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-text dark:text-dark-text">{isArabic ? 'مراجعة أسرع للمحتوى' : 'Priority content review'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-text dark:text-dark-text">{isArabic ? 'ملف شخصي مميز' : 'Featured profile visibility'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-text dark:text-dark-text">{isArabic ? 'وصول مبكر للميزات الجديدة' : 'Early access to new features'}</span>
                    </li>
                </ul>

                {/* Tips */}
                <div className="not-prose mt-12 p-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-3">
                        💡 {isArabic ? 'نصائح للتقدم السريع' : 'Tips for Fast Progression'}
                    </h3>
                    <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
                        <li>• {isArabic ? 'أجب على الأسئلة - أعلى XP عند قبول الإجابة' : 'Answer questions - highest XP for accepted solutions (+30)'}</li>
                        <li>• {isArabic ? 'أكمل ملفك الشخصي - مكافأة فورية +50 XP' : 'Complete your profile - instant +50 XP bonus'}</li>
                        <li>• {isArabic ? 'سلسلة تسجيل دخول - 7 أيام = +100 XP إضافي' : 'Login streaks - 7 days = +100 XP achievement'}</li>
                        <li>• {isArabic ? 'ادعُ أصدقاءك - +25 XP لكل دعوة ناجحة' : 'Invite friends - +25 XP per successful invite'}</li>
                    </ul>
                </div>

                {/* View Progress Link */}
                <div className="not-prose mt-8 flex justify-center">
                    <Link
                        href="/analytics"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                    >
                        <TrendingUp className="w-4 h-4" />
                        {isArabic ? 'عرض تقدمي' : 'View My Progress'}
                    </Link>
                </div>
            </div>
        </AboutLayout>
    )
}
