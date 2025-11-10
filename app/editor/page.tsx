'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Eye, FileText, Save } from 'lucide-react'
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
  const { showToast } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewActive, setPreviewActive] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<EditorErrors>({})

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
      setInitializing(false)
    }

    hydrateUser()

    return () => {
      mounted = false
    }
  }, [router, showToast, supabase])

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
        const { data, error } = await supabase
          .from('posts')
          .insert({
            title: title.trim(),
            content: content.trim(),
            tags: tagArray,
            author_id: user.id,
            published: publish,
          })
          .select('id')
          .single()

        if (error) {
          throw error
        }

        showToast(
          publish ? 'Post published successfully.' : 'Draft saved successfully.',
          'success'
        )

        router.push(publish ? `/post/${data.id}` : '/feed')
      } catch (error) {
        console.error('Failed to store post', error)
        showToast('Unable to save your post right now. Please try again.', 'error')
      } finally {
        setSaving(false)
      }
    },
    [content, router, showToast, supabase, tags, title, user, validate]
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
              Craft a new research note
            </h1>
          </div>
          <p className="text-sm text-text-light dark:text-dark-text-muted">
            Share your latest findings, methodologies, or reflections. Keep titles focused and add
            tags so peers can discover your work quickly.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-surface">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
                  placeholder="What are you researching today?"
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
