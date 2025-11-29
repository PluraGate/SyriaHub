'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Eye, FileText, Save, HelpCircle, BookOpen, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { useToast } from '@/components/ui/toast'

type EditorErrors = {
  title?: string
  content?: string
}

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
}

export default function EditorPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupIdParam = searchParams.get('groupId')
  const postIdParam = searchParams.get('id')
  const { showToast } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewActive, setPreviewActive] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [contentType, setContentType] = useState<'article' | 'question'>('article')
  const [errors, setErrors] = useState<EditorErrors>({})
  const [group, setGroup] = useState<any>(null)

  // Fetch group details if groupId is present
  useEffect(() => {
    if (groupIdParam) {
      supabase
        .from('groups')
        .select('id, name')
        .eq('id', groupIdParam)
        .single()
        .then(({ data }) => {
          if (data) setGroup(data)
        })
    }
  }, [groupIdParam, supabase])

  // Fetch post details if postId is present (Editing mode)
  useEffect(() => {
    async function fetchPost() {
      if (!postIdParam) return

      setInitializing(true)
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postIdParam)
          .single()

        if (error) {
          console.error('Failed to fetch post', error)
          showToast('Failed to load post for editing', 'error')
          router.push('/feed')
          return
        }

        if (data) {
          setTitle(data.title)
          setContent(data.content)
          setTags(data.tags ? data.tags.join(', ') : '')
          setContentType(data.content_type as 'article' | 'question')

          if (data.group_id) {
            const { data: groupData } = await supabase
              .from('groups')
              .select('id, name')
              .eq('id', data.group_id)
              .single()

            if (groupData) setGroup(groupData)
          }
        }
      } catch (error) {
        console.error('Error loading post:', error)
      } finally {
        setInitializing(false)
      }
    }

    fetchPost()
  }, [postIdParam, supabase, router, showToast])

  useEffect(() => {
    let mounted = true

    async function hydrateUser() {
      const { data, error } = await supabase.auth.getUser()
      if (!mounted) {
        return
      }

      if (error) {
        console.error('Failed to load user session', error)
        showToast('Could not verify your session. Please sign in again.', 'error')
        setInitializing(false)
        router.replace('/auth/login')
        return
      }

      if (!data.user) {
        setInitializing(false)
        router.replace('/auth/login')
        return
      }

      setUser(data.user)
      // Only set initializing to false if we are NOT loading a post
      if (!postIdParam) {
        setInitializing(false)
      }
    }

    hydrateUser()

    return () => {
      mounted = false
    }
  }, [router, showToast, supabase, postIdParam])

  const validate = useCallback((): boolean => {
    const nextErrors: EditorErrors = {}

    if (!title.trim()) {
      nextErrors.title = 'Give your post a descriptive title.'
    }

    if (!content.trim()) {
      nextErrors.content = 'Add some content before publishing.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [content, title])

  const persistPost = useCallback(
    async (publish: boolean) => {
      if (!user) {
        showToast('Sign in to create a post.', 'warning')
        router.push('/auth/login')
        return
      }

      if (!validate()) {
        showToast('Please fix the highlighted fields.', 'warning')
        return
      }

      setSaving(true)

      try {
        const tagArray = parseTags(tags)
        const postData = {
          title: title.trim(),
          content: content.trim(),
          tags: tagArray,
          author_id: user.id,
          content_type: contentType,
          status: publish ? 'published' : 'draft',
          group_id: group?.id || null
        }

        let result;

        if (postIdParam) {
          // Update existing post
          result = await supabase
            .from('posts')
            .update(postData)
            .eq('id', postIdParam)
            .select('id')
            .single()
        } else {
          // Create new post
          result = await supabase
            .from('posts')
            .insert(postData)
            .select('id')
            .single()
        }

        const { data, error } = result

        if (error) {
          throw error
        }

        showToast(
          publish ? 'Post published successfully.' : 'Draft saved successfully.',
          'success'
        )

        router.push(publish ? (group ? `/groups/${group.id}` : `/post/${data.id}`) : '/feed')
      } catch (error) {
        console.error('Failed to store post', error)
        showToast('Unable to save your post right now. Please try again.', 'error')
      } finally {
        setSaving(false)
      }
    },
    [content, router, showToast, supabase, tags, title, user, validate, contentType, group, postIdParam]
  )

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      await persistPost(true)
    },
    [persistPost]
  )

  const handleDraft = useCallback(async () => {
    await persistPost(false)
  }, [persistPost])

  const tagList = useMemo(() => parseTags(tags), [tags])
  const contentParagraphs = useMemo(
    () =>
      content
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean),
    [content]
  )

  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary dark:border-accent" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
          <FileText className="h-12 w-12 text-primary dark:text-accent-light" />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-text dark:text-dark-text">
              Let&apos;s get you signed in
            </h1>
            <p className="text-sm text-text-light dark:text-dark-text-muted">
              You need an account before you can craft a new research note.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            Go to login
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <Navbar user={user} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-10">
        <header className="space-y-3 border-b border-gray-200 pb-6 dark:border-dark-border">
          <div className="flex items-center gap-3 text-primary dark:text-accent-light">
            <FileText className="h-6 w-6" />
            <h1 className="text-3xl font-semibold text-primary dark:text-dark-text">
              {contentType === 'question' ? 'Ask a Question' : 'Craft a new research note'}
            </h1>
          </div>
          <p className="text-sm text-text-light dark:text-dark-text-muted">
            Share your latest findings, methodologies, or reflections. Keep titles focused and add
            tags so peers can discover your work quickly.
          </p>
        </header>

        {group && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg text-primary dark:text-accent-light">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">
              Posting to group: <strong>{group.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => setGroup(null)}
              className="ml-auto text-xs hover:underline opacity-70 hover:opacity-100"
            >
              Remove
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-surface">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

              {/* Content Type Selector */}
              <div className="flex gap-4 p-1 bg-gray-100 dark:bg-dark-bg rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setContentType('article')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${contentType === 'article'
                    ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                    : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                    }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Article
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('question')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${contentType === 'question'
                    ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                    : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                    }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  Question
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-text dark:text-dark-text"
                >
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  autoComplete="off"
                  placeholder={contentType === 'question' ? "What's your question?" : "What are you researching today?"}
                  value={title}
                  onChange={event => setTitle(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="content"
                    className="text-sm font-medium text-text dark:text-dark-text"
                  >
                    Content
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewActive(current => !current)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-text transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:text-dark-text dark:hover:border-accent-light"
                  >
                    <Eye className="h-4 w-4" />
                    {previewActive ? 'Hide preview' : 'Show preview'}
                  </button>
                </div>
                <textarea
                  id="content"
                  name="content"
                  value={content}
                  onChange={event => setContent(event.target.value)}
                  placeholder="Write in clear paragraphs. Use blank lines between sections."
                  className="min-h-[16rem] w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-base leading-relaxed shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                />
                {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                {previewActive && (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-dark-border dark:bg-dark-surface">
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-light dark:text-dark-text-muted">
                      Preview
                    </h2>
                    {contentParagraphs.length > 0 ? (
                      <div className="space-y-3 text-sm text-text dark:text-dark-text">
                        {contentParagraphs.map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-light dark:text-dark-text-muted">
                        Start typing to see a live preview of your post.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="tags"
                  className="text-sm font-medium text-text dark:text-dark-text"
                >
                  Tags
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={tags}
                  onChange={event => setTags(event.target.value)}
                  placeholder="Separate tags with commas (e.g. methodology, ethics, syria)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                />
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tagList.map(tag => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-accent-light/10 dark:text-accent-light"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent dark:hover:bg-accent/90"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving…' : 'Publish post'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleDraft}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-text transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-dark-border dark:text-dark-text dark:hover:border-accent-light"
                >
                  Save draft
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-surface">
              <h2 className="mb-3 text-base font-semibold text-text dark:text-dark-text">
                Writing tips
              </h2>
              <ul className="space-y-3 text-sm text-text-light dark:text-dark-text-muted">
                <li>Lead with a clear thesis or summary in your opening paragraph.</li>
                <li>Use tags to highlight disciplines, regions, and methods.</li>
                <li>Preview your post to ensure citations and formatting look correct.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-surface">
              <h2 className="mb-3 text-base font-semibold text-text dark:text-dark-text">
                Need inspiration?
              </h2>
              <p className="mb-4 text-sm text-text-light dark:text-dark-text-muted">
                Explore recent research in the{' '}
                <Link className="text-primary dark:text-accent-light" href="/feed">
                  feed
                </Link>{' '}
                or discover trending topics on the{' '}
                <Link className="text-primary dark:text-accent-light" href="/explore">
                  explore
                </Link>{' '}
                page.
              </p>
              <Link
                href="/feed"
                className="inline-flex items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-accent-light dark:text-accent-light dark:hover:bg-accent-light/10"
              >
                Browse recent posts
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
