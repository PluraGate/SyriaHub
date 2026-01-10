'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, Filter, X } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { TagsCloud } from '@/components/TagsCloud'
import { BentoGrid, BentoGridItem } from '@/components/BentoGrid'
import { MagazineCard } from '@/components/MagazineCard'
import { FeaturedPost } from '@/components/FeaturedPost'
import { TrendingPosts } from '@/components/TrendingPosts'
import { ActivityInsightsCompact } from '@/components/ActivityInsights'
import { RelatedAuthors } from '@/components/RelatedAuthors'
import { SuggestedPostsCarousel } from '@/components/SuggestedPosts'
import { LatestResourcesSidebar } from '@/components/LatestResourcesSidebar'

interface Post {
  id: string
  title: string
  slug: string
  content?: string
  excerpt?: string
  created_at: string
  tags?: string[]
  cover_image?: string
  content_type?: string
  author?: {
    id: string
    name?: string
    email?: string
    avatar_url?: string
  }
  [key: string]: any
}

interface HomeContentFilterProps {
  featuredPosts: Post[]
  recentPosts: Post[]
  userId: string
  latestResources: Post[]
}

export function HomeContentFilter({ featuredPosts, recentPosts, userId, latestResources }: HomeContentFilterProps) {
  const t = useTranslations('Landing')
  const tForms = useTranslations('Forms')
  const tResources = useTranslations('Resources')
  const locale = useLocale()
  const [filterQuery, setFilterQuery] = useState('')

  // Normalize text for better Arabic/multilingual search
  // Removes diacritics and normalizes Unicode for consistent matching
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (Latin)
      .replace(/[\u064B-\u0652]/g, '') // Remove Arabic diacritics (tashkeel)
      .replace(/[أإآا]/g, 'ا') // Normalize Alef variations
      .replace(/[ىئ]/g, 'ي') // Normalize Ya variations
      .replace(/ة/g, 'ه') // Normalize Ta Marbuta
  }

  // Filter posts based on query (searches title, content, excerpt, tags, and author name)
  const filterPosts = useCallback((posts: Post[]) => {
    if (!filterQuery.trim()) return posts

    const query = normalizeText(filterQuery)
    return posts.filter(post => {
      const title = normalizeText(post.title || '')
      const content = normalizeText(post.content || '')
      const excerpt = normalizeText(post.excerpt || '')
      const tags = normalizeText(post.tags?.join(' ') || '')
      const authorName = normalizeText(post.author?.name || '')

      return (
        title.includes(query) ||
        content.includes(query) ||
        excerpt.includes(query) ||
        tags.includes(query) ||
        authorName.includes(query)
      )
    })
  }, [filterQuery])

  const filteredFeatured = useMemo(() => filterPosts(featuredPosts), [filterPosts, featuredPosts])
  const filteredRecent = useMemo(() => filterPosts(recentPosts), [filterPosts, recentPosts])
  // Resources in sidebar are not filtered to match other sidebar items behavior

  const hasResults = filteredFeatured.length > 0 || filteredRecent.length > 0
  const isFiltering = filterQuery.trim().length > 0

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-12 flex justify-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-4 rtl:pr-4 flex items-center pointer-events-none">
            <Filter className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
          </div>
          <input
            type="text"
            dir="auto"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={tForms('filterPlaceholder')}
            className="w-full ltr:pl-12 rtl:pr-12 ltr:pr-10 rtl:pl-10 py-3 text-sm rounded-full border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-light dark:placeholder:text-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all ltr:text-left rtl:text-right"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-4 rtl:pl-4 flex items-center text-text-light hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tags Cloud */}
      <div className="mb-16">
        <h2 className="text-2xl font-display font-semibold text-center mb-8 text-primary dark:text-dark-text">
          {t('popularTopics')}
        </h2>
        <TagsCloud />
      </div>

      {/* No Results Message */}
      {isFiltering && !hasResults && (
        <div className="text-center py-16">
          <p className="text-lg text-text-light dark:text-dark-text-muted mb-2">
            {t('noFilterResults')}
          </p>
          <button
            onClick={() => setFilterQuery('')}
            className="text-primary hover:text-primary-dark font-medium"
          >
            {t('clearFilter')}
          </button>
        </div>
      )}



      {/* Featured Posts - Bento Grid */}
      {filteredFeatured.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold text-text dark:text-dark-text">
              {t('featured')}
              {isFiltering && (
                <span className="ltr:ml-2 rtl:mr-2 text-sm font-normal text-text-light dark:text-dark-text-muted">
                  ({filteredFeatured.length})
                </span>
              )}
            </h2>
            <Link
              href="/insights"
              className="text-primary dark:text-secondary hover:text-primary-dark dark:hover:text-secondary-light font-medium flex items-center gap-2 transition-colors"
            >
              {t('viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <BentoGrid columns={4} gap="md">
            {/* Large featured post */}
            {filteredFeatured[0] && (
              <BentoGridItem size="2x2">
                <FeaturedPost post={filteredFeatured[0]} size="large" showTrending />
              </BentoGridItem>
            )}

            {/* Medium posts */}
            {filteredFeatured[1] && (
              <BentoGridItem size="1x1">
                <FeaturedPost post={filteredFeatured[1]} size="small" accentColor="accent" />
              </BentoGridItem>
            )}
            {filteredFeatured[2] && (
              <BentoGridItem size="1x1">
                <FeaturedPost post={filteredFeatured[2]} size="small" accentColor="secondary" />
              </BentoGridItem>
            )}

            {/* Horizontal card */}
            {filteredFeatured[3] && (
              <BentoGridItem size="2x1">
                <MagazineCard post={filteredFeatured[3]} variant="horizontal" className="h-full" />
              </BentoGridItem>
            )}
          </BentoGrid>
        </div>
      )}

      {/* Two-column layout: Recent posts + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column - Recent Posts as Magazine Cards */}
        <div className="lg:col-span-2 space-y-12">
          {filteredRecent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-semibold text-text dark:text-dark-text">
                  {t('recentResearch')}
                  {isFiltering && (
                    <span className="ltr:ml-2 rtl:mr-2 text-sm font-normal text-text-light dark:text-dark-text-muted">
                      ({filteredRecent.length})
                    </span>
                  )}
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {filteredRecent.map((post: any) => (
                  <MagazineCard key={post.id} post={post} variant="standard" />
                ))}
              </div>
            </div>
          )}

          {filteredRecent.length === 0 && filteredFeatured.length === 0 && !isFiltering && (
            <div className="text-center py-16 text-text-light dark:text-dark-text-muted">
              <p className="text-lg mb-4">{t('noPosts')}</p>
              <Link href="/editor" className="btn btn-primary">
                {t('createPost')}
              </Link>
            </div>
          )}

          {/* Suggested Posts Carousel */}
          {!isFiltering && <SuggestedPostsCarousel limit={4} />}
        </div>

        {/* Sidebar Column - "Context Stack" */}
        <div className="space-y-6">
          {/* Section Header */}
          <h3 className="text-sm font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wide">
            {t('context')}
          </h3>

          {/* Active Discussions */}
          <div>
            <TrendingPosts />
          </div>

          {/* Recent Activity */}
          <div>
            <ActivityInsightsCompact limit={5} />
          </div>

          {/* Latest Resources */}
          {latestResources.length > 0 && (
            <div className="card p-4">
              <LatestResourcesSidebar resources={latestResources} locale={locale} />
            </div>
          )}

          {/* Related Researchers */}
          <div className="card p-4">
            <RelatedAuthors currentUserId={userId} limit={4} />
          </div>
        </div>
      </div>
    </>
  )
}
