import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User as UserIcon, PenSquare, GitPullRequest, Clock, Eye, Share2, Bookmark, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { TagChip } from '@/components/TagChip'
import { RelatedPosts } from '@/components/RelatedPosts'
import { CitationBacklinks } from '@/components/CitationBacklinks'
import { CommentsSection } from '@/components/CommentsSection'
import { AnswerList } from '@/components/AnswerList'
import { AnswerForm } from '@/components/AnswerForm'
import { ForkButton } from '@/components/ForkButton'
import { SuggestionDialog } from '@/components/SuggestionDialog'
import { KnowledgeGraph } from '@/components/KnowledgeGraph'
import { CitationContextBar } from '@/components/CitationContextBar'
import { PostMoreOptions } from '@/components/PostMoreOptions'
import { TextSelectionHandler } from '@/components/TextSelectionHandler'
import { BookmarkButton } from '@/components/BookmarkButton'
import { EditButton } from '@/components/EditButton'
import { LinkedResourcesSection } from '@/components/LinkedResourcesSection'
import { GitFork } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

interface PostPageProps {
  params: Promise<{
    id: string
  }>
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      tags,
      content_type,
      author:users!posts_author_id_fkey(name, email)
    `)
    .eq('id', id)
    .single()

  if (!post) {
    return {
      title: 'Post Not Found | Syrealize',
      description: 'The requested post could not be found.',
    }
  }

  const authorName = (post.author as any)?.name || (post.author as any)?.email?.split('@')[0] || 'Anonymous'
  const description = post.content.replace(/[#*_`\[\]]/g, '').substring(0, 155) + '...'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syrealize.com'
  const ogImageUrl = `${siteUrl}/api/og?id=${post.id}`

  return {
    title: `${post.title} | Syrealize`,
    description,
    authors: [{ name: authorName }],
    keywords: post.tags || [],
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `${siteUrl}/post/${post.id}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      siteName: 'Syrealize',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${siteUrl}/post/${post.id}`,
    },
  }
}

// Reading time calculator
function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export default async function PostPage(props: PostPageProps) {
  const params = await props.params
  const { id } = params
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
        // forked_from:posts!posts_forked_from_id_fkey(id, title)
      `
    )
    .eq('id', id)
    .single()

  if (error || !post) {
    console.error('Error fetching post:', error)
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
          author:users(name, email)
        `
      )
      .neq('id', id)
      .overlaps('tags', post.tags)
      .limit(5)

    relatedPosts = data || []
  }

  const { data: citationData } = await supabase
    .from('citations')
    .select(
      `
        source_post_id,
        quote_content,
        posts!citations_source_post_id_fkey (
          id,
          title,
          created_at,
          author:users(name, email)
        )
      `
    )
    .eq('target_post_id', id)


  const citationBacklinks =
    citationData?.map((c: any) => ({
      ...c.posts,
      quote_content: c.quote_content
    })).filter((c: any) => c.id) || []

  const authorDisplay =
    post.author?.name || post.author?.email?.split('@')[0] || 'Anonymous'

  const readingTime = getReadingTime(post.content || '')

  // Fetch answers if it's a question
  let answers: any[] = []
  if (post.content_type === 'question') {
    const { data: answersData } = await supabase
      .from('posts')
      .select(`
        *,
        author:users(id, name, email),
        vote_count:post_votes(value)
      `)
      .eq('parent_id', id)
      .eq('content_type', 'answer')
      .order('is_accepted', { ascending: false })
      .order('created_at', { ascending: true })

    answers = answersData || []
  }

  // Fetch linked resources
  let linkedResources: any[] = []
  const { data: resourceLinksData } = await supabase
    .from('resource_post_links')
    .select(`
      resource_id,
      posts!resource_post_links_resource_id_fkey (
        id,
        title,
        metadata,
        created_at
      )
    `)
    .eq('post_id', id)


  if (resourceLinksData) {
    linkedResources = resourceLinksData
      .map((link: any) => link.posts)
      .filter((r: any) => r !== null)
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
      <Navbar user={user} />

      {/* Hero Header with Cover Image Background */}
      <header className={`group relative overflow-hidden ${post.cover_image_url ? 'min-h-[350px] md:min-h-[400px]' : ''}`}>
        {/* Cover Image Background */}
        {post.cover_image_url && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${post.cover_image_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30 transition-opacity duration-500 group-hover:opacity-60" />
          </>
        )}

        {/* Header Content */}
        <div className={`relative z-10 ${post.cover_image_url ? '' : 'bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border'}`}>
          <div className="container-custom max-w-5xl py-6">
            {/* Back Link */}
            <Link
              href="/feed"
              className={`inline-flex items-center gap-2 text-sm transition-colors mb-8 ${post.cover_image_url
                ? 'text-white/80 hover:text-white'
                : 'text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-primary-light'
                }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Feed
            </Link>

            {/* Content Type Badge */}
            {post.content_type === 'question' && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary-dark dark:text-secondary text-sm font-semibold">
                  <MessageSquare className="w-4 h-4" />
                  Question
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className={`text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6 ${post.cover_image_url ? 'text-white' : 'text-text dark:text-dark-text'
              }`}>
              {post.title}
            </h1>

            {/* Forked From */}
            {post.forked_from && (
              <div className="flex items-center gap-2 mb-6 text-sm text-text-light dark:text-dark-text-muted bg-gray-50 dark:bg-dark-bg p-3 rounded-xl border border-gray-100 dark:border-dark-border w-fit">
                <GitFork className="w-4 h-4 text-secondary" />
                <span>Remixed from</span>
                <Link href={`/post/${post.forked_from.id}`} className="font-semibold text-primary dark:text-primary-light hover:underline">
                  {post.forked_from.title}
                </Link>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.cover_image_url ? (
                  // White tags for visibility on cover image
                  post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-sm font-medium bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  // Normal tags for default background
                  post.tags.map((tag: string) => (
                    <TagChip key={tag} tag={tag} interactive />
                  ))
                )}
              </div>
            )}

            {/* Meta Row */}
            <div className={`flex flex-wrap items-center gap-6 text-sm ${post.cover_image_url ? 'text-white/80' : 'text-text-light dark:text-dark-text-muted'
              }`}>
              {/* Author */}
              <Link
                href={`/profile/${post.author_id}`}
                className={`flex items-center gap-3 transition-colors ${post.cover_image_url ? 'hover:text-white' : 'hover:text-primary dark:hover:text-primary-light'
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                  {(post.author?.name?.[0] || post.author?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <span className={`font-semibold block ${post.cover_image_url ? 'text-white' : 'text-text dark:text-dark-text'}`}>{authorDisplay}</span>
                  {post.author?.affiliation && (
                    <span className="text-xs">{post.author.affiliation}</span>
                  )}
                </div>
              </Link>

              <span className="text-gray-300 dark:text-gray-700">•</span>

              {/* Date */}
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

              <span className="text-gray-300 dark:text-gray-700">•</span>

              {/* Reading Time */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min read</span>
              </div>

              {/* License */}
              {post.license && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-bg text-xs">
                    {post.license}
                  </span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-dark-border">
              {user && user.id === post.author_id ? (
                <>
                  <EditButton
                    postId={post.id}
                    postCreatedAt={post.created_at}
                    isAuthor={true}
                  />
                  <Link href={`/post/${post.id}/suggestions`}>
                    <Button variant="outline" className="gap-2">
                      <GitPullRequest className="w-4 h-4" />
                      Suggestions
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <ForkButton
                    postId={post.id}
                    postTitle={post.title}
                    postContent={post.content}
                    postTags={post.tags || []}
                  />
                  <SuggestionDialog
                    postId={post.id}
                    currentContent={post.content}
                  />
                </>
              )}

              <div className="flex-1" />

              <BookmarkButton postId={post.id} />
              <PostMoreOptions postId={post.id} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container-custom max-w-5xl py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <article className="lg:col-span-2 space-y-12">
            {/* Article Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert 
              prose-headings:font-bold prose-headings:text-text dark:prose-headings:text-dark-text 
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-text-light prose-p:dark:text-dark-text-muted prose-p:leading-relaxed
              prose-a:text-primary dark:prose-a:text-primary-light prose-a:no-underline hover:prose-a:underline
              prose-strong:text-text dark:prose-strong:text-dark-text 
              prose-code:text-accent dark:prose-code:text-accent-light prose-code:bg-gray-100 dark:prose-code:bg-dark-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-dark-surface prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              prose-img:rounded-xl prose-img:shadow-soft-md
              prose-ul:my-6 prose-li:my-1
            ">
              <TextSelectionHandler postId={post.id}>
                <ReactMarkdown>{post.content || ''}</ReactMarkdown>
              </TextSelectionHandler>
            </div>

            {/* Answers Section for Questions */}
            {post.content_type === 'question' && (
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-text dark:text-dark-text">
                    {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                  </h2>
                </div>

                <AnswerList
                  answers={answers}
                  isQuestionAuthor={user?.id === post.author_id}
                />

                {/* Answer Form */}
                {user ? (
                  <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
                    <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4">Your Answer</h3>
                    <AnswerForm questionId={post.id} />
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-dark-surface rounded-2xl">
                    <p className="text-text-light dark:text-dark-text-muted mb-4">
                      Sign in to answer this question.
                    </p>
                    <Link href="/auth/login">
                      <Button>Sign In</Button>
                    </Link>
                  </div>
                )}
              </section>
            )}

            {/* Comments Section */}
            {post.content_type !== 'question' && <CommentsSection postId={post.id} />}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Author Card */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-text-light dark:text-dark-text-muted mb-4">
                About the Author
              </h3>
              <Link
                href={`/profile/${post.author_id}`}
                className="flex items-start gap-4 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-white flex-shrink-0 group-hover:scale-105 transition-transform">
                  {(post.author?.name?.[0] || post.author?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                    {authorDisplay}
                  </p>
                  {post.author?.affiliation && (
                    <p className="text-sm text-text-light dark:text-dark-text-muted truncate">
                      {post.author.affiliation}
                    </p>
                  )}
                  {post.author?.bio && (
                    <p className="text-sm text-text-light dark:text-dark-text-muted line-clamp-2 mt-2">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </Link>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-text-light dark:text-dark-text-muted mb-4">
                  Related Research
                </h3>
                <div className="space-y-4">
                  {relatedPosts.slice(0, 4).map((relPost: any) => (
                    <Link
                      key={relPost.id}
                      href={`/post/${relPost.id}`}
                      className="block group"
                    >
                      <h4 className="font-medium text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2 text-sm">
                        {relPost.title}
                      </h4>
                      <p className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                        {new Date(relPost.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Citation Backlinks */}
            {citationBacklinks.length > 0 && (
              <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-text-light dark:text-dark-text-muted mb-4">
                  Cited By
                </h3>
                <div className="space-y-4">
                  {citationBacklinks.slice(0, 4).map((citation: any) => (
                    <Link
                      key={citation.id}
                      href={`/post/${citation.id}`}
                      className="block group"
                    >
                      <h4 className="font-medium text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2 text-sm">
                        {citation.title}
                      </h4>
                      {citation.quote_content && (
                        <p className="text-xs text-text-light dark:text-dark-text-muted mt-1 italic line-clamp-2">
                          "{citation.quote_content}"
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Resources */}
            <LinkedResourcesSection resources={linkedResources} />

            {/* Knowledge Graph */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-text-light dark:text-dark-text-muted mb-4">
                Knowledge Graph
              </h3>
              <KnowledgeGraph centerPostId={post.id} />
            </div>
          </aside>
        </div>
      </main>

      {/* Citation Context Bar */}
      <CitationContextBar postId={post.id} currentTags={post.tags || []} />

      <Footer />
    </div>
  )
}
