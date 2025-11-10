import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, FileText, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar, PostCard } from '@/components'

interface ProfilePageProps {
  params: {
    id: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, name, email, bio, affiliation, created_at')
    .eq('id', params.id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Fetch user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', params.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const isOwnProfile = user?.id === params.id

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <Navbar user={user} />

      {/* Back Navigation */}
      <div className="border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
        <div className="container-custom max-w-6xl py-4">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
        <div className="container-custom max-w-6xl py-12">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent dark:from-primary-light dark:to-accent-light flex items-center justify-center text-4xl font-display font-bold text-white flex-shrink-0">
              {(profile.name?.[0] || profile.email?.[0] || 'U').toUpperCase()}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-primary dark:text-dark-text mb-2">
                    {profile.name || 'Anonymous User'}
                  </h1>
                  {profile.affiliation && (
                    <p className="text-lg text-text-light dark:text-dark-text-muted">
                      {profile.affiliation}
                    </p>
                  )}
                </div>
              </div>

              {profile.bio && (
                <p className="text-text dark:text-dark-text mb-6 max-w-3xl leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-text-light dark:text-dark-text-muted">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts */}
      <main className="container-custom max-w-6xl py-12">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-6 h-6 text-primary dark:text-accent-light" />
          <h2 className="text-2xl font-display font-bold text-primary dark:text-dark-text">
            Published Research
          </h2>
          <span className="px-3 py-1 bg-primary/10 dark:bg-primary-light/20 text-primary dark:text-primary-light rounded-full text-sm font-medium">
            {posts?.length || 0}
          </span>
        </div>
        
        {posts && posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} showAuthor={false} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg text-text-light dark:text-dark-text-muted mb-4">
              {isOwnProfile ? "You haven't published any posts yet." : 'No published posts yet.'}
            </p>
            {isOwnProfile && (
              <Link href="/editor" className="btn btn-primary">
                Create Your First Post
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
