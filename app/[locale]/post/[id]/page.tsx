import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User as UserIcon, PenSquare, GitPullRequest } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { TagChip } from '@/components/TagChip'
import { RelatedPosts } from '@/components/RelatedPosts'
import { CitationBacklinks } from '@/components/CitationBacklinks'
import { CommentsSection } from '@/components/CommentsSection'
import { AnswerList } from '@/components/AnswerList'
import { AnswerForm } from '@/components/AnswerForm'
import { ForkButton } from '@/components/ForkButton'
import { SuggestionDialog } from '@/components/SuggestionDialog'
import { KnowledgeGraph } from '@/components/KnowledgeGraph'
import { PostMoreOptions } from '@/components/PostMoreOptions'
import { TextSelectionHandler } from '@/components/TextSelectionHandler'
import { GitFork } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'

interface PostPageProps {
  params: Promise<{
    id: string
  }>
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
        author:users!posts_author_id_fkey(id, name, email, bio, affiliation),
        forked_from:posts!forked_from_id(id, title)
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
          author:users!posts_author_id_fkey(name, email)
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
          author:users!posts_author_id_fkey(name, email)
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

  const contentParagraphs = (post.content || '').split('\n')

  // Fetch answers if it's a question
  let answers: any[] = []
  if (post.content_type === 'question') {
    const { data: answersData } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(id, name, email),
        vote_count:post_votes(value)
      `)
      .eq('parent_id', id)
      .eq('content_type', 'answer')
      .order('is_accepted', { ascending: false })
      .order('created_at', { ascending: true }) // Oldest first for answers usually, or by votes

    // Calculate vote counts manually since we can't easily do it in one query without a view or function
    // Or we can just trust the client-side calculation for now, but better to do it here.
    // Actually, let's fetch votes separately or use a view in the future.
    // For now, we'll just pass the raw data and let the component handle it or fetch it.
    // Wait, the previous vote implementation returned a count.
    // Let's just fetch the answers and their vote counts if we had a view.
    // Since we don't have a view, we'll fetch all votes for these answers? No, that's too much.
    // Let's just fetch the answers and let the AnswerCard fetch its own vote count or just display 0 for now until we add a trigger to update a column.
    // Actually, I can use the .select(..., { count: 'exact' }) on the votes table for each answer? No.

    // Simplest approach for MVP: Just fetch answers. The AnswerCard can fetch its own vote count on mount if needed, 
    // OR we can add a `vote_count` column to posts and keep it updated.
    // Given the constraints, I'll update the `AnswerCard` to fetch its own vote count if it's not provided, 
    // OR I can do a quick hack here to fetch vote counts.

    // Let's stick to fetching answers. The AnswerCard will default to 0.
    answers = answersData || []
  }

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
          <article className="lg:col-span-2 space-y-8">
            <div className="card p-8 md:p-12">
              <header className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  {post.content_type === 'question' && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                      Question
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-primary dark:text-dark-text mb-6 leading-tight">
                  {post.title}
                </h1>

                {post.forked_from && (
                  <div className="flex items-center gap-2 mb-6 text-sm text-text-light dark:text-dark-text-muted bg-gray-50 dark:bg-dark-surface p-2 rounded-lg border border-gray-100 dark:border-dark-border w-fit">
                    <GitFork className="w-4 h-4" />
                    <span>Remixed from</span>
                    <Link href={`/post/${post.forked_from.id}`} className="font-medium text-primary dark:text-accent-light hover:underline">
                      {post.forked_from.title}
                    </Link>
                  </div>
                )}

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
                  {post.license && (
                    <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-surface text-text-light dark:text-dark-text-muted border border-gray-200 dark:border-dark-border">
                      License: {post.license}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-dark-border">
                  {user && user.id === post.author_id ? (
                    <>
                      <Link href={`/editor?id=${post.id}`}>
                        <Button className="gap-2">
                          <PenSquare className="w-4 h-4" />
                          Edit Post
                        </Button>
                      </Link>
                      <Link href={`/post/${post.id}/suggestions`}>
                        <Button variant="outline" className="gap-2">
                          <GitPullRequest className="w-4 h-4" />
                          Review Suggestions
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

                  <PostMoreOptions postId={post.id} />
                </div>
              </header>

              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-primary dark:prose-headings:text-dark-text prose-a:text-accent dark:prose-a:text-accent-light prose-strong:text-primary dark:prose-strong:text-dark-text prose-code:text-accent dark:prose-code:text-accent-light">
                <TextSelectionHandler postId={post.id}>
                  <ReactMarkdown>{post.content || ''}</ReactMarkdown>
                </TextSelectionHandler>
              </div>
            </div>

            {/* Answers Section */}
            {post.content_type === 'question' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-text dark:text-dark-text">
                  {answers.length} Answers
                </h2>

                <AnswerList
                  answers={answers}
                  isQuestionAuthor={user?.id === post.author_id}
                />

                {/* Answer Form */}
                {user ? (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
                    <AnswerForm questionId={post.id} />
                  </div>
                ) : (
                  <div className="card p-6 text-center bg-gray-50 dark:bg-dark-surface">
                    <p className="text-text-light dark:text-dark-text-muted mb-4">
                      Sign in to answer this question.
                    </p>
                    <Link href="/auth/login" className="btn btn-primary">
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            )}

            {post.content_type !== 'question' && <CommentsSection postId={post.id} />}
          </article>

          <aside className="lg:col-span-1 space-y-6">
            {relatedPosts.length > 0 && (
              <RelatedPosts posts={relatedPosts} />
            )}

            {citationBacklinks.length > 0 && (
              <CitationBacklinks citations={citationBacklinks} />
            )}

            <div className="card p-4">
              <h3 className="font-display font-semibold text-lg text-primary dark:text-dark-text mb-4">
                Knowledge Graph
              </h3>
              <KnowledgeGraph centerPostId={post.id} />
            </div>

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
      </main >
    </div >
  )
}
