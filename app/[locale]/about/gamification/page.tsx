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
    Gift,
    FileText,
    MessageCircle,
    CheckCircle,
    ThumbsUp,
    UserCircle,
    Mail,
    Gem,
    Check,
    LucideIcon
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations('Gamification')
    return {
        title: `${t('title')} | SyriaHub`,
        description: t('subtitle')
    }
}

interface XpActivity {
    key: string
    xp: number
    Icon: LucideIcon
}

interface Tier {
    key: string
    levels: string
    xp: string
    color: string
    Icon: LucideIcon
}

interface Achievement {
    key: string
    descKey: string
    Icon: LucideIcon
    xp: number
}

const xpActivities: XpActivity[] = [
    { key: 'publishPost', xp: 20, Icon: FileText },
    { key: 'leaveComment', xp: 2, Icon: MessageCircle },
    { key: 'answerAccepted', xp: 30, Icon: CheckCircle },
    { key: 'receiveUpvote', xp: 5, Icon: ThumbsUp },
    { key: 'completeProfile', xp: 50, Icon: UserCircle },
    { key: 'inviteMember', xp: 25, Icon: Mail },
]

const tiers: Tier[] = [
    { key: 'bronze', levels: '1-10', xp: '0 - 2,700', color: 'bg-amber-600', Icon: Award },
    { key: 'silver', levels: '11-25', xp: '3,300 - 22,200', color: 'bg-gray-400', Icon: Medal },
    { key: 'gold', levels: '26-40', xp: '24,300 - 64,200', color: 'bg-yellow-500', Icon: Trophy },
    { key: 'platinum', levels: '41-50', xp: '67,800 - 104,700', color: 'bg-purple-500', Icon: Gem },
]

const achievements: Achievement[] = [
    { key: 'firstSteps', descKey: 'firstStepsDesc', Icon: Star, xp: 25 },
    { key: 'prolificWriter', descKey: 'prolificWriterDesc', Icon: Award, xp: 100 },
    { key: 'helpfulHand', descKey: 'helpfulHandDesc', Icon: Users, xp: 150 },
    { key: 'communityPillar', descKey: 'communityPillarDesc', Icon: Trophy, xp: 500 },
    { key: 'risingStar', descKey: 'risingStarDesc', Icon: Star, xp: 50 },
    { key: 'expert', descKey: 'expertDesc', Icon: Medal, xp: 200 },
    { key: 'master', descKey: 'masterDesc', Icon: Crown, xp: 750 },
    { key: 'consistent', descKey: 'consistentDesc', Icon: Flame, xp: 100 },
    { key: 'dedicated', descKey: 'dedicatedDesc', Icon: Zap, xp: 500 },
]

export default async function GamificationPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const t = await getTranslations('Gamification')

    return (
        <AboutLayout user={user}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-secondary/10">
                        <Trophy className="w-6 h-6 text-primary dark:text-secondary" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary dark:text-secondary m-0">
                        {t('title')}
                    </h1>
                </div>

                <p className="text-lg text-text-light dark:text-dark-text-muted mb-8">
                    {t('subtitle')}
                </p>

                {/* XP Activities */}
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mt-8 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {t('howToEarnXP')}
                </h2>

                <div className="not-prose grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {xpActivities.map((activity) => {
                        const Icon = activity.Icon
                        return (
                            <div key={activity.key} className="flex items-center gap-3 p-4 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                <div className="p-2 rounded-lg bg-primary/10 dark:bg-secondary/10">
                                    <Icon className="w-5 h-5 text-primary dark:text-secondary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-text dark:text-dark-text text-sm">
                                        {t(`activities.${activity.key}`)}
                                    </p>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold">
                                    +{activity.xp} XP
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Tiers */}
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    {t('tierProgression')}
                </h2>

                <div className="not-prose grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    {tiers.map((tier) => {
                        const Icon = tier.Icon
                        return (
                            <div key={tier.key} className="p-4 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-center">
                                <div className="flex justify-center mb-2">
                                    <div className={`p-3 rounded-full ${tier.color}/20`}>
                                        <Icon className={`w-8 h-8 ${tier.color.replace('bg-', 'text-')}`} />
                                    </div>
                                </div>
                                <h3 className="font-bold text-text dark:text-dark-text">{t(`tiers.${tier.key}`)}</h3>
                                <p className="text-sm text-text-light dark:text-dark-text-muted">
                                    {t('levels')} {tier.levels}
                                </p>
                                <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                                    {tier.xp} XP
                                </p>
                                <div className={`w-full h-1 rounded-full mt-3 ${tier.color}`}></div>
                            </div>
                        )
                    })}
                </div>

                {/* Level Benefits */}
                <div className="not-prose p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 border border-primary/20 dark:border-secondary/20 mb-8">
                    <h3 className="text-lg font-bold text-primary dark:text-secondary mb-3">
                        {t('levelUpBenefits')}
                    </h3>
                    <ul className="space-y-2 text-sm text-text dark:text-dark-text">
                        <li className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary dark:text-secondary" />
                            <span><strong>{t('level')} 4:</strong> {t('benefits.customAvatar')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary dark:text-secondary" />
                            <span><strong>{t('level')} 15:</strong> {t('benefits.createGroups')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary dark:text-secondary" />
                            <span><strong>{t('level')} 16:</strong> {t('benefits.verifiedStatus')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary dark:text-secondary" />
                            <span><strong>{t('level')} 32:</strong> {t('benefits.vipAccess')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary dark:text-secondary" />
                            <span><strong>{t('level')} 50:</strong> {t('benefits.apexCrown')}</span>
                        </li>
                    </ul>
                </div>

                {/* Achievements */}
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mt-12 mb-4 flex items-center gap-2">
                    <Medal className="w-5 h-5" />
                    {t('achievementsBadges')}
                </h2>

                <p className="mb-6">
                    {t('achievementsDesc')}
                </p>

                <div className="not-prose grid gap-3 md:grid-cols-2 mb-8">
                    {achievements.map((achievement) => {
                        const Icon = achievement.Icon
                        return (
                            <div key={achievement.key} className="flex items-center gap-3 p-4 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                <div className="p-2 rounded-lg bg-primary/10 dark:bg-secondary/10">
                                    <Icon className="w-5 h-5 text-primary dark:text-secondary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-text dark:text-dark-text text-sm">
                                        {t(`achievements.${achievement.key}`)}
                                    </p>
                                    <p className="text-xs text-text-muted dark:text-dark-text-muted">
                                        {t(`achievements.${achievement.descKey}`)}
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
                    {t('communityTrust')}
                </h2>

                <p>
                    {t('communityTrustDesc')}
                </p>

                <ul className="not-prose my-4 space-y-2">
                    <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-text dark:text-dark-text">{t('trustBenefits.invitations')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-text dark:text-dark-text">{t('trustBenefits.priorityReview')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-text dark:text-dark-text">{t('trustBenefits.featuredProfile')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-text dark:text-dark-text">{t('trustBenefits.earlyAccess')}</span>
                    </li>
                </ul>

                {/* Tips */}
                <div className="not-prose mt-12 p-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        {t('tips.title')}
                    </h3>
                    <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
                        <li className="flex items-start gap-2">
                            <span className="text-amber-600">•</span>
                            <span>{t('tips.answerQuestions')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-600">•</span>
                            <span>{t('tips.completeProfile')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-600">•</span>
                            <span>{t('tips.loginStreaks')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-600">•</span>
                            <span>{t('tips.inviteFriends')}</span>
                        </li>
                    </ul>
                </div>

                {/* View Progress Link */}
                <div className="not-prose mt-8 flex justify-center">
                    <Link
                        href="/analytics"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                    >
                        <TrendingUp className="w-4 h-4" />
                        {t('viewProgress')}
                    </Link>
                </div>
            </div>
        </AboutLayout>
    )
}
