'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { SchemaFieldRenderer } from '@/components/editor/SchemaFieldRenderer'
import { SchemaFieldVersion } from '@/types'
import { FileText, Save, HelpCircle, BookOpen, Users, ArrowLeft, Sparkles, Type, Image as ImageIcon, Calendar, MapPin, Camera, Clock, AlertCircle, Table, Link2, Quote, BarChart3, Plus } from 'lucide-react'
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
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { ChartBlock, ChartConfig } from '@/components/ChartBlock'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { useTranslations } from 'next-intl'
import { FirstTimeContributorPrompt } from '@/components/FirstTimeContributorPrompt'
import { usePreferences } from '@/contexts/PreferencesContext'

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
  const typeParam = searchParams.get('type')
  const { showToast } = useToast()
  const t = useTranslations('Editor')
  const tCommon = useTranslations('Common')
  const { preferences } = usePreferences()

  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [citations, setCitations] = useState<Citation[]>([])
  // Initialize content type from URL parameter if valid
  const initialContentType = (typeParam === 'question' || typeParam === 'trace') ? typeParam : 'article'
  const [contentType, setContentType] = useState<'article' | 'question' | 'trace'>(initialContentType)
  const [license, setLicense] = useState('CC-BY-4.0')
  const [errors, setErrors] = useState<EditorErrors>({})
  const [group, setGroup] = useState<any>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [useRichEditor, setUseRichEditor] = useState(true)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [linkedResources, setLinkedResources] = useState<any[]>([])
  const [showFirstTimePrompt, setShowFirstTimePrompt] = useState(false)
  const [editorKey, setEditorKey] = useState(0) // Key to force RichEditor remount
  const [chartBlocks, setChartBlocks] = useState<ChartConfig[]>([])

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
    enabled: !postIdParam && preferences.editor.autosave, // Respect user autosave preference
    debounceMs: (preferences.editor.autosave_interval || 30) * 1000, // Use user's interval preference
  })

  // Epistemic Architecture fields
  const [temporalCoverageStart, setTemporalCoverageStart] = useState('')
  const [temporalCoverageEnd, setTemporalCoverageEnd] = useState('')
  const [spatialCoverage, setSpatialCoverage] = useState('')
  const [spatialGeometry, setSpatialGeometry] = useState<any>(null)

  // SCHEMA REGISTRY STATE
  const [schemaFields, setSchemaFields] = useState<SchemaFieldVersion[]>([])
  const [schemaValues, setSchemaValues] = useState<Record<string, any>>({})
  const [schemaErrors, setSchemaErrors] = useState<Record<string, string>>({})
  const [loadingSchema, setLoadingSchema] = useState(false)

  // ... existing code ...

  // Fetch schema fields when content type changes
  useEffect(() => {
    async function loadSchemaFields() {
      setLoadingSchema(true)
      // Use the RPC function we created in the migration
      const { data, error } = await supabase.rpc('get_fields_for_content_type', {
        p_content_type: contentType
      })

      if (error) {
        console.error('Error loading schema fields:', error)
      } else {
        setSchemaFields(data || [])
      }
      setLoadingSchema(false)
    }

    loadSchemaFields()
  }, [contentType, supabase])

  // Load existing schema values when editing
  useEffect(() => {
    async function loadSchemaValues() {
      if (!postIdParam) return

      const { data, error } = await supabase
        .from('schema_post_field_values')
        .select(`
                field_id,
                value,
                field_version:schema_field_versions!inner(field_type)
            `)
        .eq('post_id', postIdParam)
        .eq('is_current', true)

      if (error) {
        console.error('Error loading schema values:', error)
        return
      }

      if (data) {
        const values: Record<string, any> = {}
        data.forEach(item => {
          values[item.field_id] = item.value
        })
        setSchemaValues(values)
      }
    }

    if (!initializing) {
      loadSchemaValues()
    }
  }, [postIdParam, supabase, initializing])


  // Check for existing draft on mount
  useEffect(() => {
    if (hasDraft && draftData && !postIdParam && !title && !content) {
      setShowDraftBanner(true)
    }
  }, [hasDraft, draftData, postIdParam, title, content])

  // Check for first-time contributor
  useEffect(() => {
    if (!user || postIdParam) return // Only for new posts

    // Check sessionStorage first
    if (typeof window !== 'undefined') {
      const seen = sessionStorage.getItem('firstTimePromptSeen')
      if (seen === 'true') return
    }

    // Check if user has any published posts
    async function checkFirstTime() {
      if (!user?.id) return
      const { count } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .eq('status', 'published')

      if (count === 0) {
        setShowFirstTimePrompt(true)
      }
    }

    checkFirstTime()
  }, [user, postIdParam, supabase])

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
      // Force RichEditor to remount with new content
      setEditorKey(prev => prev + 1)
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
          router.push('/insights')
          return
        }

        if (data) {
          // Check 24h edit window
          const EDIT_WINDOW_HOURS = 24
          const createdAt = new Date(data.created_at)
          const editDeadline = new Date(createdAt.getTime() + EDIT_WINDOW_HOURS * 60 * 60 * 1000)
          const now = new Date()

          if (now > editDeadline) {
            console.error('[Editor] Edit window expired', { createdAt, editDeadline, now })
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

          // Load temporal/spatial coverage fields
          if (data.temporal_start) setTemporalCoverageStart(data.temporal_start)
          if (data.temporal_end) setTemporalCoverageEnd(data.temporal_end)
          if (data.spatial_coverage) setSpatialCoverage(data.spatial_coverage)
          if (data.spatial_geometry) setSpatialGeometry(data.spatial_geometry)

          // Load chart blocks from metadata
          if (data.metadata?.chartBlocks) {
            setChartBlocks(data.metadata.chartBlocks)
          }

          if (data.group_id) {
            const { data: groupData } = await supabase
              .from('groups')
              .select('id, name')
              .eq('id', data.group_id)
              .single()

            if (groupData) setGroup(groupData)
          }

          // Load linked resources for editing using the existing RPC function
          const { data: linkedResourcesData, error: resourceError } = await supabase
            .rpc('get_post_resources', { p_post_id: postIdParam })

          if (resourceError) {
            console.error('Error loading linked resources:', resourceError)
          } else if (linkedResourcesData && linkedResourcesData.length > 0) {
            setLinkedResources(linkedResourcesData)
          }

          // Load citations (references) for editing
          const { data: citationsData, error: citationsError } = await supabase
            .from('citations')
            .select(`
              id,
              type,
              target_post_id,
              quote_content,
              external_url,
              external_doi,
              external_title,
              external_author,
              external_year,
              external_source,
              target_post:posts!citations_target_post_id_fkey(
                id,
                title,
                created_at,
                author:users!posts_author_id_fkey(name, email)
              )
            `)
            .eq('source_post_id', postIdParam)

          if (citationsError) {
            console.error('Error loading citations:', citationsError)
          } else if (citationsData && citationsData.length > 0) {
            const loadedCitations: Citation[] = citationsData.map(cit => ({
              type: cit.type as 'internal' | 'external',
              target_post_id: cit.target_post_id || undefined,
              target_post: cit.target_post ? {
                id: (cit.target_post as any).id,
                title: (cit.target_post as any).title,
                created_at: (cit.target_post as any).created_at,
                author: (cit.target_post as any).author
              } : undefined,
              quote_content: cit.quote_content || undefined,
              external_url: cit.external_url || undefined,
              external_doi: cit.external_doi || undefined,
              external_title: cit.external_title || undefined,
              external_author: cit.external_author || undefined,
              external_year: cit.external_year || undefined,
              external_source: cit.external_source || undefined,
            }))
            setCitations(loadedCitations)
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

  // Test Mode Bypass Effect
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('syriahub_test_auth_bypass') === 'true') {
      const hasBypass = window.localStorage.getItem('syriahub_test_auth_bypass') === 'true';
      if (hasBypass) {
        console.log('[Editor] Test Mode Auth Bypass Active (useEffect)')
        setUser({
          id: '00000000-0000-0000-0000-000000000000',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'test@example.com',
          app_metadata: { provider: 'email' },
          user_metadata: { name: 'Test User' },
          // user_metadata: { ... }
          created_at: new Date().toISOString(),
        } as User)
        if (!postIdParam) {
          setInitializing(false)
        }
      }
    }
  }, [postIdParam, setUser, setInitializing])

  useEffect(() => {
    let mounted = true

    async function hydrateUser() {
      // If bypass is active, useEffect will handle it.
      // We can add a small check here too just in case hydrate call beats useEffect.
      if (typeof window !== 'undefined' && window.localStorage.getItem('syriahub_test_auth_bypass') === 'true') {
        return;
      }

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

  const tLicenses = useTranslations('Licenses')

  const validate = useCallback((): boolean => {
    const nextErrors: EditorErrors = {}
    if (!title.trim()) nextErrors.title = 'Give your post a descriptive title.'
    if (!content.trim()) nextErrors.content = 'Add some content before publishing.'
    setErrors(nextErrors)

    // Validate required schema fields
    const nextSchemaErrors: Record<string, string> = {}
    schemaFields.forEach(field => {
      if (field.is_required) {
        const value = schemaValues[field.field_id]
        const isEmpty = value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
        if (isEmpty) {
          nextSchemaErrors[field.field_id] = `${field.display_name} is required`
        }
      }
    })
    setSchemaErrors(nextSchemaErrors)

    return Object.keys(nextErrors).length === 0 && Object.keys(nextSchemaErrors).length === 0
  }, [content, title, schemaFields, schemaValues])

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
          status: publish ? 'queued' : 'draft',
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

        // Include chart blocks in metadata if any exist
        if (chartBlocks.length > 0) {
          postData.metadata = {
            ...(postData.metadata as Record<string, unknown> || {}),
            chartBlocks: chartBlocks.filter(c => c.resourceId) // Only save configured charts
          }
        }

        console.log('Saving post with data:', postData)

        let result;
        if (postIdParam) {
          result = await supabase.from('posts').update(postData).eq('id', postIdParam).select('id').single()
        } else {
          result = await supabase.from('posts').insert(postData).select('id').single()
        }

        const { data, error } = result
        if (error) {
          console.error('Supabase error:', JSON.stringify(error, null, 2))
          console.error('Error properties:', Object.keys(error))
          throw new Error(error.message || error.code || 'Unknown database error')
        }

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

        // Save Schema Field Values
        // First invalidate existing values if editing (always do this, even if clearing all values)
        if (postIdParam) {
          await supabase
            .from('schema_post_field_values')
            .update({ is_current: false })
            .eq('post_id', data.id)
        }

        if (Object.keys(schemaValues).length > 0) {
          // Prepare new values
          const fieldValues = Object.entries(schemaValues).map(([fieldId, value]) => {
            // Find the current version for this field
            const field = schemaFields.find(f => f.field_id === fieldId)
            if (!field || !field.id) return null

            return {
              post_id: data.id,
              field_id: fieldId,
              field_version_id: field.id,
              value: value
            }
          }).filter(Boolean)

          if (fieldValues.length > 0) {
            const { error: schemaError } = await supabase
              .from('schema_post_field_values')
              .insert(fieldValues)

            if (schemaError) {
              console.error('Error saving schema values:', schemaError)
              // We don't block the post save, but we log it
            }
          }
        }

        showToast(publish ? 'Post published successfully!' : 'Draft saved successfully.', 'success')

        // Clear localStorage draft after successful publish
        if (publish && !postIdParam) {
          clearDraft()
        }

        await new Promise(resolve => setTimeout(resolve, 1500))
        // Drafts go to the post view page (so user can continue editing), published posts to group or post page
        router.push(group ? `/groups/${group.id}` : `/post/${data.id}`)
      } catch (error: any) {
        // Log detailed error for debugging
        console.error('Failed to store post', error)
        console.error('Error details:', {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
        })

        // Show user-friendly error with more details if available
        const errorMessage = error?.message || error?.code
          ? `Unable to save: ${error.message || error.code}${error.hint ? ` (${error.hint})` : ''}`
          : 'Unable to save your post right now. Please try again.'
        showToast(errorMessage, 'error')
      } finally {
        setSaving(false)
      }
    },
    [content, router, showToast, supabase, tags, title, user, validate, contentType, group, postIdParam, citations, license, coverImage, linkedResources, clearDraft, temporalCoverageStart, temporalCoverageEnd, spatialCoverage, spatialGeometry, chartBlocks, schemaFields, schemaValues]
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
            href="/insights"
            className="inline-flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-primary-light transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('page.backToInsights')}
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
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          {/* Main Content Column - Stacked Cards */}
          <div className="space-y-6">
            {/* Essential Fields Card */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6 md:p-8">
              {/* Draft Recovery Banner */}
              {showDraftBanner && draftData && (
                <DraftRecoveryBanner
                  draftData={draftData}
                  onRestore={handleRestoreDraft}
                  onDiscard={handleDiscardDraft}
                />
              )}

              {/* First-Time Contributor Prompt */}
              {showFirstTimePrompt && !postIdParam && (
                <FirstTimeContributorPrompt
                  onDismiss={() => {
                    setShowFirstTimePrompt(false)
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('firstTimePromptSeen', 'true')
                    }
                  }}
                />
              )}

              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

                {/* DYNAMIC SCHEMA FIELDS */}
                {/* We render them at the top or below content? Requirement says "fields based on content type". 
                    Let's put them below title but above content for better visibility, or maybe after content?
                    Usually schema properties like "Research Domain" are meta-data, so maybe after Title or in a sidebar?
                    The mockup implied they are part of the form. Let's put them after Content Type toggle.
                */}
                {schemaFields.length > 0 && (
                  <SchemaFieldRenderer
                    fields={schemaFields}
                    values={schemaValues}
                    onChange={(fieldId, val) => setSchemaValues(prev => ({ ...prev, [fieldId]: val }))}
                    errors={schemaErrors}
                  />
                )}

                {/* Content Type Toggle */}
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-gray-100 dark:bg-dark-bg rounded-xl">
                    <button
                      type="button"
                      onClick={() => setContentType('article')}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${contentType === 'article'
                        ? 'bg-white dark:bg-dark-surface text-primary dark:text-white/80 shadow-sm'
                        : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                        }`}
                      title={t('page.contentTypeHelp.article')}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('page.article')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentType('question')}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${contentType === 'question'
                        ? 'bg-white dark:bg-dark-surface text-primary dark:text-white/80 shadow-sm'
                        : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                        }`}
                      title={t('page.contentTypeHelp.question')}
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('page.question')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentType('trace')}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${contentType === 'trace'
                        ? 'bg-white dark:bg-dark-surface text-secondary-dark dark:text-white/80 shadow-sm'
                        : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                        }`}
                      title={t('page.contentTypeHelp.trace')}
                    >
                      <Camera className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('page.trace')}</span>
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
                      key={editorKey}
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
                          className="px-3 py-1.5 text-xs font-semibold bg-white/50 dark:bg-white/10 text-text/50 dark:text-white/70 rounded-lg border border-gray-200/50 dark:border-white/10 backdrop-blur-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* License */}
                <div className="space-y-2">
                  <label htmlFor="license" className="text-sm font-semibold text-text dark:text-dark-text">
                    {t('license')}
                  </label>
                  <Select
                    value={license}
                    onValueChange={setLicense}
                  >
                    <SelectTrigger id="license" className="w-full bg-white dark:bg-dark-surface">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC-BY-4.0">{tLicenses('CC-BY-4_0')}</SelectItem>
                      <SelectItem value="CC-BY-SA-4.0">{tLicenses('CC-BY-SA-4_0')}</SelectItem>
                      <SelectItem value="CC0-1.0">{tLicenses('CC0-1_0')}</SelectItem>
                      <SelectItem value="MIT">{tLicenses('MIT')}</SelectItem>
                      <SelectItem value="All Rights Reserved">{tLicenses('All Rights Reserved')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-s leading-relaxed text-text-light dark:text-gray-100 space-y-0.5">
                    <p className="text-s">{tLicenses('helpText')}</p>
                    <p className="mt-1.5 text-s">
                      <span className="font-semibold text-text dark:text-gray-200">
                        {tLicenses(license.replace(/\./g, '_'))}:
                      </span>{' '}
                      <span className={cn(
                        license === 'All Rights Reserved' ? "text-amber-600 dark:text-amber-200" : "text-emerald-600 dark:text-emerald-400/80"
                      )}>
                        {tLicenses(`descriptions.${license.replace(/\./g, '_')}`)}
                      </span>
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Optional Section: References & Resources - Separate Card */}
            <CollapsibleSection
              title={t('page.sections.referencesResources')}
              icon={Link2}
              description={t('page.sections.referencesResourcesDesc')}
              defaultOpen={linkedResources.length > 0 || citations.length > 0}
              badge={linkedResources.length + citations.length > 0 ? `${linkedResources.length + citations.length}` : undefined}
              className="bg-white dark:bg-dark-surface"
            >
              <div className="space-y-6">
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
                      {t('page.references')}
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
                    {t('page.referencesHelp')}
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Optional Section: Data Visualizations - Uses Linked Resources */}
            {linkedResources.length > 0 && (
              <CollapsibleSection
                title={t('page.sections.dataVisualizations') || 'Data Visualizations'}
                icon={BarChart3}
                description={t('page.sections.dataVisualizationsDesc') || 'Create interactive charts from your linked datasets'}
                defaultOpen={chartBlocks.length > 0}
                badge={chartBlocks.length > 0 ? `${chartBlocks.length}` : undefined}
                className="bg-white dark:bg-dark-surface"
              >
                <div className="space-y-4">
                  {chartBlocks.map((chart, index) => (
                    <ChartBlock
                      key={`chart-${index}`}
                      config={chart}
                      linkedResources={linkedResources}
                      onChange={(updatedConfig) => {
                        const newCharts = [...chartBlocks]
                        newCharts[index] = updatedConfig
                        setChartBlocks(newCharts)
                      }}
                      onRemove={() => {
                        setChartBlocks(chartBlocks.filter((_, i) => i !== index))
                      }}
                      isEditing={true}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() => setChartBlocks([...chartBlocks, {
                      resourceId: '',
                      resourceTitle: '',
                      chartType: 'bar',
                      showLegend: true
                    }])}
                    className="w-full py-3 px-4 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl text-text-light dark:text-dark-text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('page.addChart') || 'Add Chart Visualization'}
                  </button>

                  <p className="text-xs text-text-light dark:text-dark-text-muted">
                    {t('page.chartHelp') || 'Charts will be displayed in your published post. Link dataset resources above to enable visualizations.'}
                  </p>
                </div>
              </CollapsibleSection>
            )}

            {/* Optional Section: Research Coverage - Separate Card (for Articles and Traces) */}
            {(contentType === 'article' || contentType === 'trace') && (
              <CollapsibleSection
                title={t('page.sections.researchCoverage')}
                icon={MapPin}
                description={t('page.sections.researchCoverageDesc')}
                defaultOpen={!!(temporalCoverageStart || temporalCoverageEnd || spatialCoverage)}
                badge={t('page.optional')}
                className="bg-white dark:bg-dark-surface"
              >
                <div className="space-y-4">
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
              </CollapsibleSection>
            )}

            {/* 24-Hour Edit Window Notice & Action Buttons */}
            <div className="space-y-4">
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
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleDraft}
                  className="flex-1 sm:flex-none px-6 py-3 text-sm font-semibold rounded-xl border border-gray-200 dark:border-dark-border text-text dark:text-dark-text hover:border-primary hover:text-primary transition-all disabled:opacity-50"
                >
                  {t('saveDraft')}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => persistPost(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                >
                  <Save className="h-4 w-4" />
                  {saving ? t('page.publishing') : t('publish')}
                </button>
              </div>

              {/* Autosave Indicator */}
              {!postIdParam && (
                <div className="flex justify-end">
                  <AutosaveIndicator lastSaved={lastSaved} />
                </div>
              )}
            </div>

            {/* End of Main Content Column */}
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
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-primary dark:border-secondary text-primary dark:text-secondary hover:bg-primary/5 dark:hover:bg-secondary/5 transition-all"
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
