'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Post {
  id: string
  title: string
  content: string
  created_at: string
  author_email: string
  tags: string[]
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
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
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

  const allTags = Array.from(
    new Set(posts.flatMap(post => post.tags || []))
  ).sort()

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Syrealize
            </Link>
            <div className="flex gap-4">
              <Link
                href="/feed"
                className="px-4 py-2 text-blue-600 font-medium"
              >
                Feed
              </Link>
              {user && (
                <Link
                  href="/editor"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Write
                </Link>
              )}
              {!user && (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Tags */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedTag === null
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
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
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {selectedTag ? `Posts tagged with "${selectedTag}"` : 'Latest Posts'}
            </h1>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-600">
                  {selectedTag
                    ? `No posts found with tag "${selectedTag}"`
                    : 'No posts yet. Be the first to create one!'}
                </p>
                {user && (
                  <Link
                    href="/editor"
                    className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags?.map(tag => (
                        <span
                          key={tag}
                          className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.author_email}</span>
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
    </div>
  )
}
