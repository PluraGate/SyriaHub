'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Navbar } from '@/components/Navbar'
import { PostCard } from '@/components/PostCard'
import { SearchBar } from '@/components/SearchBar'
import { PostCardSkeleton } from '@/components/ui/skeleton'
import { Filter, X } from 'lucide-react'

interface Post {
  id: string
  title: string
  content: string
  created_at: string
  author_email?: string
  author_id: string
  tags?: string[]
}

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const initialTag = searchParams.get('tag')
  
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag)
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
        .eq('published', true)

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
    const loadPosts = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })

        if (selectedTag) {
          query = query.contains('tags', [selectedTag])
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching posts:', error)
        } else {
          setPosts(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [selectedTag, supabase])

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
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-primary dark:text-dark-text mb-4">
            Explore Research
          </h1>
          <p className="text-lg text-text-light dark:text-dark-text-muted">
            Discover research by topic, tag, or discipline
          </p>
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
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedTag === discipline
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
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedTag === tag
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
