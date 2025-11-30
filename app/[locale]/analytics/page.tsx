import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { BarChart3, Eye, ThumbsUp, MessageSquare, Download, Calendar } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch User's Posts Stats
    const { data: posts } = await supabase
        .from('posts')
        .select(`
      id,
      title,
      content_type,
      view_count,
      vote_count,
      created_at,
      metadata
    `)
        .eq('author_id', user.id)
        .order('view_count', { ascending: false })

    // Calculate Aggregates
    const totalViews = posts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0
    const totalVotes = posts?.reduce((sum, p) => sum + (p.vote_count || 0), 0) || 0
    const totalPosts = posts?.length || 0
    const totalDownloads = posts?.reduce((sum, p) => {
        if (p.content_type === 'resource' && p.metadata?.downloads) {
            return sum + (p.metadata.downloads as number)
        }
        return sum
    }, 0) || 0

    const topPosts = posts?.slice(0, 5) || []

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 container-custom py-12">
                <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-8 flex items-center gap-3">
                    <BarChart3 className="w-8 h-8" />
                    Analytics Dashboard
                </h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted">Total Views</h3>
                            <Eye className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-text dark:text-dark-text">{totalViews}</p>
                    </div>

                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted">Total Engagement</h3>
                            <ThumbsUp className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-text dark:text-dark-text">{totalVotes}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-muted mt-1">Votes & Likes</p>
                    </div>

                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted">Content Created</h3>
                            <MessageSquare className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold text-text dark:text-dark-text">{totalPosts}</p>
                    </div>

                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted">Downloads</h3>
                            <Download className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="text-3xl font-bold text-text dark:text-dark-text">{totalDownloads}</p>
                    </div>
                </div>

                {/* Top Content */}
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-dark-border">
                        <h2 className="text-xl font-bold text-text dark:text-dark-text">Top Performing Content</h2>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-dark-border">
                        {topPosts.length > 0 ? (
                            topPosts.map((post) => (
                                <div key={post.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors">
                                    <div className="flex-1 min-w-0 mr-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider
                        ${post.content_type === 'article' ? 'bg-blue-100 text-blue-700' :
                                                    post.content_type === 'question' ? 'bg-orange-100 text-orange-700' :
                                                        post.content_type === 'resource' ? 'bg-green-100 text-green-700' :
                                                            'bg-purple-100 text-purple-700'
                                                }
                      `}>
                                                {post.content_type}
                                            </span>
                                            <span className="text-xs text-text-light dark:text-dark-text-muted">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <Link href={`/${post.content_type === 'question' ? 'questions' : post.content_type === 'resource' ? 'resources' : post.content_type === 'event' ? 'events' : 'posts'}/${post.id}`}>
                                            <h3 className="text-lg font-semibold text-text dark:text-dark-text truncate hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-text-light dark:text-dark-text-muted">
                                        <div className="flex items-center gap-1.5" title="Views">
                                            <Eye className="w-4 h-4" />
                                            <span>{post.view_count || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5" title="Votes">
                                            <ThumbsUp className="w-4 h-4" />
                                            <span>{post.vote_count || 0}</span>
                                        </div>
                                        {post.content_type === 'resource' && (
                                            <div className="flex items-center gap-1.5" title="Downloads">
                                                <Download className="w-4 h-4" />
                                                <span>{post.metadata?.downloads || 0}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-text-light dark:text-dark-text-muted">
                                You haven&apos;t created any content yet.
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
