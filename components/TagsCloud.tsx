'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { TrendingUp, Flame } from 'lucide-react'

interface TagCount {
  tag: string
  count: number
}

export function TagsCloud() {
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
            .slice(0, 20)

          setTags(sortedTags)
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

  const getTagSize = (count: number, maxCount: number) => {
    const ratio = count / maxCount
    if (ratio > 0.7) return 'text-base font-medium'
    if (ratio > 0.4) return 'text-sm font-medium'
    return 'text-sm'
  }

  const maxCount = tags.length > 0 ? Math.max(...tags.map((t) => t.count)) : 1

  return (
    <div className="flex flex-wrap gap-2 justify-center items-center">
      {tags.map(({ tag, count }) => (
        <Link
          key={tag}
          href={`/explore?tag=${encodeURIComponent(tag)}`}
          className={`
            px-3 py-1.5 
            bg-gray-50 dark:bg-dark-surface 
            border border-gray-200 dark:border-dark-border
            hover:border-primary dark:hover:border-accent-light
            hover:bg-white dark:hover:bg-dark-surface
            text-text-light dark:text-dark-text-muted 
            hover:text-primary dark:hover:text-accent-light
            rounded-full 
            transition-all duration-200
            ${getTagSize(count, maxCount)}
          `}
        >
          {tag}
          <span className="ml-1.5 text-xs opacity-50">
            {count}
          </span>
        </Link>
      ))}
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
