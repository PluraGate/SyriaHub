'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

interface PostAuthor {
  id?: string
  name?: string | null
  email?: string | null
}

interface Post {
  id: string
  title: string
  content: string
  created_at: string
  tags: string[]
  author?: PostAuthor | null
}

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Fetch posts
    const loadPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            author:users!posts_author_id_fkey(id, name, email)
          `)
          .order('created_at', { ascending: false })

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
  }, [supabase])

  const allTags = Array.from(
    new Set(posts.flatMap(post => post.tags || []))
  ).sort()

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 container-custom max-w-7xl py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Tags */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-primary dark:text-dark-text mb-4">Tags</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedTag === null
                      ? 'bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-primary-light'
                      : 'text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border'
                  }`}
                >
                  All Posts
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedTag === tag
                        ? 'bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-primary-light'
                        : 'text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content - Posts */}
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-6">
              {selectedTag ? `Posts tagged with "${selectedTag}"` : 'Latest Posts'}
            </h1>

            {loading ? (
              <div className="card p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-accent-light"></div>
                <p className="mt-4 text-text-light dark:text-dark-text-muted">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-text-light dark:text-dark-text-muted">
                  {selectedTag
                    ? `No posts found with tag "${selectedTag}"`
                    : 'No posts yet. Be the first to create one!'}
                </p>
                {user && (
                  <Link
                    href="/editor"
                    className="inline-block mt-4 btn btn-primary"
                  >
                    Create Post
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map(post => (
                  <article
                    key={post.id}
                    className="card p-6 hover:shadow-soft-lg transition-shadow"
                  >
                    <h2 className="text-xl font-display font-semibold text-primary dark:text-dark-text mb-2">
                      {post.title}
                    </h2>
                    <p
                      className="text-text-light dark:text-dark-text-muted mb-4 overflow-hidden"
                      style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
                    >
                      {post.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags?.map(tag => (
                        <span
                          key={tag}
                          className="inline-block px-3 py-1 bg-primary/5 text-primary dark:bg-primary-light/20 dark:text-primary-light text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-text-light dark:text-dark-text-muted">
                      <span>{post.author?.name || post.author?.email?.split('@')[0] || 'Anonymous'}</span>
                      <time dateTime={post.created_at}>
                        {new Date(post.created_at).toLocaleDateString()}
                      </time>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
