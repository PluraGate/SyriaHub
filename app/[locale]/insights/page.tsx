'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { QuestionCard } from '@/components/QuestionCard'
import { MagazineCard } from '@/components/MagazineCard'
import { FeaturedPost } from '@/components/FeaturedPost'
import { BentoGrid, BentoGridItem } from '@/components/BentoGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { InsightCardSkeletonCompact } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ImpactStoriesSection } from '@/components/ImpactStoriesSection'
import { Post } from '@/types'
import { ChevronDown, TrendingUp, Sparkles, PenSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDefaultCover } from '@/lib/coverImages'


type SortOption = 'new' | 'hot' | 'top-week' | 'top-month' | 'top-all'
type InsightTab = 'all' | 'following'

import { usePreferences } from '@/contexts/PreferencesContext'

export default function InsightsPage() {
  const { preferences } = usePreferences()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'article' | 'question'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('new')
  const [insightTab, setInsightTab] = useState<InsightTab>('all')
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const supabase = createClient()
  const t = useTranslations('Insights')

  // Get theme-aware hero cover image
  const heroCover = useDefaultCover('large')

  const [officialTags, setOfficialTags] = useState<string[]>([])

  useEffect(() => {
    // Get user and their following list
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Get list of users this user follows
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)

        if (follows) {
          setFollowingIds(follows.map(f => f.following_id))
        }
      }
    }
    initUser()

    // Fetch official tags
    const loadTags = async () => {
      const { data } = await supabase.from('tags').select('label').order('label')
      if (data) {
        setOfficialTags(data.map(t => t.label))
      }
    }
    loadTags()
  }, [supabase])

  // Fetch posts when filters change
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      try {
        // Fetch posts without author join (workaround for schema cache issue)
        let query = supabase
          .from('posts')
          .select('*')
          .eq('status', 'published')
          .neq('content_type', 'event')
          .neq('content_type', 'resource') // Exclude resources
          .neq('approval_status', 'rejected') // Hide rejected posts from feed

        // Content type filter
        if (filter !== 'all') {
          query = query.eq('content_type', filter)
        }

        // Following filter
        if (insightTab === 'following' && followingIds.length > 0) {
          query = query.in('author_id', followingIds)
        }

        // Sort by
        if (sortBy === 'new') {
          query = query.order('created_at', { ascending: false })
        } else if (sortBy === 'hot') {
          query = query.order('vote_count', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false })
        } else if (sortBy.startsWith('top-')) {
          const now = new Date()
          let since: Date

          if (sortBy === 'top-week') {
            since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          } else if (sortBy === 'top-month') {
            since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          } else {
            since = new Date(0)
          }

          query = query
            .gte('created_at', since.toISOString())
            .order('vote_count', { ascending: false, nullsFirst: false })
        }

        const { data: postsData, error } = await query.limit(preferences.display.posts_per_page)

        if (error) {
          if (error.message || error.code) {
            console.error('Error fetching posts:', error.message || error.code)
          }
          setPosts([])
        } else if (postsData && postsData.length > 0) {
          // Fetch authors separately
          const authorIds = [...new Set(postsData.map(p => p.author_id).filter(Boolean))]
          const { data: authors } = await supabase
            .from('users')
            .select('id, name, email, avatar_url')
            .in('id', authorIds)

          // Map authors to posts
          const authorsMap = new Map(authors?.map(a => [a.id, a]) || [])
          const postsWithAuthors = postsData.map(post => ({
            ...post,
            author: authorsMap.get(post.author_id) || null
          }))

          setPosts(postsWithAuthors)
        } else {
          setPosts([])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [supabase, filter, sortBy, insightTab, followingIds, preferences.display.posts_per_page])

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts

  // Split posts for featured section
  const featuredPosts = filteredPosts.slice(0, 4)
  const remainingPosts = filteredPosts.slice(4)

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'new', label: t('sortNew') },
    { value: 'hot', label: t('sortHot') },
    { value: 'top-week', label: t('sortTopWeek') },
    { value: 'top-month', label: t('sortTopMonth') },
    { value: 'top-all', label: t('sortTopAll') },
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
      <Navbar user={user} />

      <main className="flex-1">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-gray-200 dark:border-dark-border">
          {/* Background Cover Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 dark:opacity-20"
            style={{ backgroundImage: `url(${heroCover})` }}
          />
          {/* Solid background overlay */}
          <div className="absolute inset-0 bg-white dark:bg-dark-surface" style={{ opacity: 0.92 }} />

          <div className="container-custom max-w-7xl py-8 md:py-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-light dark:text-dark-text-muted">
                    {t('liveInsights')}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-text dark:text-dark-text tracking-tight">
                  {t('yourInsights')}
                </h1>
                <p className="mt-2 text-lg text-text-light dark:text-dark-text-muted">
                  {t('discoverResearch')}
                </p>
              </div>

              {user && (
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  <PenSquare className="w-5 h-5" />
                  {t('writePost')}
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="container-custom max-w-7xl py-8">
          {/* Insights Tabs + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* All / Following Tabs */}
            {user && (
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-surface rounded-xl">
                <button
                  onClick={() => setInsightTab('all')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${insightTab === 'all'
                    ? 'bg-white dark:bg-dark-bg text-primary dark:text-white/50 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-text dark:hover:text-dark-text'
                    }`}
                >
                  <Sparkles className="w-4 h-4 inline ltr:mr-2 rtl:ml-2" />
                  {t('allPosts')}
                </button>
                <button
                  onClick={() => setInsightTab('following')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${insightTab === 'following'
                    ? 'bg-white dark:bg-dark-bg text-primary dark:text-white/50 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-text dark:hover:text-dark-text'
                    }`}
                >
                  {t('following')}
                  {followingIds.length > 0 && (
                    <span className="ltr:ml-2 rtl:mr-2 px-2 py-0.5 text-xs bg-primary/20 text-primary dark:bg-primary/30 dark:text-emerald-300 rounded-full font-semibold">
                      {followingIds.length}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Sort + Filter */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-between gap-2 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border focus:ring-2 focus:ring-primary focus:outline-none transition-colors min-w-[140px]">
                  <span>{SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}</span>
                  <ChevronDown className="w-4 h-4 text-text-light" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  {SORT_OPTIONS.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={sortBy === opt.value ? 'bg-gray-100 dark:bg-dark-border font-medium' : ''}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Type Filter */}
              <div className="flex bg-gray-100 dark:bg-dark-surface rounded-xl p-1">
                {(['all', 'article', 'question'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === type
                      ? 'bg-white dark:bg-dark-bg text-primary dark:text-white/50 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-text dark:hover:text-dark-text'
                      }`}
                  >
                    {type === 'all' ? t('all') : type === 'article' ? t('article') : t('question')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags Pills */}
          {officialTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTag === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-dark-surface text-text dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border'
                  }`}
              >
                {t('allTopics')}
              </button>
              {officialTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTag === tag
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-surface text-text dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          {/* Content */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <InsightCardSkeletonCompact key={i} />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              variant={insightTab === 'following' && followingIds.length === 0 ? 'no-followers' : 'no-posts'}
              title={
                insightTab === 'following' && followingIds.length === 0
                  ? t('noFollowersTitle')
                  : selectedTag
                    ? t('noPostsTaggedTitle', { tag: selectedTag })
                    : t('noPostsTitle')
              }
              description={
                insightTab === 'following' && followingIds.length === 0
                  ? t('noFollowersDesc')
                  : selectedTag
                    ? t('noPostsTaggedDesc')
                    : t('noPostsDesc')
              }
              actionLabel={user ? t('actionLabel') : undefined}
              actionHref={user ? '/editor' : undefined}
            />
          ) : (
            <>
              {/* Featured Posts - Bento Grid */}
              {featuredPosts.length > 0 && !selectedTag && (
                <section className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <h2 className="text-2xl font-bold text-text dark:text-dark-text">{t('featured')}</h2>
                  </div>

                  <BentoGrid columns={4} gap="md">
                    {featuredPosts[0] && (
                      <BentoGridItem size="2x2">
                        <FeaturedPost post={featuredPosts[0]} size="large" showTrending />
                      </BentoGridItem>
                    )}
                    {featuredPosts[1] && (
                      <BentoGridItem size="1x1">
                        <FeaturedPost post={featuredPosts[1]} size="small" accentColor="secondary" />
                      </BentoGridItem>
                    )}
                    {featuredPosts[2] && (
                      <BentoGridItem size="1x1">
                        <FeaturedPost post={featuredPosts[2]} size="small" accentColor="accent" />
                      </BentoGridItem>
                    )}
                    {featuredPosts[3] && (
                      <BentoGridItem size="2x1">
                        <MagazineCard post={featuredPosts[3]} variant="horizontal" className="h-full" />
                      </BentoGridItem>
                    )}
                  </BentoGrid>
                </section>
              )}

              {/* Impact Stories - Research Outcomes */}
              {!selectedTag && (
                <ImpactStoriesSection limit={3} className="mb-12 -mx-4 sm:-mx-6 lg:-mx-8" />
              )}

              {/* Remaining Posts - Magazine Cards Grid */}
              {remainingPosts.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-6">
                    {t('latestResearch')}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {remainingPosts.map(post => (
                      post.content_type === 'question' ? (
                        <QuestionCard key={post.id} post={post} />
                      ) : (
                        <MagazineCard key={post.id} post={post} variant={preferences.display.compact_mode ? 'compact' : 'standard'} />
                      )
                    ))}
                  </div>
                </section>
              )}

              {/* If only featured posts and no remaining */}
              {remainingPosts.length === 0 && selectedTag && (
                <section>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map(post => (
                      post.content_type === 'question' ? (
                        <QuestionCard key={post.id} post={post} />
                      ) : (
                        <MagazineCard key={post.id} post={post} variant={preferences.display.compact_mode ? 'compact' : 'standard'} />
                      )
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
