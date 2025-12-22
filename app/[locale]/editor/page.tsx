'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { FileText, Save, HelpCircle, BookOpen, Users, ArrowLeft, Sparkles, Type, Image as ImageIcon, Calendar, MapPin, Camera, Clock, AlertCircle, Table } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useToast } from '@/components/ui/toast'
import { CoverImageUpload } from '@/components/CoverImageUpload'
import { useAutosave } from '@/lib/hooks/useAutosave'
import { useCollaboration } from '@/lib/hooks/useCollaboration'
import { DraftRecoveryBanner, AutosaveIndicator } from '@/components/DraftRecoveryBanner'
import { ResourceLinker } from '@/components/ResourceLinker'
import { CollaboratorAvatars } from '@/components/CollaboratorAvatars'
import { AddCitationDialog } from '@/components/AddCitationDialog'
import { SpatialEditor } from '@/components/spatial'
import { useTranslations } from 'next-intl'

// Dynamic import for RichEditor to avoid SSR issues
const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false })

type EditorErrors = {
  title?: string
  content?: string
}

interface Citation {
  type: 'internal' | 'external'
  target_post_id?: string
  target_post?: { id: string; title: string; author?: { name?: string | null; email?: string | null } | null; created_at: string }
  quote_content?: string
  external_url?: string
  external_doi?: string
  external_title?: string
  external_author?: string
  external_year?: number
  external_source?: string
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
  const critiqueOfParam = searchParams.get('critique_of')
  const quoteParam = searchParams.get('quote')
  const { showToast } = useToast()
  const t = useTranslations('Editor')
  const tCommon = useTranslations('Common')

  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [citations, setCitations] = useState<Citation[]>([])
  const [contentType, setContentType] = useState<'article' | 'question' | 'trace'>('article')
  const [license, setLicense] = useState('CC-BY-4.0')
  const [errors, setErrors] = useState<EditorErrors>({})
  const [group, setGroup] = useState<any>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [useRichEditor, setUseRichEditor] = useState(true)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [linkedResources, setLinkedResources] = useState<any[]>([])

  // Epistemic Architecture fields
  const [temporalCoverageStart, setTemporalCoverageStart] = useState('')
  const [temporalCoverageEnd, setTemporalCoverageEnd] = useState('')
  const [spatialCoverage, setSpatialCoverage] = useState('')
  const [spatialGeometry, setSpatialGeometry] = useState<any>(null)

  // Real-time collaboration for editing existing posts
  const { collaborators, isConnected, userColor } = useCollaboration({
    documentId: postIdParam || 'new',
    userId: user?.id || 'anon',
    userName: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Anonymous',
    userAvatar: user?.user_metadata?.avatar_url
  })

  // Autosave hook - only active when creating new posts (not editing)
  const {
    hasDraft,
    draftData,
    lastSaved,
    restoreDraft,
    clearDraft,
    saveDraft,
  } = useAutosave({
    key: groupIdParam ? `group_${groupIdParam}` : 'new_post',
    enabled: !postIdParam, // Only autosave for new posts, not edits
  })

  // Check for existing draft on mount
  useEffect(() => {
    if (hasDraft && draftData && !postIdParam && !title && !content) {
      setShowDraftBanner(true)
    }
  }, [hasDraft, draftData, postIdParam, title, content])

  // Handle draft restoration
  const handleRestoreDraft = useCallback(() => {
    const draft = restoreDraft()
    if (draft) {
      setTitle(draft.title)
      setContent(draft.content)
      setTags(draft.tags)
      setContentType(draft.contentType)
      setCoverImage(draft.coverImage)
      setLicense(draft.license)
      // Restore spatial/temporal data
      if (draft.temporalCoverageStart) setTemporalCoverageStart(draft.temporalCoverageStart)
      if (draft.temporalCoverageEnd) setTemporalCoverageEnd(draft.temporalCoverageEnd)
      if (draft.spatialCoverage) setSpatialCoverage(draft.spatialCoverage)
      if (draft.spatialGeometry) setSpatialGeometry(draft.spatialGeometry)
      setShowDraftBanner(false)
      showToast('Draft restored successfully', 'success')
    }
  }, [restoreDraft, showToast])

  // Handle draft discard
  const handleDiscardDraft = useCallback(() => {
    clearDraft()
    setShowDraftBanner(false)
  }, [clearDraft])

  // Auto-save on content changes (debounced)
  useEffect(() => {
    if (postIdParam) return // Don't autosave when editing
    if (!title && !content) return // Don't save empty

    saveDraft({
      title,
      content,
      tags,
      contentType,
      coverImage,
      license,
      temporalCoverageStart,
      temporalCoverageEnd,
      spatialCoverage,
      spatialGeometry,
    })
  }, [title, content, tags, contentType, coverImage, license, postIdParam, saveDraft, temporalCoverageStart, temporalCoverageEnd, spatialCoverage, spatialGeometry])

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

  // Handle critique_of param and quote param
  useEffect(() => {
    if (critiqueOfParam) {
      supabase.from('posts').select('id, title, created_at, author:users!posts_author_id_fkey(name, email)').eq('id', critiqueOfParam).single().then(({ data }) => {
        if (data) {
          // Add as internal citation - author may be array from join, extract first
          const authorData = Array.isArray(data.author) ? data.author[0] : data.author
          setCitations([{
            type: 'internal',
            target_post_id: data.id,
            target_post: {
              id: data.id,
              title: data.title,
              created_at: data.created_at,
              author: authorData
            },
            quote_content: quoteParam ? decodeURIComponent(quoteParam) : undefined,
          }])
          setTitle(`Critique of: ${data.title}`)
          setTags('critique, review')
          if (quoteParam) {
            setContent(`> ${decodeURIComponent(quoteParam)}\n\n`)
          }
        }
      })
    }
  }, [critiqueOfParam, quoteParam, supabase])

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
          // Check 24h edit window
          const EDIT_WINDOW_HOURS = 24
          const createdAt = new Date(data.created_at)
          const editDeadline = new Date(createdAt.getTime() + EDIT_WINDOW_HOURS * 60 * 60 * 1000)
          const now = new Date()

          if (now > editDeadline) {
            showToast('The 24-hour edit window has expired. This post can no longer be edited.', 'error')
            router.push(`/post/${postIdParam}`)
            return
          }

          setTitle(data.title)
          setContent(data.content)
          setTags(data.tags ? data.tags.join(', ') : '')
          setContentType(data.content_type as 'article' | 'question')
          setCoverImage(data.cover_image_url || null)
          setLicense(data.license || 'CC-BY-4.0')

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
      if (!mounted) return

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
      if (!postIdParam) {
        setInitializing(false)
      }
    }

    hydrateUser()
    return () => { mounted = false }
  }, [router, showToast, supabase, postIdParam])

  const validate = useCallback((): boolean => {
    const nextErrors: EditorErrors = {}
    if (!title.trim()) nextErrors.title = 'Give your post a descriptive title.'
    if (!content.trim()) nextErrors.content = 'Add some content before publishing.'
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
        const postData: Record<string, unknown> = {
          title: title.trim(),
          content: content.trim(),
          tags: tagArray,
          author_id: user.id,
          content_type: contentType,
          status: publish ? 'published' : 'draft',
          group_id: group?.id || null,
          license: license,
        }

        // Only include cover_image_url if set (column may not exist in DB yet)
        if (coverImage) {
          postData.cover_image_url = coverImage
        }

        // Include temporal/spatial coverage if set (Epistemic Architecture)
        if (temporalCoverageStart) {
          postData.temporal_start = temporalCoverageStart
        }
        if (temporalCoverageEnd) {
          postData.temporal_end = temporalCoverageEnd
        }
        if (spatialCoverage.trim()) {
          postData.spatial_coverage = spatialCoverage.trim()
        }
        if (spatialGeometry) {
          postData.spatial_geometry = spatialGeometry
        }

        console.log('Saving post with data:', postData)

        let result;
        if (postIdParam) {
          result = await supabase.from('posts').update(postData).eq('id', postIdParam).select('id').single()
        } else {
          result = await supabase.from('posts').insert(postData).select('id').single()
        }

        const { data, error } = result
        if (error) throw error

        if (citations.length > 0) {
          // Delete existing citations if editing
          if (postIdParam) {
            await supabase.from('citations').delete().eq('source_post_id', data.id)
          }

          // Insert internal citations
          const internalCitations = citations
            .filter(c => c.type === 'internal' && c.target_post_id)
            .map(c => ({
              source_post_id: data.id,
              target_post_id: c.target_post_id,
              quote_content: c.quote_content || null,
              type: 'internal',
              created_by: user.id,
            }))

          // Insert external citations
          const externalCitations = citations
            .filter(c => c.type === 'external')
            .map(c => ({
              source_post_id: data.id,
              target_post_id: null,
              type: 'external',
              created_by: user.id,
              external_url: c.external_url || null,
              external_doi: c.external_doi || null,
              external_title: c.external_title || null,
              external_author: c.external_author || null,
              external_year: c.external_year || null,
              external_source: c.external_source || null,
            }))

          const allCitations = [...internalCitations, ...externalCitations]
          if (allCitations.length > 0) {
            await supabase.from('citations').insert(allCitations)
          }
        }

        // Save resource links
        if (linkedResources.length > 0) {
          // First, remove existing links if editing
          if (postIdParam) {
            await supabase.from('resource_post_links').delete().eq('post_id', data.id)
          }
          // Insert new resource links
          const resourceLinks = linkedResources.map(resource => ({
            resource_id: resource.id,
            post_id: data.id,
            created_by: user.id
          }))
          await supabase.from('resource_post_links').insert(resourceLinks)
        }

        showToast(publish ? 'Post published successfully!' : 'Draft saved successfully.', 'success')

        // Clear localStorage draft after successful publish
        if (publish && !postIdParam) {
          clearDraft()
        }

        await new Promise(resolve => setTimeout(resolve, 1500))
        router.push(publish ? (group ? `/groups/${group.id}` : `/post/${data.id}`) : '/feed')
      } catch (error) {
        console.error('Failed to store post', error)
        showToast('Unable to save your post right now. Please try again.', 'error')
      } finally {
        setSaving(false)
      }
    },
    [content, router, showToast, supabase, tags, title, user, validate, contentType, group, postIdParam, citations, license, quoteParam, coverImage, linkedResources, clearDraft]
  )

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await persistPost(true)
  }, [persistPost])

  const handleDraft = useCallback(async () => {
    await persistPost(false)
  }, [persistPost])

  const tagList = useMemo(() => parseTags(tags), [tags])

  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary dark:border-primary-light" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text dark:text-dark-text">
              {t('page.signInToWrite')}
            </h1>
            <p className="text-text-light dark:text-dark-text-muted max-w-md">
              {t('page.needAccount')}
            </p>
          </div>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all"
          >
            {t('page.signIn')}
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
      <Navbar user={user} />

      {/* Header */}
      <header className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
        <div className="container-custom max-w-5xl py-6">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-primary-light transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('page.backToFeed')}
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              {contentType === 'question' ? (
                <HelpCircle className="w-6 h-6 text-white" />
              ) : (
                <FileText className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text dark:text-dark-text">
                {postIdParam ? t('page.editPost') : contentType === 'question' ? t('page.askQuestion') : t('page.writeNewPost')}
              </h1>
              <p className="text-sm text-text-light dark:text-dark-text-muted">
                {t('page.shareResearch')}
              </p>
            </div>
          </div>

          {group && (
            <div className="flex items-center gap-2 mt-4 px-4 py-3 bg-secondary/10 border border-secondary/20 rounded-xl text-secondary-dark dark:text-secondary">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t('page.posting')} <strong>{group.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setGroup(null)}
                className="ml-auto text-xs hover:underline opacity-70 hover:opacity-100"
              >
                {t('page.remove')}
              </button>
            </div>
          )}

          {/* Real-time Collaboration Presence */}
          {postIdParam && user && (
            <div className="mt-4">
              <CollaboratorAvatars
                collaborators={collaborators}
                isConnected={isConnected}
                userColor={userColor}
              />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container-custom max-w-5xl py-8">
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          {/* Editor Form */}
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6 md:p-8">
            {/* Draft Recovery Banner */}
            {showDraftBanner && draftData && (
              <DraftRecoveryBanner
                draftData={draftData}
                onRestore={handleRestoreDraft}
                onDiscard={handleDiscardDraft}
              />
            )}

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

              {/* Content Type Toggle */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 dark:bg-dark-bg rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setContentType('article')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${contentType === 'article'
                      ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                      : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                      }`}
                    title={t('page.contentTypeHelp.article')}
                  >
                    <BookOpen className="w-4 h-4" />
                    {t('page.article')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('question')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${contentType === 'question'
                      ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                      : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                      }`}
                    title={t('page.contentTypeHelp.question')}
                  >
                    <HelpCircle className="w-4 h-4" />
                    {t('page.question')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('trace')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${contentType === 'trace'
                      ? 'bg-white dark:bg-dark-surface text-secondary-dark shadow-sm'
                      : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                      }`}
                    title={t('page.contentTypeHelp.trace')}
                  >
                    <Camera className="w-4 h-4" />
                    {t('page.trace')}
                  </button>
                </div>
                {/* Help text for selected content type */}
                <p className="text-xs text-text-light dark:text-dark-text-muted italic">
                  {contentType === 'article' && t('page.contentTypeHelp.article')}
                  {contentType === 'question' && t('page.contentTypeHelp.question')}
                  {contentType === 'trace' && t('page.contentTypeHelp.trace')}
                </p>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text dark:text-dark-text">
                  {t('coverImage')}
                </label>
                {user && (
                  <CoverImageUpload
                    value={coverImage}
                    onChange={setCoverImage}
                    userId={user.id}
                  />
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-semibold text-text dark:text-dark-text">
                  {t('title')}
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  autoComplete="off"
                  placeholder={contentType === 'question' ? t('page.titlePlaceholderQuestion') : t('page.titlePlaceholderArticle')}
                  value={title}
                  onChange={event => setTitle(event.target.value)}
                  className="w-full px-4 py-3.5 text-lg rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-dark-surface transition-all"
                />
                {errors.title && <p className="text-sm text-accent">{errors.title}</p>}
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="content" className="text-sm font-semibold text-text dark:text-dark-text">
                    {t('content')}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUseRichEditor(!useRichEditor)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${useRichEditor
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-200 dark:border-dark-border text-text-light dark:text-dark-text-muted hover:border-primary hover:text-primary'
                        }`}
                    >
                      <Type className="h-3.5 w-3.5" />
                      {t('page.visualEditor')}
                    </button>
                  </div>
                </div>

                {useRichEditor ? (
                  <RichEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your content here..."
                    userId={user?.id}
                  />
                ) : (
                  <textarea
                    id="content"
                    name="content"
                    value={content}
                    onChange={event => setContent(event.target.value)}
                    placeholder="Write your content here. Markdown is supported..."
                    className="min-h-[20rem] w-full px-4 py-4 text-base leading-relaxed rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-dark-surface transition-all resize-y"
                  />
                )}
                {errors.content && <p className="text-sm text-accent">{errors.content}</p>}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-semibold text-text dark:text-dark-text">
                  {t('tags')}
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={tags}
                  onChange={event => setTags(event.target.value)}
                  placeholder="methodology, ethics, syria"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-dark-surface transition-all"
                />
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tagList.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Resources */}
              <ResourceLinker
                selectedResources={linkedResources}
                onChange={setLinkedResources}
                userId={user?.id}
              />

              {/* References / Citations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-text dark:text-dark-text">
                    References
                  </label>
                  <AddCitationDialog
                    citations={citations}
                    onCitationsChange={setCitations}
                  />
                </div>
                {citations.length > 0 && (
                  <div className="space-y-2 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
                    {citations.map((citation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-dark-surface rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {citation.type === 'internal' ? (
                            <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                          ) : (
                            <span className="w-4 h-4 text-secondary flex-shrink-0">🔗</span>
                          )}
                          <span className="truncate text-text dark:text-dark-text">
                            {citation.type === 'internal'
                              ? citation.target_post?.title
                              : citation.external_title || citation.external_doi || citation.external_url}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCitations(citations.filter((_, i) => i !== index))}
                          className="p-1 text-text-light hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-text-light dark:text-dark-text-muted">
                  Add references to SyriaHub posts or external sources (DOI, URL).
                </p>
              </div>

              {/* License */}
              <div className="space-y-2">
                <label htmlFor="license" className="text-sm font-semibold text-text dark:text-dark-text">
                  {t('license')}
                </label>
                <select
                  id="license"
                  value={license}
                  onChange={e => setLicense(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-dark-surface transition-all"
                >
                  <option value="CC-BY-4.0">CC BY 4.0 (Attribution)</option>
                  <option value="CC-BY-SA-4.0">CC BY-SA 4.0 (ShareAlike)</option>
                  <option value="CC0-1.0">CC0 1.0 (Public Domain)</option>
                  <option value="MIT">MIT License</option>
                  <option value="All Rights Reserved">All Rights Reserved</option>
                </select>
                <p className="text-xs text-text-light dark:text-dark-text-muted">
                  {t('page.licenseHelp')}
                </p>
              </div>

              {/* Temporal & Spatial Coverage - for Articles and Traces */}
              {(contentType === 'article' || contentType === 'trace') && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text dark:text-dark-text">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {t('page.researchCoverageOptional')}
                  </div>

                  {/* Temporal Coverage */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="temporalStart" className="flex items-center gap-1.5 text-xs font-medium text-text-light dark:text-dark-text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        {t('page.periodStart')}
                      </label>
                      <input
                        id="temporalStart"
                        type="date"
                        value={temporalCoverageStart}
                        onChange={e => setTemporalCoverageStart(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="temporalEnd" className="flex items-center gap-1.5 text-xs font-medium text-text-light dark:text-dark-text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        {t('page.periodEnd')}
                      </label>
                      <input
                        id="temporalEnd"
                        type="date"
                        value={temporalCoverageEnd}
                        onChange={e => setTemporalCoverageEnd(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Spatial Coverage - Map-based editor */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-text-light dark:text-dark-text-muted">
                      <MapPin className="w-3.5 h-3.5" />
                      {t('page.geographicRegion')}
                    </label>
                    <SpatialEditor
                      value={spatialCoverage}
                      geometry={spatialGeometry}
                      onChange={(placeName, geo) => {
                        setSpatialCoverage(placeName)
                        setSpatialGeometry(geo || null)
                      }}
                    />
                  </div>

                  <p className="text-xs text-text-light dark:text-dark-text-muted">
                    {t('page.coverageHelp')}
                  </p>
                </div>
              )}

              {/* 24-Hour Edit Window Notice */}
              {!postIdParam && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      {t('page.editWindowTitle')}
                    </p>
                    <p className="text-amber-700 dark:text-amber-400 opacity-90 mt-1">
                      {t('page.editWindowDescription')}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleDraft}
                  className="flex-1 sm:flex-none px-6 py-3 text-sm font-semibold rounded-xl border border-gray-200 dark:border-dark-border text-text dark:text-dark-text hover:border-primary hover:text-primary transition-all disabled:opacity-50"
                >
                  {t('saveDraft')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                >
                  <Save className="h-4 w-4" />
                  {saving ? t('page.publishing') : t('publish')}
                </button>
              </div>

              {/* Autosave Indicator */}
              {!postIdParam && (
                <div className="flex justify-end mt-2">
                  <AutosaveIndicator lastSaved={lastSaved} />
                </div>
              )}
            </form>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-secondary-dark" />
                </div>
                <h2 className="font-semibold text-text dark:text-dark-text">{t('page.writingTips')}</h2>
              </div>
              <ul className="space-y-3 text-sm text-text-light dark:text-dark-text-muted">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  {t('page.tip1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  {t('page.tip2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  {t('page.tip3')}
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
              <h2 className="font-semibold text-text dark:text-dark-text mb-3">{t('page.needInspiration')}</h2>
              <p className="text-sm text-text-light dark:text-dark-text-muted mb-4">
                {t('page.inspirationDesc')}
              </p>
              <Link
                href="/feed"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-primary text-primary hover:bg-primary/5 transition-all"
              >
                {t('page.browsePosts')}
              </Link>
            </div>


          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
