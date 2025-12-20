'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TopicNode {
    id: string
    label: string
    count: number
    x: number
    y: number
    radius: number
    color: string
    connections: string[]
}

interface TopicClusterData {
    nodes: TopicNode[]
    maxCount: number
}

const COLORS = [
    '#475569', '#1a3a3d', '#57534e', '#4d7c6f', '#6b5454',
    '#4f5d75', '#3f3f46', '#6b5742', '#374151', '#44403c',
]

function generateTopicLayout(tags: { tag: string; count: number; relatedTags: string[] }[]): TopicClusterData {
    const maxCount = Math.max(...tags.map(t => t.count), 1)
    const centerX = 250
    const centerY = 200
    const baseRadius = 150

    const nodes: TopicNode[] = tags.map((tag, index) => {
        const angle = (index / tags.length) * 2 * Math.PI - Math.PI / 2
        const distanceFromCenter = baseRadius - (tag.count / maxCount) * 50
        const x = centerX + Math.cos(angle) * distanceFromCenter
        const y = centerY + Math.sin(angle) * distanceFromCenter
        const radius = 20 + (tag.count / maxCount) * 30

        return {
            id: tag.tag,
            label: tag.tag,
            count: tag.count,
            x,
            y,
            radius,
            color: COLORS[index % COLORS.length],
            connections: tag.relatedTags,
        }
    })

    return { nodes, maxCount }
}

function TopicNode({
    node,
    isHovered,
    onHover
}: {
    node: TopicNode
    isHovered: boolean
    onHover: (id: string | null) => void
}) {
    return (
        <Link
            href={`/explore?tag=${encodeURIComponent(node.label)}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{
                left: node.x,
                top: node.y,
                zIndex: isHovered ? 10 : 1,
            }}
            onMouseEnter={() => onHover(node.id)}
            onMouseLeave={() => onHover(null)}
        >
            <div
                className={`
          rounded-full flex items-center justify-center
          transition-all duration-300 cursor-pointer
          shadow-lg hover:shadow-xl
          ${isHovered ? 'scale-125' : 'scale-100'}
        `}
                style={{
                    width: node.radius * 2,
                    height: node.radius * 2,
                    backgroundColor: node.color,
                    opacity: isHovered ? 1 : 0.85,
                }}
            >
                <div className="text-center text-white p-1">
                    <span className={`font-medium ${node.radius > 30 ? 'text-sm' : 'text-xs'} leading-tight block`}>
                        {node.label.length > 12 ? node.label.substring(0, 10) + '...' : node.label}
                    </span>
                    {node.radius > 25 && (
                        <span className="text-xs opacity-80">{node.count}</span>
                    )}
                </div>
            </div>

            {/* Tooltip */}
            {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-12 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-20 shadow-xl">
                    <strong>{node.label}</strong>
                    <span className="opacity-70 ml-2">{node.count} posts</span>
                </div>
            )}
        </Link>
    )
}

function ConnectionLines({
    nodes,
    hoveredNode
}: {
    nodes: TopicNode[]
    hoveredNode: string | null
}) {
    const nodeMap = new Map(nodes.map(n => [n.id, n]))

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodes.flatMap((node) =>
                node.connections
                    .filter((connId) => nodeMap.has(connId))
                    .map((connId) => {
                        const target = nodeMap.get(connId)!
                        const isHighlighted = hoveredNode === node.id || hoveredNode === connId

                        return (
                            <line
                                key={`${node.id}-${connId}`}
                                x1={node.x}
                                y1={node.y}
                                x2={target.x}
                                y2={target.y}
                                stroke={isHighlighted ? '#3B82F6' : '#94A3B8'}
                                strokeWidth={isHighlighted ? 2 : 1}
                                strokeOpacity={isHighlighted ? 0.8 : 0.2}
                                strokeDasharray={isHighlighted ? 'none' : '4 4'}
                                className="transition-all duration-300"
                            />
                        )
                    })
            )}
        </svg>
    )
}

export function TopicClusters() {
    const t = useTranslations('Topics')
    const tActions = useTranslations('Actions')
    const [data, setData] = useState<TopicClusterData | null>(null)
    const [loading, setLoading] = useState(true)
    const [hoveredNode, setHoveredNode] = useState<string | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [zoom, setZoom] = useState(1)
    const containerRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const { data: posts } = await supabase
                .from('posts')
                .select('tags')
                .eq('status', 'published')

            if (posts) {
                // Count tags and find co-occurring tags
                const tagMap: Record<string, { count: number; coTags: Set<string> }> = {}

                posts.forEach((post) => {
                    if (post.tags && post.tags.length > 0) {
                        post.tags.forEach((tag: string) => {
                            if (!tagMap[tag]) {
                                tagMap[tag] = { count: 0, coTags: new Set() }
                            }
                            tagMap[tag].count++

                            // Track co-occurring tags
                            post.tags.forEach((otherTag: string) => {
                                if (otherTag !== tag) {
                                    tagMap[tag].coTags.add(otherTag)
                                }
                            })
                        })
                    }
                })

                // Get top tags
                const topTags = Object.entries(tagMap)
                    .map(([tag, data]) => ({
                        tag,
                        count: data.count,
                        relatedTags: Array.from(data.coTags).slice(0, 3),
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 12)

                setData(generateTopicLayout(topTags))
            }
        } catch (error) {
            console.error('Error loading topics:', error)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2))
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5))
    const handleReset = () => {
        setZoom(1)
        loadData()
    }

    if (loading) {
        return (
            <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                </div>
                <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
        )
    }

    if (!data || data.nodes.length === 0) {
        return (
            <div className="card p-6 text-center text-text-light dark:text-dark-text-muted">
                <p>{t('noTopics')}</p>
            </div>
        )
    }

    return (
        <div
            className={`card overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
            ref={containerRef}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-border">
                <h3 className="font-semibold text-text dark:text-dark-text">{t('topicMap')}</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomOut}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors btn-press"
                        aria-label={tActions('zoomOut')}
                    >
                        <ZoomOut className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                    </button>
                    <span className="text-xs text-text-light dark:text-dark-text-muted min-w-[3rem] text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors btn-press"
                        aria-label={tActions('zoomIn')}
                    >
                        <ZoomIn className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 dark:bg-dark-border mx-1" />
                    <button
                        onClick={handleReset}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors btn-press"
                        aria-label="Reset"
                    >
                        <RefreshCw className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                    </button>
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors btn-press"
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        ) : (
                            <Maximize2 className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        )}
                    </button>
                </div>
            </div>

            {/* Visualization */}
            <div
                className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface overflow-hidden"
                style={{ height: isFullscreen ? 'calc(100% - 57px)' : '400px' }}
            >
                <div
                    className="absolute inset-0 transition-transform duration-300"
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center center',
                    }}
                >
                    <ConnectionLines nodes={data.nodes} hoveredNode={hoveredNode} />

                    {data.nodes.map((node) => (
                        <TopicNode
                            key={node.id}
                            node={node}
                            isHovered={hoveredNode === node.id}
                            onHover={setHoveredNode}
                        />
                    ))}
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 text-xs text-text-light dark:text-dark-text-muted bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm p-2 rounded">
                    <p className="opacity-70">{t('largerMorePosts')}</p>
                </div>
            </div>
        </div>
    )
}

/**
 * Compact mini-map version
 */
export function TopicClustersMini() {
    const [tags, setTags] = useState<{ tag: string; count: number; color: string }[]>([])
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

                    const topTags = Object.entries(tagMap)
                        .map(([tag, count], index) => ({
                            tag,
                            count,
                            color: COLORS[index % COLORS.length],
                        }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 8)

                    setTags(topTags)
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
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="w-16 h-16 rounded-full" />
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {tags.map((tag) => (
                <Link
                    key={tag.tag}
                    href={`/explore?tag=${encodeURIComponent(tag.tag)}`}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-md hover:shadow-lg transition-all hover:scale-110"
                    style={{ backgroundColor: tag.color }}
                    title={`${tag.tag} (${tag.count} posts)`}
                >
                    {tag.tag.substring(0, 3)}
                </Link>
            ))}
        </div>
    )
}
