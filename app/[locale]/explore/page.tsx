'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { MagazineCard } from '@/components/MagazineCard'
import { FeaturedPost } from '@/components/FeaturedPost'
import { BentoGrid, BentoGridItem } from '@/components/BentoGrid'
import { GroupCard } from '@/components/GroupCard'
import { ProfileCard } from '@/components/ProfileCard'
import { SearchBar } from '@/components/SearchBar'
import { Compass, TrendingUp, Users, BookOpen, Sparkles, ChevronDown, X, Calendar } from 'lucide-react'

import { Post } from '@/types'

type SortOption = 'recent' | 'trending' | 'cited'

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreFallback />}>
      <ExplorePageContent />
    </Suspense>
  )
}

function ExplorePageContent() {
  const searchParams = useSearchParams()
  const initialTag = searchParams.get('tag')

  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [allTags, setAllTags] = useState<string[]>([])
  const supabase = createClient()

  const [trendingPosts, setTrendingPosts] = useState<Post[]>([])
  const [recommendedGroups, setRecommendedGroups] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [comingEvents, setComingEvents] = useState<Post[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [supabase])

  useEffect(() => {
    const loadTags = async () => {
      const { data } = await supabase
        .from('posts')
        .select('tags')

      if (data) {
        const tagsSet = new Set<string>()
        data.forEach((post) => {
          if (post.tags) {
            post.tags.forEach((tag: string) => tagsSet.add(tag))
          }
        })
        setAllTags(Array.from(tagsSet).sort())
      }
    }

    loadTags()
  }, [supabase])

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true)
      try {
        // Fetch Trending Posts
        const { data: trendingData } = await supabase
          .from('posts')
          .select(`
            *,
            author:users!posts_author_id_fkey(id, name, email)
          `)
          .eq('status', 'published')
          .neq('approval_status', 'rejected') // Hide rejected posts
          .order('created_at', { ascending: false })
          .limit(6)

        setTrendingPosts(trendingData as Post[] || [])

        // Fetch Recommended Groups
        const { data: groupsData } = await supabase
          .from('groups')
          .select('*')
          .eq('visibility', 'public')
          .limit(6)

        if (groupsData && groupsData.length > 0) {
          const groupIds = groupsData.map((g: any) => g.id)
          const { data: counts } = await supabase
            .from('group_members')
            .select('group_id')
            .in('group_id', groupIds)

          const countMap = new Map()
          counts?.forEach(c => {
            countMap.set(c.group_id, (countMap.get(c.group_id) || 0) + 1)
          })

          const groupsWithCounts = groupsData.map((g: any) => ({
            ...g,
            member_count: countMap.get(g.id) || 0
          }))
          setRecommendedGroups(groupsWithCounts)
        }

        // Fetch Main Feed Posts (Exclude events)
        let query = supabase
          .from('posts')
          .select(`
            *,
            author:users!posts_author_id_fkey(id, name, email)
          `)
          .neq('content_type', 'event') // Exclude events
          .neq('approval_status', 'rejected') // Hide rejected posts
          .order('created_at', { ascending: false })

        if (selectedTag) {
          query = query.contains('tags', [selectedTag])
        }

        const { data: postsData } = await query
        setPosts(postsData as Post[] || [])

        // Fetch Events separately (showing 3 upcoming)
        const { data: eventsData } = await supabase
          .from('posts')
          .select(`
            *,
            author:users!posts_author_id_fkey(id, name, email)
          `)
          .eq('content_type', 'event')
          .neq('approval_status', 'rejected')
          .order('metadata->>start_time', { ascending: true }) // Sort by event start time
          .gt('metadata->>start_time', new Date().toISOString()) // Only future events
          .limit(3)

        setComingEvents(eventsData as Post[] || [])

        // Fetch Profiles
        const { data: profilesData } = await supabase
          .from('users')
          .select('id, name, role, bio, affiliation, avatar_url, cover_image_url')
          .eq('role', 'researcher')
          .limit(4)

        setProfiles(profilesData || [])

      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [selectedTag, supabase])

  const disciplines = [
    'Computer Science', 'Mathematics', 'Physics', 'Biology',
    'Chemistry', 'Medicine', 'Engineering', 'Psychology',
    'Sociology', 'Economics', 'Philosophy', 'History',
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
      <Navbar user={user} />

      <main className="flex-1">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary-dark to-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="container-custom max-w-7xl relative z-10 py-16 md:py-24">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-5 h-5 text-white/80" />
                <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Discover
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
                Explore Research
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Discover groundbreaking research by topic, discipline, or researcher
              </p>

              {/* Search */}
              <div className="max-w-xl">
                <SearchBar />
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom max-w-7xl py-12">
          {/* Discipline Pills */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${selectedTag === null
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-text dark:text-dark-text hover:border-primary dark:hover:border-primary-light'
                  }`}
              >
                All Topics
              </button>
              {disciplines.map((discipline) => (
                <button
                  key={discipline}
                  onClick={() => setSelectedTag(discipline)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${selectedTag === discipline
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-text dark:text-dark-text hover:border-primary dark:hover:border-primary-light'
                    }`}
                >
                  {discipline}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter */}
          {selectedTag && (
            <div className="mb-8 flex items-center gap-3">
              <span className="text-text-light dark:text-dark-text-muted">Filtering by:</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full">
                <span className="font-semibold">{selectedTag}</span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-text-light dark:text-dark-text-muted">Loading content...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Trending Posts - Bento Grid */}
              {!selectedTag && trendingPosts.length > 0 && (
                <section className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-text dark:text-dark-text">Trending Now</h2>
                      <p className="text-sm text-text-light dark:text-dark-text-muted">Hot research this week</p>
                    </div>
                  </div>

                  <BentoGrid columns={4} gap="lg">
                    {trendingPosts[0] && (
                      <BentoGridItem size="2x2">
                        <FeaturedPost post={trendingPosts[0]} size="large" showTrending />
                      </BentoGridItem>
                    )}
                    {trendingPosts[1] && (
                      <BentoGridItem size="1x2">
                        <FeaturedPost post={trendingPosts[1]} size="medium" accentColor="secondary" />
                      </BentoGridItem>
                    )}
                    {trendingPosts[2] && (
                      <BentoGridItem size="1x1">
                        <MagazineCard post={trendingPosts[2]} variant="compact" className="h-full" />
                      </BentoGridItem>
                    )}
                    {trendingPosts[3] && (
                      <BentoGridItem size="1x1">
                        <MagazineCard post={trendingPosts[3]} variant="compact" className="h-full" />
                      </BentoGridItem>
                    )}
                  </BentoGrid>
                </section>
              )}

              {/* Featured Researchers */}
              {!selectedTag && profiles.length > 0 && (
                <section className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary-dark" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-text dark:text-dark-text">Featured Researchers</h2>
                      <p className="text-sm text-text-light dark:text-dark-text-muted">Connect with leading minds</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {profiles.map((profile) => (
                      <ProfileCard key={profile.id} profile={profile} />
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming Events */}
              {!selectedTag && comingEvents.length > 0 && (
                <section className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-text dark:text-dark-text">Upcoming Events</h2>
                        <p className="text-sm text-text-light dark:text-dark-text-muted">Don't miss out</p>
                      </div>
                    </div>
                    <Link
                      href="/events"
                      className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                    >
                      View all →
                    </Link>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {comingEvents.map((event) => (
                      <MagazineCard key={event.id} post={event} variant="standard" />
                    ))}
                  </div>
                </section>
              )}

              {/* Research Groups */}
              {!selectedTag && recommendedGroups.length > 0 && (
                <section className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-text dark:text-dark-text">Research Groups</h2>
                        <p className="text-sm text-text-light dark:text-dark-text-muted">Join collaborative communities</p>
                      </div>
                    </div>
                    <Link
                      href="/groups"
                      className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                    >
                      View all →
                    </Link>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recommendedGroups.slice(0, 3).map((group) => (
                      <GroupCard key={group.id} group={group} />
                    ))}
                  </div>
                </section>
              )}

              {/* All Research */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-dark-surface rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-text dark:text-dark-text">
                        {selectedTag ? `${selectedTag} Research` : 'Latest Research'}
                      </h2>
                      <p className="text-sm text-text-light dark:text-dark-text-muted">
                        {posts.length} publications
                      </p>
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="appearance-none pl-4 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text cursor-pointer"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="trending">Trending</option>
                      <option value="cited">Most Cited</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
                  </div>
                </div>

                {posts.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                      <MagazineCard key={post.id} post={post} variant="standard" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 dark:bg-dark-surface rounded-2xl">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-text-light dark:text-dark-text-muted" />
                    <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">No research found</h3>
                    <p className="text-text-light dark:text-dark-text-muted">
                      {selectedTag ? `No posts found for "${selectedTag}"` : 'No posts available yet.'}
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ExploreFallback() {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <Navbar />
      <div className="container-custom max-w-7xl py-12">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-dark-surface rounded-2xl mb-12" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-dark-surface rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
