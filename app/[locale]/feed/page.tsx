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
import { FeedCardSkeletonCompact } from '@/components/ui/skeleton'
import { Post } from '@/types'
import { ChevronDown, TrendingUp, Sparkles, PenSquare } from 'lucide-react'

type SortOption = 'new' | 'hot' | 'top-week' | 'top-month' | 'top-all'
type FeedTab = 'all' | 'following'

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'article' | 'question'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('new')
  const [feedTab, setFeedTab] = useState<FeedTab>('all')
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const supabase = createClient()

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

        // Content type filter
        if (filter !== 'all') {
          query = query.eq('content_type', filter)
        }

        // Following filter
        if (feedTab === 'following' && followingIds.length > 0) {
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

        const { data: postsData, error } = await query.limit(50)

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
            .select('id, name, email')
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
  }, [supabase, filter, sortBy, feedTab, followingIds])

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts

  // Split posts for featured section
  const featuredPosts = filteredPosts.slice(0, 4)
  const remainingPosts = filteredPosts.slice(4)

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'new', label: 'New' },
    { value: 'hot', label: 'Hot' },
    { value: 'top-week', label: 'Top (Week)' },
    { value: 'top-month', label: 'Top (Month)' },
    { value: 'top-all', label: 'Top (All)' },
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
      <Navbar user={user} />

      <main className="flex-1">
        {/* Hero Header */}
        <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
          <div className="container-custom max-w-7xl py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-light dark:text-dark-text-muted">
                    Live Feed
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-text dark:text-dark-text tracking-tight">
                  Your Feed
                </h1>
                <p className="mt-2 text-lg text-text-light dark:text-dark-text-muted">
                  Discover the latest research from the community
                </p>
              </div>

              {user && (
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  <PenSquare className="w-5 h-5" />
                  Write Post
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="container-custom max-w-7xl py-8">
          {/* Feed Tabs + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* All / Following Tabs */}
            {user && (
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-surface rounded-xl">
                <button
                  onClick={() => setFeedTab('all')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${feedTab === 'all'
                    ? 'bg-white dark:bg-dark-bg text-primary shadow-sm'
                    : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                    }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  All Posts
                </button>
                <button
                  onClick={() => setFeedTab('following')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${feedTab === 'following'
                    ? 'bg-white dark:bg-dark-bg text-primary shadow-sm'
                    : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                    }`}
                >
                  Following
                  {followingIds.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                      {followingIds.length}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Sort + Filter */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-4 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text cursor-pointer focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
              </div>

              {/* Type Filter */}
              <div className="flex bg-gray-100 dark:bg-dark-surface rounded-xl p-1">
                {(['all', 'article', 'question'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === type
                      ? 'bg-white dark:bg-dark-bg text-primary shadow-sm'
                      : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                      }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
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
                All Topics
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
                <FeedCardSkeletonCompact key={i} />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              variant={feedTab === 'following' && followingIds.length === 0 ? 'no-followers' : 'no-posts'}
              title={
                feedTab === 'following' && followingIds.length === 0
                  ? 'No one to follow yet'
                  : selectedTag
                    ? `No posts found for "${selectedTag}"`
                    : 'No posts yet'
              }
              description={
                feedTab === 'following' && followingIds.length === 0
                  ? 'Follow researchers to see their posts in your feed. Explore the community to find interesting people!'
                  : selectedTag
                    ? 'Try a different topic or clear the filter to see more content.'
                    : 'Be the first to share your research with the community!'
              }
              actionLabel={user ? 'Create Post' : undefined}
              actionHref={user ? '/editor' : undefined}
            />
          ) : (
            <>
              {/* Featured Posts - Bento Grid */}
              {featuredPosts.length > 0 && !selectedTag && (
                <section className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <h2 className="text-2xl font-bold text-text dark:text-dark-text">Featured</h2>
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

              {/* Remaining Posts - Magazine Cards Grid */}
              {remainingPosts.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-6">
                    Latest Research
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {remainingPosts.map(post => (
                      post.content_type === 'question' ? (
                        <QuestionCard key={post.id} post={post} />
                      ) : (
                        <MagazineCard key={post.id} post={post} variant="standard" />
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
                        <MagazineCard key={post.id} post={post} variant="standard" />
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
