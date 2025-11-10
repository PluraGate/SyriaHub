import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar, TagChip, RelatedPosts, CitationBacklinks, CommentsSection, ReportButton } from '@/components'

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: post, error } = await supabase
    .from('posts')
    .select(
      `
        *,
        author:users!posts_author_id_fkey(id, name, email, bio, affiliation)
      `
    )
    .eq('id', params.id)
    .single()

  if (error || !post) {
    notFound()
  }

  let relatedPosts: any[] = []
  if (post.tags && post.tags.length > 0) {
    const { data } = await supabase
      .from('posts')
      .select(
        `
          id,
          title,
          tags,
          created_at,
          author:users!posts_author_id_fkey(name, email)
        `
      )
      .eq('status', 'published')
      .neq('id', params.id)
      .overlaps('tags', post.tags)
      .limit(5)

    relatedPosts = data || []
  }

  const { data: citationData } = await supabase
    .from('citations')
    .select(
      `
        source_post_id,
        posts!citations_source_post_id_fkey (
          id,
          title,
          created_at,
          author:users!posts_author_id_fkey(name, email)
        )
      `
    )
    .eq('target_post_id', params.id)

  const citationBacklinks =
    citationData?.map((c: any) => c.posts).filter(Boolean) || []

  const authorDisplay =
    post.author?.name || post.author?.email?.split('@')[0] || 'Anonymous'

  const contentParagraphs = (post.content || '').split('\n')

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <Navbar user={user} />

      <div className="border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
        <div className="container-custom max-w-5xl py-4">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Link>
        </div>
      </div>

      <main className="container-custom max-w-5xl py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2">
            <div className="card p-8 md:p-12">
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-primary dark:text-dark-text mb-6 leading-tight">
                  {post.title}
                </h1>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag: string) => (
                      <TagChip key={tag} tag={tag} />
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-text-light dark:text-dark-text-muted">
                    <Link
                      href={`/profile/${post.author_id}`}
                      className="flex items-center gap-2 hover:text-primary dark:hover:text-accent-light transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span className="font-medium">{authorDisplay}</span>
                    </Link>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.created_at}>
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                  </div>
                  <ReportButton contentId={post.id} contentType="post" />
                </div>
              </header>

              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-primary dark:prose-headings:text-dark-text prose-a:text-accent dark:prose-a:text-accent-light">
                {contentParagraphs.map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <CommentsSection postId={post.id} />
          </article>

          <aside className="lg:col-span-1 space-y-6">
            {relatedPosts.length > 0 && (
              <RelatedPosts posts={relatedPosts} />
            )}

            {citationBacklinks.length > 0 && (
              <CitationBacklinks citations={citationBacklinks} />
            )}

            <div className="card p-6">
              <h3 className="font-display font-semibold text-lg text-primary dark:text-dark-text mb-4">
                About the Author
              </h3>
              <Link
                href={`/profile/${post.author_id}`}
                className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg p-3 -mx-3 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary-light/20 flex items-center justify-center text-lg font-display font-bold text-primary dark:text-primary-light">
                  {(post.author?.name?.[0] || post.author?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-text dark:text-dark-text">{authorDisplay}</p>
                  {post.author?.bio && (
                    <p className="text-sm text-text-light dark:text-dark-text-muted line-clamp-2">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
