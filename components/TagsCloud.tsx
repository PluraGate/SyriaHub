'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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
          <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-dark-border rounded-full animate-pulse" />
        ))}
      </div>
    )
  }

  const getTagSize = (count: number, maxCount: number) => {
    const ratio = count / maxCount
    if (ratio > 0.7) return 'text-xl'
    if (ratio > 0.4) return 'text-lg'
    return 'text-base'
  }

  const maxCount = tags.length > 0 ? Math.max(...tags.map((t) => t.count)) : 1

  return (
    <div className="flex flex-wrap gap-3 justify-center items-center">
      {tags.map(({ tag, count }) => (
        <Link
          key={tag}
          href={`/explore?tag=${encodeURIComponent(tag)}`}
          className={`px-4 py-2 bg-gray-100 dark:bg-dark-border hover:bg-primary hover:text-white dark:hover:bg-accent-light text-text dark:text-dark-text rounded-full transition-all hover:scale-110 ${getTagSize(
            count,
            maxCount
          )}`}
        >
          {tag}
          <span className="ml-2 text-xs opacity-70">({count})</span>
        </Link>
      ))}
    </div>
  )
}
