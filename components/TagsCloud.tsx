'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { TrendingUp, Flame } from 'lucide-react'

interface VerifiedTag {
  label: string
  label_ar: string | null
  color: string | null
  post_count: number
}

interface TagCount {
  tag: string
  count: number
}

export function TagsCloud() {
  const [tags, setTags] = useState<VerifiedTag[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const locale = useLocale()

  useEffect(() => {
    const loadTags = async () => {
      try {
        // First try to fetch verified tags from tags table
        const { data: verifiedTags, error: tagsError } = await supabase
          .from('tags')
          .select('label, label_ar, color')

        // Get post counts for tags
        const { data: posts } = await supabase
          .from('posts')
          .select('tags')

        const tagCountMap: Record<string, number> = {}
        posts?.forEach((post) => {
          if (post.tags) {
            post.tags.forEach((tag: string) => {
              tagCountMap[tag] = (tagCountMap[tag] || 0) + 1
            })
          }
        })

        // If verified tags exist and no error, use them with colors
        if (!tagsError && verifiedTags && verifiedTags.length > 0) {
          const tagsWithCounts = verifiedTags
            .map(tag => ({
              label: tag.label,
              label_ar: tag.label_ar || null,
              color: tag.color || null,
              post_count: tagCountMap[tag.label] || 0
            }))
            .filter(tag => tag.post_count > 0)
            .sort((a, b) => b.post_count - a.post_count)
            .slice(0, 20)

          setTags(tagsWithCounts)
        } else {
          // Fallback: use tags from posts directly (for backward compatibility)
          const fallbackTags = Object.entries(tagCountMap)
            .map(([label, count]) => ({
              label,
              label_ar: null,
              color: null,
              post_count: count
            }))
            .sort((a, b) => b.post_count - a.post_count)
            .slice(0, 20)

          setTags(fallbackTags)
        }
      } catch (error) {
        console.error('Error loading tags:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-8 w-20 skeleton rounded-full" />
        ))}
      </div>
    )
  }

  // Function to determine if color is light or dark for text contrast
  const isLightColor = (hex: string) => {
    const c = hex.substring(1)
    const rgb = parseInt(c, 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luma > 128
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center items-center">
      {tags.map((tag) => {
        const displayLabel = (locale === 'ar' && tag.label_ar) ? tag.label_ar : tag.label
        const bgColor = tag.color || '#1A3D40'

        return (
          <Link
            key={tag.label}
            href={`/explore?tag=${encodeURIComponent(tag.label)}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md border border-white/10 text-white dark:text-dark-text"
            style={{
              backgroundColor: `${bgColor}40`, // 25% opacity
            }}
          >
            <span>{displayLabel}</span>
            <span className="text-xs opacity-60">
              {tag.post_count}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

/**
 * Compact trending tags list for sidebar
 */
export function TrendingTagsList({ limit = 5 }: { limit?: number }) {
  const [tags, setTags] = useState<TagCount[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadTags = async () => {
      try {
        const { data: posts } = await supabase
          .from('posts')
          .select('tags')

        if (posts) {
          const tagMap: Record<string, number> = {}
          posts.forEach((post) => {
            if (post.tags) {
              post.tags.forEach((tag: string) => {
                tagMap[tag] = (tagMap[tag] || 0) + 1
              })
            }
          })

          const sortedTags = Object.entries(tagMap)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)

          setTags(sortedTags)
        }
      } catch (error) {
        console.error('Error loading trending tags:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [supabase, limit])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tags.map(({ tag, count }, index) => (
        <Link
          key={tag}
          href={`/explore?tag=${encodeURIComponent(tag)}`}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className={`
              w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
              ${index === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
              ${index === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : ''}
              ${index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
              ${index > 2 ? 'bg-gray-50 text-gray-500 dark:bg-dark-border dark:text-dark-text-muted' : ''}
            `}>
              {index + 1}
            </span>
            <span className="text-sm font-medium text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-accent-light transition-colors">
              #{tag}
            </span>
          </div>
          <span className="text-xs text-text-light dark:text-dark-text-muted">
            {count} post{count !== 1 ? 's' : ''}
          </span>
        </Link>
      ))}
    </div>
  )
}
