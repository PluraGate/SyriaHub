'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import { Loader2, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>
})

interface KnowledgeGraphProps {
    centerPostId: string
}

interface GraphNode {
    id: string
    title: string
    group: string
    val: number
    tag: string
    x?: number
    y?: number
}

interface GraphLink {
    source: string | GraphNode
    target: string | GraphNode
    type: string
}

export function KnowledgeGraph({ centerPostId }: KnowledgeGraphProps) {
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] })
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [tagColors, setTagColors] = useState<Record<string, string>>({})
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
    const [hoverNode, setHoverNode] = useState<any>(null)

    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<any>(null)
    const supabase = useMemo(() => createClient(), [])
    const { theme } = useTheme()

    const fetchTagColors = useCallback(async () => {
        const { data } = await supabase.from('tags').select('label, color')
        if (data) {
            const colors: Record<string, string> = {}
            data.forEach((tag: any) => {
                colors[tag.label] = tag.color
            })
            setTagColors(colors)
        }
    }, [supabase])

    const fetchGraphData = useCallback(async () => {
        try {
            // 1. Fetch the center post
            const { data: centerPost } = await supabase
                .from('posts')
                .select('id, title, forked_from_id, tags')
                .eq('id', centerPostId)
                .single()

            if (!centerPost) return

            const nodes = new Map()
            const links: GraphLink[] = []
            const currentTags = new Set<string>()

            const addNode = (post: any, group: string, val: number) => {
                const primaryTag = post.tags && post.tags.length > 0 ? post.tags[0] : 'Uncategorized'
                currentTags.add(primaryTag)
                nodes.set(post.id, {
                    id: post.id,
                    title: post.title,
                    group,
                    val,
                    tag: primaryTag
                })
            }

            // Add center node
            addNode(centerPost, 'center', 20)

            // 2. Fetch parent (if exists)
            if (centerPost.forked_from_id) {
                const { data: parent } = await supabase
                    .from('posts')
                    .select('id, title, tags')
                    .eq('id', centerPost.forked_from_id)
                    .single()

                if (parent) {
                    addNode(parent, 'parent', 15)
                    links.push({ source: parent.id, target: centerPost.id, type: 'fork' })
                }
            }

            // 3. Fetch children (forks)
            const { data: forks } = await supabase
                .from('posts')
                .select('id, title, tags')
                .eq('forked_from_id', centerPostId)

            forks?.forEach(fork => {
                addNode(fork, 'child', 10)
                links.push({ source: centerPost.id, target: fork.id, type: 'fork' })
            })

            // 4. Fetch citations (where this post is target)
            const { data: citations } = await supabase
                .from('citations')
                .select('source_post_id, posts!citations_source_post_id_fkey(id, title, tags)')
                .eq('target_post_id', centerPostId)

            citations?.forEach((citation: any) => {
                const source = citation.posts
                if (source) {
                    addNode(source, 'citation', 8)
                    links.push({ source: source.id, target: centerPost.id, type: 'citation' })
                }
            })

            setGraphData({
                nodes: Array.from(nodes.values()),
                links: links
            })
            setActiveTags(currentTags)
        } catch (error) {
            console.error('Error fetching graph data:', error)
        } finally {
            setLoading(false)
        }
    }, [centerPostId, supabase])

    useEffect(() => {
        fetchTagColors()
    }, [fetchTagColors])

    useEffect(() => {
        if (Object.keys(tagColors).length > 0) {
            fetchGraphData()
        }
    }, [centerPostId, tagColors, fetchGraphData])

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect()
                setDimensions({ width, height })
            }
        }

        // Initial measurement
        updateDimensions()

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
            updateDimensions()
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => resizeObserver.disconnect()
    }, [expanded])

    const isDark = theme === 'dark'

    return (
        <div
            ref={containerRef}
            className={`relative border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden bg-gray-50 dark:bg-dark-surface transition-all duration-300 ${expanded ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[400px] w-full'}`}
        >
            <div className="absolute top-2 right-2 z-10 flex gap-2">
                {/* Legend */}
                {activeTags.size > 0 && (
                    <div className="bg-white/80 dark:bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-gray-200 dark:border-dark-border text-xs">
                        <div className="font-semibold mb-1 text-text dark:text-dark-text">Disciplines</div>
                        <div className="flex flex-col gap-1">
                            {Array.from(activeTags).map(tag => (
                                <div key={tag} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: tagColors[tag] || '#9CA3AF' }}
                                    />
                                    <span className="text-text-light dark:text-dark-text-muted">{tag}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpanded(!expanded)}
                    className="bg-white/80 dark:bg-black/50 backdrop-blur-sm"
                >
                    {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
            </div>

            {!loading && dimensions.width > 0 && (
                <ForceGraph2D
                    ref={graphRef}
                    graphData={graphData}
                    nodeLabel="title"
                    backgroundColor={isDark ? '#111827' : '#F9FAFB'}
                    width={dimensions.width}
                    height={dimensions.height}
                    onNodeClick={node => {
                        window.location.href = `/post/${node.id}`
                    }}
                    onNodeHover={node => {
                        setHoverNode(node || null)
                        if (containerRef.current) {
                            containerRef.current.style.cursor = node ? 'pointer' : 'default'
                        }
                    }}
                    // Link styling
                    linkColor={link => {
                        if (isDark) return '#4B5563'
                        return '#D1D5DB'
                    }}
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                    linkCurvature={0.25}
                    linkWidth={link => {
                        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source
                        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target

                        if (hoverNode && (sourceId === hoverNode.id || targetId === hoverNode.id)) {
                            return 2
                        }
                        return 1
                    }}
                    // Custom Node Rendering
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        const label = node.title
                        const fontSize = 12 / globalScale
                        ctx.font = `${fontSize}px Sans-Serif`

                        // Node styling based on tag
                        const tagColor = tagColors[node.tag] || '#9CA3AF'
                        let radius = 5

                        if (node.group === 'center') radius = 8
                        else if (node.group === 'parent') radius = 6
                        else if (node.group === 'child') radius = 6
                        else radius = 4

                        // Highlight on hover
                        const isHovered = hoverNode && node.id === hoverNode.id
                        const isNeighbor = hoverNode && graphData.links.some((link: any) => {
                            return (link.source.id === hoverNode.id && link.target.id === node.id) ||
                                (link.target.id === hoverNode.id && link.source.id === node.id)
                        })

                        if (isHovered || isNeighbor) {
                            ctx.beginPath()
                            ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI, false)
                            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                            ctx.fill()
                        }

                        // Draw Node
                        ctx.beginPath()
                        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)
                        ctx.fillStyle = tagColor
                        ctx.fill()

                        // Glow effect for center node
                        if (node.group === 'center') {
                            ctx.shadowBlur = 15
                            ctx.shadowColor = tagColor
                            ctx.beginPath()
                            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)
                            ctx.fill()
                            ctx.shadowBlur = 0 // Reset shadow
                        }

                        // Draw Label (only on hover or for center/parent)
                        if (isHovered || node.group === 'center' || node.group === 'parent' || globalScale > 2) {
                            ctx.textAlign = 'center'
                            ctx.textBaseline = 'middle'
                            ctx.fillStyle = isDark ? '#E5E7EB' : '#374151'
                            ctx.fillText(label, node.x, node.y + radius + fontSize)
                        }
                    }}
                    cooldownTicks={100}
                />
            )}
        </div>
    )
}
