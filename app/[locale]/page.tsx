import Link from 'next/link'
import { ArrowRight, Sparkles, Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HomeContentFilter } from '@/components/HomeContentFilter'

import { SocialProofBanner } from '@/components/SocialProofBanner'
import { OnboardingModal } from '@/components/OnboardingModal'
import { EpistemicOnboarding } from '@/components/EpistemicOnboarding'
import { FirstContributionPrompt } from '@/components/FirstContributionPrompt'

// New Editorial Components
import { HeroEditorial } from '@/components/HeroEditorial'
import { BentoGrid, BentoGridItem } from '@/components/BentoGrid'
import { MagazineCard } from '@/components/MagazineCard'
import { FeaturedPost } from '@/components/FeaturedPost'

import { getTranslations, setRequestLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic';

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations({ locale, namespace: 'Landing' });

  // Fetch recent posts for feed preview
  let recentPosts: any[] = []
  let featuredPosts: any[] = []

  const { data: allPosts } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey(id, name, email)
    `)
    .eq('status', 'published') // Only show published posts
    .neq('approval_status', 'rejected') // Hide rejected posts
    .neq('content_type', 'resource') // Exclude resources from main feed
    .order('created_at', { ascending: false })
    .limit(8)

  // Fetch latest resources separately for the new section
  const { data: latestResources } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey(id, name, email)
    `)
    .eq('content_type', 'resource')
    .eq('status', 'published')
    .neq('approval_status', 'rejected')
    .order('created_at', { ascending: false })
    .limit(4)

  if (allPosts) {
    featuredPosts = allPosts.slice(0, 4)
    recentPosts = allPosts.slice(4)
  }

  // Fetch platform stats for landing page (only for non-authenticated users)
  let platformStats = { contributors: 0, publications: 0, contexts: 0 }
  if (!user) {
    // Count users who have published at least one post (contributors)
    const { count: contributorsCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Count published posts
    const { count: publicationsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .neq('approval_status', 'rejected')

    // Count verified tags (topics)
    const { count: topicsCount } = await supabase
      .from('tags')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true)

    platformStats = {
      contributors: contributorsCount || 0,
      publications: publicationsCount || 0,
      contexts: topicsCount || 0
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar user={user} />

      <main className="flex-1">
        {/* Epistemic Onboarding - shows on every homepage refresh for testing */}
        <EpistemicOnboarding />

        {user ? (
          <>
            {/* Onboarding Modal for New Users */}
            <OnboardingModal
              userId={user.id}
              userEmail={user.email || ''}
              userName={user.user_metadata?.name}
            />

            {/* First Contribution Path - shows after onboarding */}
            <FirstContributionPrompt />

            {/* Insights Section for Logged-in Users */}
            <section className="section pt-20 md:pt-24">
              <div className="container-custom max-w-7xl">
                {/* Social Proof Banner */}
                <div className="mb-8">
                  <SocialProofBanner />
                </div>

                {/* Home Content with Filter */}
                <HomeContentFilter
                  featuredPosts={featuredPosts}
                  recentPosts={recentPosts}
                  userId={user.id}
                  latestResources={latestResources || []} // Pass latest resources to filter component
                />
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Hero Section - New Editorial Design */}
            <HeroEditorial
              title={t('heroTitle')}
              subtitle={t('heroSubtitle')}
              badge={t('badge')}
              featuredPosts={featuredPosts}
              stats={{
                contributors: platformStats.contributors,
                publications: platformStats.publications,
                contexts: platformStats.contexts
              }}
              ctaLabels={{
                getStarted: t('getStarted'),
                browse: t('browsePosts')
              }}
            />

            {/* Latest Resources Section - New! */}
            {latestResources && latestResources.length > 0 && (
              <section className="section bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                <div className="container-custom max-w-7xl">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-text dark:text-dark-text">
                        {t('latestResources')}
                      </h2>
                      <p className="text-text-light dark:text-dark-text-muted mt-1">
                        {t('resources.subtitle') || "Latest tools, datasets, and reports"}
                      </p>
                    </div>
                    <Link
                      href="/resources"
                      className="text-primary dark:text-primary-light font-medium flex items-center gap-2 hover:underline"
                    >
                      {t('viewAll')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {latestResources.map((resource: any) => (
                      <MagazineCard
                        key={resource.id}
                        post={resource}
                        variant="compact"
                        className="h-full bg-gray-50 dark:bg-dark-surface/50 border-transparent hover:border-primary/20"
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Featured Content - Bento Grid */}
            {featuredPosts.length > 0 && (
              <section className="section bg-gray-50 dark:bg-dark-surface/30">
                <div className="container-custom max-w-7xl">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-text dark:text-dark-text mb-4">
                      Latest Research
                    </h2>
                    <p className="text-lg text-text-light dark:text-dark-text-muted max-w-2xl mx-auto">
                      Discover the latest publications from our community of researchers
                    </p>
                  </div>

                  <BentoGrid columns={4} gap="lg">
                    {featuredPosts[0] && (
                      <BentoGridItem size="2x2">
                        <FeaturedPost post={featuredPosts[0]} size="large" showTrending />
                      </BentoGridItem>
                    )}
                    {featuredPosts[1] && (
                      <BentoGridItem size="1x2">
                        <FeaturedPost post={featuredPosts[1]} size="medium" accentColor="accent" />
                      </BentoGridItem>
                    )}
                    {featuredPosts[2] && (
                      <BentoGridItem size="1x1">
                        <MagazineCard post={featuredPosts[2]} variant="compact" className="h-full" />
                      </BentoGridItem>
                    )}
                    {featuredPosts[3] && (
                      <BentoGridItem size="1x1">
                        <MagazineCard post={featuredPosts[3]} variant="compact" className="h-full" />
                      </BentoGridItem>
                    )}
                  </BentoGrid>

                  <div className="text-center mt-12">
                    <Link
                      href="/explore"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-2xl transition-all duration-200 shadow-sm hover:shadow-lg"
                    >
                      Explore All Research
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Features Section */}
            <section className="section bg-white dark:bg-dark-bg">
              <div className="container-custom max-w-6xl">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-text dark:text-dark-text mb-4">
                    {t('featuresTitle')}
                  </h2>
                  <p className="text-lg text-text-light dark:text-dark-text-muted max-w-2xl mx-auto">
                    {t('featuresSubtitle')}
                  </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                  {/* Feature 1 */}
                  <div className="group p-8 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-transparent hover:border-primary/20 transition-all duration-300">
                    <div className="w-14 h-14 bg-primary/10 dark:bg-primary-light/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-7 h-7 text-primary dark:text-primary-light" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-text dark:text-dark-text">
                      {t('feature1Title')}
                    </h3>
                    <p className="text-text-light dark:text-dark-text-muted leading-relaxed">
                      {t('feature1Desc')}
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="group p-8 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-transparent hover:border-accent/20 transition-all duration-300">
                    <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Search className="w-7 h-7 text-accent-dark" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-text dark:text-dark-text">
                      {t('feature2Title')}
                    </h3>
                    <p className="text-text-light dark:text-dark-text-muted leading-relaxed">
                      {t('feature2Desc')}
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="group p-8 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-transparent hover:border-secondary/20 transition-all duration-300">
                    <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7 text-secondary-dark" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-text dark:text-dark-text">
                      {t('feature3Title')}
                    </h3>
                    <p className="text-text-light dark:text-dark-text-muted leading-relaxed">
                      {t('feature3Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gray-50 dark:bg-dark-surface/50">
              <div className="container-custom max-w-4xl">
                <div className="relative p-12 md:p-16 rounded-3xl overflow-hidden">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary-dark" />
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

                  <div className="relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {t('ctaTitle')}
                    </h2>
                    <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
                      {t('ctaDesc')}
                    </p>
                    <Link
                      href="/auth/signup"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-primary font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {t('createAccount')}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
