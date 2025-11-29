import Link from 'next/link'
import { ArrowRight, Sparkles, Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { PostCard } from '@/components/PostCard'
import { SearchBar } from '@/components/SearchBar'
import { TagsCloud } from '@/components/TagsCloud'


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

  // Fetch recent posts for feed preview (for logged-in users)
  let recentPosts: any[] = []
  if (user) {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(id, name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(6)

    recentPosts = data || []
  }

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar user={user} />

      <main className="flex-1">
        {user ? (
          <>
            {/* Feed Section for Logged-in Users */}
            <section className="section pt-20 md:pt-24">
              <div className="container-custom max-w-6xl">
                {/* Search Bar */}
                <div className="mb-12 flex justify-center">
                  <SearchBar />
                </div>

                {/* Tags Cloud */}
                <div className="mb-16">
                  <h2 className="text-2xl font-display font-semibold text-center mb-8 text-primary dark:text-dark-text">
                    {t('popularTopics')}
                  </h2>
                  <TagsCloud />
                </div>

                {/* Recent Posts */}
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-display font-semibold text-primary dark:text-dark-text">
                      {t('recentResearch')}
                    </h2>
                    <Link
                      href="/feed"
                      className="text-primary dark:text-accent-light hover:text-accent dark:hover:text-accent font-medium flex items-center gap-2"
                    >
                      {t('viewAll')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recentPosts.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>

                  {recentPosts.length === 0 && (
                    <div className="text-center py-16 text-text-light dark:text-dark-text-muted">
                      <p className="text-lg mb-4">{t('noPosts')}</p>
                      <Link href="/editor" className="btn btn-primary">
                        {t('createPost')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Hero Section for Non-logged-in Users */}
            <section className="section pt-20 md:pt-28 lg:pt-36">
              <div className="container-narrow text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 dark:bg-primary-light/10 border border-primary/10 dark:border-primary-light/20 rounded-full mb-8">
                  <Sparkles className="w-4 h-4 text-accent dark:text-accent-light" />
                  <span className="text-sm font-medium text-primary dark:text-primary-light">
                    {t('badge')}
                  </span>
                </div>

                <h1 className="text-balance mb-6">
                  {t('heroTitle')}
                </h1>

                <p className="text-lg md:text-xl text-text-light dark:text-dark-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                  {t('heroSubtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/auth/signup" className="btn btn-primary px-8 py-4 text-lg group">
                    {t('getStarted')}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/explore" className="btn btn-outline px-8 py-4 text-lg">
                    {t('browsePosts')}
                  </Link>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="section bg-background-light dark:bg-dark-surface/50">
              <div className="container-custom">
                <div className="text-center mb-16">
                  <h2 className="mb-4">{t('featuresTitle')}</h2>
                  <p className="text-lg text-text-light dark:text-dark-text-muted max-w-2xl mx-auto">
                    {t('featuresSubtitle')}
                  </p>
                </div>

                <div className="grid-auto max-w-5xl mx-auto">
                  {/* Feature 1 */}
                  <div className="card p-8 text-center group hover:shadow-soft-lg transition-all">
                    <div className="w-14 h-14 bg-primary/10 dark:bg-primary-light/20 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-7 h-7 text-primary dark:text-primary-light" />
                    </div>
                    <h3 className="text-xl font-display font-semibold mb-3">
                      {t('feature1Title')}
                    </h3>
                    <p className="text-text-light dark:text-dark-text-muted leading-relaxed">
                      {t('feature1Desc')}
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="card p-8 text-center group hover:shadow-soft-lg transition-all">
                    <div className="w-14 h-14 bg-accent/10 dark:bg-accent-light/20 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                      <Search className="w-7 h-7 text-accent dark:text-accent-light" />
                    </div>
                    <h3 className="text-xl font-display font-semibold mb-3">
                      {t('feature2Title')}
                    </h3>
                    <p className="text-text-light dark:text-dark-text-muted leading-relaxed">
                      {t('feature2Desc')}
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="card p-8 text-center group hover:shadow-soft-lg transition-all">
                    <div className="w-14 h-14 bg-primary/10 dark:bg-primary-light/20 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7 text-primary dark:text-primary-light" />
                    </div>
                    <h3 className="text-xl font-display font-semibold mb-3">
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
            <section className="section">
              <div className="container-narrow">
                <div className="card p-10 md:p-16 text-center bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary-light/10 dark:to-accent-light/10 border-primary/10 dark:border-primary-light/20">
                  <h2 className="mb-4">{t('ctaTitle')}</h2>
                  <p className="text-lg text-text-light dark:text-dark-text-muted max-w-xl mx-auto mb-8">
                    {t('ctaDesc')}
                  </p>
                  <Link href="/auth/signup" className="btn btn-primary px-8 py-4 text-lg inline-flex items-center gap-2">
                    {t('createAccount')}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
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
