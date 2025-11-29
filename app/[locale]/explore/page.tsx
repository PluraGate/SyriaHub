'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Navbar } from '@/components/Navbar'
import { PostCard } from '@/components/PostCard'
import { GroupCard } from '@/components/GroupCard'
import { ProfileCard } from '@/components/ProfileCard'
import { SearchBar } from '@/components/SearchBar'
import { PostCardSkeleton } from '@/components/ui/skeleton'
import { Filter, X, ArrowUpDown, Users as UsersIcon } from 'lucide-react'

interface Post {
  id: string
  title: string
  content: string
  created_at: string
  author_id: string
  tags?: string[]
  author?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  comment_count?: number
  citation_count?: number
}

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
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createClient()

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

  const [groups, setGroups] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true)
      try {
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            author:users!posts_author_id_fkey(id, name, email)
          `)
          .order('created_at', { ascending: false })

        if (postsError) throw postsError

        // Fetch stats
        const { data: statsData, error: statsError } = await supabase
          .from('post_stats')
          .select('id, comment_count, citation_count')

        if (statsError) throw statsError

        // Merge posts
        let mergedPosts = postsData.map(post => {
          const stat = statsData.find(s => s.id === post.id)
          return {
            ...post,
            comment_count: stat?.comment_count || 0,
            citation_count: stat?.citation_count || 0
          }
        })

        // Filter by tag if needed (client side for now)
        if (selectedTag) {
          mergedPosts = mergedPosts.filter(post => post.tags && post.tags.includes(selectedTag))
        }

        // Sort posts
        if (sortBy === 'trending') {
          mergedPosts.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0))
        } else if (sortBy === 'cited') {
          mergedPosts.sort((a, b) => (b.citation_count || 0) - (a.citation_count || 0))
        } else {
          // Default recent
          mergedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }

        setPosts(mergedPosts)

        // Fetch Groups (Public only)
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('id, name, description, visibility')
          .eq('visibility', 'public')
          .limit(6)

        if (groupsError) throw groupsError

        // Fetch group member counts
        if (groupsData && groupsData.length > 0) {
          const groupIds = groupsData.map(g => g.id)
          const { data: counts } = await supabase
            .from('group_members')
            .select('group_id')
            .in('group_id', groupIds)

          const countMap = new Map()
          counts?.forEach(c => {
            countMap.set(c.group_id, (countMap.get(c.group_id) || 0) + 1)
          })

          const groupsWithCounts = groupsData.map(g => ({
            ...g,
            member_count: countMap.get(g.id) || 0
          }))
          setGroups(groupsWithCounts)
        } else {
          setGroups([])
        }

        // Fetch Profiles (Researchers)
        const { data: profilesData, error: profilesError } = await supabase
          .from('users')
          .select('id, name, role, bio, affiliation')
          .eq('role', 'researcher')
          .limit(4)

        if (profilesError) throw profilesError
        setProfiles(profilesData || [])

      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [selectedTag, sortBy, supabase])

  const disciplines = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Biology',
    'Chemistry',
    'Medicine',
    'Engineering',
    'Psychology',
    'Sociology',
    'Economics',
    'Philosophy',
    'History',
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <Navbar user={user} />

      <main className="container-custom max-w-7xl py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary dark:text-dark-text mb-4">
              Explore Research
            </h1>
            <p className="text-lg text-text-light dark:text-dark-text-muted">
              Discover research by topic, tag, or discipline
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-light dark:text-dark-text-muted">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg py-2 pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-light"
              >
                <option value="recent">Most Recent</option>
                <option value="trending">Trending</option>
                <option value="cited">Most Cited</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <SearchBar />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg"
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filters</span>
              </button>

              {/* Filters */}
              <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-lg text-primary dark:text-dark-text">
                      Filters
                    </h3>
                    {selectedTag && (
                      <button
                        onClick={() => setSelectedTag(null)}
                        className="text-sm text-accent dark:text-accent-light hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Disciplines */}
                  <div className="mb-6">
                    <h4 className="font-medium text-sm text-text dark:text-dark-text mb-3">
                      Disciplines
                    </h4>
                    <div className="space-y-2">
                      {disciplines.map((discipline) => (
                        <button
                          key={discipline}
                          onClick={() => setSelectedTag(discipline)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedTag === discipline
                            ? 'bg-primary dark:bg-accent-light text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-dark-border text-text dark:text-dark-text'
                            }`}
                        >
                          {discipline}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Tags */}
                  <div>
                    <h4 className="font-medium text-sm text-text dark:text-dark-text mb-3">
                      Popular Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {allTags.slice(0, 20).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedTag === tag
                            ? 'bg-primary dark:bg-accent-light text-white'
                            : 'bg-gray-100 dark:bg-dark-border text-text dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Posts Grid */}
          <div className="flex-1">
            {/* Active Filter Display */}
            {selectedTag && (
              <div className="mb-6 flex items-center gap-3">
                <span className="text-text-light dark:text-dark-text-muted">Filtering by:</span>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-accent-light text-white rounded-full">
                  <span className="font-medium">{selectedTag}</span>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                    aria-label="Remove filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Groups Section */}
            {!selectedTag && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-primary dark:text-dark-text">
                    Featured Groups
                  </h2>
                  <a href="/groups" className="text-sm font-medium text-primary hover:underline">
                    View all groups
                  </a>
                </div>

                {loading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-48 rounded-xl bg-gray-100 dark:bg-dark-surface animate-pulse" />
                    ))}
                  </div>
                ) : groups.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                      <GroupCard key={group.id} group={group} />
                    ))}
                  </div>
                ) : (
                  <div className="card p-8 text-center bg-gray-50 dark:bg-dark-surface/50 border-dashed">
                    <p className="text-text-light dark:text-dark-text-muted">
                      No public groups found yet.
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Profiles Section */}
            {!selectedTag && profiles.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-primary dark:text-dark-text">
                    Featured Researchers
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {profiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              </section>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-primary dark:text-dark-text">
                Latest Research
              </h2>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-lg text-text-light dark:text-dark-text-muted mb-4">
                  No posts found{selectedTag ? ` for "${selectedTag}"` : ''}.
                </p>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="btn btn-outline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function ExploreFallback() {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <Navbar />
      <main className="container-custom max-w-7xl py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}
