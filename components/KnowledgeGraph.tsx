'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import {
    Loader2,
    Maximize2,
    Minimize2,
    ZoomIn,
    ZoomOut,
    Focus,
    GitFork,
    Quote,
    Tag,
    Users
} from 'lucide-react'
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
    authorId?: string
    authorName?: string
    x?: number
    y?: number
}

interface GraphLink {
    source: string | GraphNode
    target: string | GraphNode
    type: 'fork' | 'citation' | 'shared_tag' | 'shared_author'
}

type RelationType = 'fork' | 'citation' | 'shared_tag' | 'shared_author'

const RELATION_COLORS: Record<RelationType, string> = {
    fork: '#10B981',      // Green
    citation: '#3B82F6',  // Blue
    shared_tag: '#F59E0B', // Amber
    shared_author: '#8B5CF6' // Purple
}

const RELATION_LABELS: Record<RelationType, string> = {
    fork: 'Forks',
    citation: 'Citations',
    shared_tag: 'Related Topics',
    shared_author: 'Same Author'
}

export function KnowledgeGraph({ centerPostId }: KnowledgeGraphProps) {
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] })
    const [filteredGraphData, setFilteredGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] })
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [tagColors, setTagColors] = useState<Record<string, string>>({})
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
    const [hoverNode, setHoverNode] = useState<GraphNode | null>(null)

    // Relationship type filters
    const [activeRelations, setActiveRelations] = useState<Set<RelationType>>(
        new Set(['fork', 'citation', 'shared_tag', 'shared_author'])
    )
    const [availableRelations, setAvailableRelations] = useState<Set<RelationType>>(new Set())

    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<any>(null)
    const supabase = useMemo(() => createClient(), [])
    const { theme } = useTheme()

    const fetchTagColors = useCallback(async () => {
        const { data } = await supabase.from('tags').select('label, color')
        if (data) {
            const colors: Record<string, string> = {}
            data.forEach((tag: { label: string; color: string }) => {
                colors[tag.label] = tag.color
            })
            setTagColors(colors)
        }
    }, [supabase])

    const fetchGraphData = useCallback(async () => {
        try {
            // 1. Fetch the center post with author info
            const { data: centerPost } = await supabase
                .from('posts')
                .select('id, title, forked_from_id, tags, author_id, users:author_id(name)')
                .eq('id', centerPostId)
                .single()

            if (!centerPost) return

            const nodes = new Map<string, GraphNode>()
            const links: GraphLink[] = []
            const currentTags = new Set<string>()
            const relations = new Set<RelationType>()

            const addNode = (post: any, group: string, val: number) => {
                if (nodes.has(post.id)) return // Avoid duplicates
                const primaryTag = post.tags && post.tags.length > 0 ? post.tags[0] : 'Uncategorized'
                currentTags.add(primaryTag)
                nodes.set(post.id, {
                    id: post.id,
                    title: post.title || 'Untitled',
                    group,
                    val,
                    tag: primaryTag,
                    authorId: post.author_id,
                    authorName: post.users?.name || 'Unknown'
                })
            }

            // Add center node
            addNode({
                ...centerPost,
                users: (centerPost as any).users
            }, 'center', 20)

            // 2. Fetch parent (if exists)
            if (centerPost.forked_from_id) {
                const { data: parent } = await supabase
                    .from('posts')
                    .select('id, title, tags, author_id, users:author_id(name)')
                    .eq('id', centerPost.forked_from_id)
                    .single()

                if (parent) {
                    addNode(parent, 'parent', 15)
                    links.push({ source: parent.id, target: centerPost.id, type: 'fork' })
                    relations.add('fork')
                }
            }

            // 3. Fetch children (forks)
            const { data: forks } = await supabase
                .from('posts')
                .select('id, title, tags, author_id, users:author_id(name)')
                .eq('forked_from_id', centerPostId)
                .eq('status', 'published')

            forks?.forEach(fork => {
                addNode(fork, 'child', 10)
                links.push({ source: centerPost.id, target: fork.id, type: 'fork' })
                relations.add('fork')
            })

            // 4. Fetch citations (where this post is target)
            const { data: citations } = await supabase
                .from('citations')
                .select('source_post_id, posts!citations_source_post_id_fkey(id, title, tags, author_id, users:author_id(name))')
                .eq('target_post_id', centerPostId)

            citations?.forEach((citation: any) => {
                const source = citation.posts
                if (source) {
                    addNode(source, 'citation', 8)
                    links.push({ source: source.id, target: centerPost.id, type: 'citation' })
                    relations.add('citation')
                }
            })

            // 5. Fetch posts with shared primary tag (Related Topics)
            const primaryTag = centerPost.tags?.[0]
            if (primaryTag) {
                const { data: sharedTagPosts } = await supabase
                    .from('posts')
                    .select('id, title, tags, author_id, users:author_id(name)')
                    .contains('tags', [primaryTag])
                    .neq('id', centerPostId)
                    .eq('status', 'published')
                    .limit(5)

                sharedTagPosts?.forEach(post => {
                    if (!nodes.has(post.id)) {
                        addNode(post, 'related', 6)
                        links.push({ source: centerPost.id, target: post.id, type: 'shared_tag' })
                        relations.add('shared_tag')
                    }
                })
            }

            // 6. Fetch posts by the same author
            if (centerPost.author_id) {
                const { data: authorPosts } = await supabase
                    .from('posts')
                    .select('id, title, tags, author_id, users:author_id(name)')
                    .eq('author_id', centerPost.author_id)
                    .neq('id', centerPostId)
                    .eq('status', 'published')
                    .limit(5)

                authorPosts?.forEach(post => {
                    if (!nodes.has(post.id)) {
                        addNode(post, 'author', 6)
                        links.push({ source: centerPost.id, target: post.id, type: 'shared_author' })
                        relations.add('shared_author')
                    }
                })
            }

            setGraphData({
                nodes: Array.from(nodes.values()),
                links: links
            })
            setActiveTags(currentTags)
            setAvailableRelations(relations)
        } catch (error) {
            console.error('Error fetching graph data:', error)
        } finally {
            setLoading(false)
        }
    }, [centerPostId, supabase])

    // Filter graph data based on active relations
    useEffect(() => {
        const filteredLinks = graphData.links.filter(link => activeRelations.has(link.type))

        // Get all node IDs that are connected by filtered links
        const connectedNodeIds = new Set<string>()
        filteredLinks.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source
            const targetId = typeof link.target === 'object' ? link.target.id : link.target
            connectedNodeIds.add(sourceId)
            connectedNodeIds.add(targetId)
        })

        // Always include center node
        const centerNode = graphData.nodes.find(n => n.group === 'center')
        if (centerNode) connectedNodeIds.add(centerNode.id)

        const filteredNodes = graphData.nodes.filter(node => connectedNodeIds.has(node.id))

        setFilteredGraphData({ nodes: filteredNodes, links: filteredLinks })
    }, [graphData, activeRelations])

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

        updateDimensions()

        const resizeObserver = new ResizeObserver(() => {
            updateDimensions()
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => resizeObserver.disconnect()
    }, [expanded])

    const toggleRelation = (relation: RelationType) => {
        setActiveRelations(prev => {
            const newSet = new Set(prev)
            if (newSet.has(relation)) {
                newSet.delete(relation)
            } else {
                newSet.add(relation)
            }
            return newSet
        })
    }

    // Zoom controls
    const handleZoomIn = () => {
        if (graphRef.current) {
            const currentZoom = graphRef.current.zoom()
            graphRef.current.zoom(currentZoom * 1.5, 300)
        }
    }

    const handleZoomOut = () => {
        if (graphRef.current) {
            const currentZoom = graphRef.current.zoom()
            graphRef.current.zoom(currentZoom / 1.5, 300)
        }
    }

    const handleCenterView = () => {
        if (graphRef.current) {
            graphRef.current.zoomToFit(400, 50)
        }
    }

    const isDark = theme === 'dark'

    const getRelationIcon = (relation: RelationType) => {
        switch (relation) {
            case 'fork': return <GitFork className="w-3 h-3" />
            case 'citation': return <Quote className="w-3 h-3" />
            case 'shared_tag': return <Tag className="w-3 h-3" />
            case 'shared_author': return <Users className="w-3 h-3" />
        }
    }

    return (
        <div
            ref={containerRef}
            className={`relative border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden bg-gray-50 dark:bg-dark-surface transition-all duration-300 ${expanded ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[450px] w-full'}`}
        >
            {/* Top controls - Relation filters */}
            <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
                {Array.from(availableRelations).map(relation => (
                    <button
                        key={relation}
                        onClick={() => toggleRelation(relation)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${activeRelations.has(relation)
                            ? 'text-white shadow-sm'
                            : 'bg-white/80 dark:bg-dark-bg/80 text-text-light dark:text-dark-text-muted border border-gray-200 dark:border-dark-border opacity-60'
                            }`}
                        style={activeRelations.has(relation) ? { backgroundColor: RELATION_COLORS[relation] } : {}}
                        title={`Toggle ${RELATION_LABELS[relation]}`}
                    >
                        {getRelationIcon(relation)}
                        <span className="hidden sm:inline">{RELATION_LABELS[relation]}</span>
                    </button>
                ))}
            </div>

            {/* Right side controls */}
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                {/* Legend */}
                {activeTags.size > 0 && (
                    <div className="bg-white/80 dark:bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-gray-200 dark:border-dark-border text-xs">
                        <div className="font-semibold mb-1 text-text dark:text-dark-text">Disciplines</div>
                        <div className="flex flex-col gap-1">
                            {Array.from(activeTags).slice(0, 5).map(tag => (
                                <div key={tag} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: tagColors[tag] || '#9CA3AF' }}
                                    />
                                    <span className="text-text-light dark:text-dark-text-muted truncate max-w-[80px]">{tag}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Zoom and view controls */}
                <div className="flex flex-col gap-1 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-dark-border p-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomIn}
                        className="h-7 w-7"
                        title="Zoom in"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomOut}
                        className="h-7 w-7"
                        title="Zoom out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCenterView}
                        className="h-7 w-7"
                        title="Fit all"
                    >
                        <Focus className="w-4 h-4" />
                    </Button>
                    <div className="h-px bg-gray-200 dark:bg-dark-border mx-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpanded(!expanded)}
                        className="h-7 w-7"
                        title={expanded ? 'Minimize' : 'Fullscreen'}
                    >
                        {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Stats badge */}
            <div className="absolute bottom-2 left-2 z-10 bg-white/80 dark:bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-text-light dark:text-dark-text-muted">
                {filteredGraphData.nodes.length} nodes · {filteredGraphData.links.length} connections
            </div>

            {!loading && dimensions.width > 0 && (
                <ForceGraph2D
                    ref={graphRef}
                    graphData={filteredGraphData}
                    nodeLabel="title"
                    backgroundColor={isDark ? '#111827' : '#F9FAFB'}
                    width={dimensions.width}
                    height={dimensions.height}
                    onNodeClick={node => {
                        window.location.href = `/post/${node.id}`
                    }}
                    onNodeHover={node => {
                        setHoverNode((node as GraphNode) || null)
                        if (containerRef.current) {
                            containerRef.current.style.cursor = node ? 'pointer' : 'default'
                        }
                    }}
                    // Link styling based on type
                    linkColor={(link: any) => {
                        const linkType = link.type as RelationType
                        return RELATION_COLORS[linkType] || (isDark ? '#4B5563' : '#D1D5DB')
                    }}
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                    linkCurvature={0.25}
                    linkWidth={(link: any) => {
                        const sourceId = typeof link.source === 'object' ? link.source.id : link.source
                        const targetId = typeof link.target === 'object' ? link.target.id : link.target

                        if (hoverNode && (sourceId === hoverNode.id || targetId === hoverNode.id)) {
                            return 3
                        }
                        // Weaker connections for shared_tag and shared_author
                        if (link.type === 'shared_tag' || link.type === 'shared_author') {
                            return 1
                        }
                        return 1.5
                    }}
                    linkLineDash={(link: any) => {
                        // Dashed lines for weaker connections
                        if (link.type === 'shared_tag' || link.type === 'shared_author') {
                            return [2, 2]
                        }
                        return null
                    }}
                    // Custom Node Rendering
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        // Guard against undefined positions during initial render
                        if (node.x === undefined || node.y === undefined ||
                            !isFinite(node.x) || !isFinite(node.y)) {
                            return
                        }

                        const label = node.title
                        const fontSize = 12 / globalScale
                        ctx.font = `${fontSize}px Sans-Serif`

                        // Node styling based on tag
                        const tagColor = tagColors[node.tag] || '#9CA3AF'
                        let radius = 5

                        if (node.group === 'center') radius = 10
                        else if (node.group === 'parent') radius = 8
                        else if (node.group === 'child') radius = 7
                        else if (node.group === 'citation') radius = 6
                        else radius = 5

                        // Highlight on hover
                        const isHovered = hoverNode && node.id === hoverNode.id
                        const isNeighbor = hoverNode && filteredGraphData.links.some((link: any) => {
                            const sourceId = typeof link.source === 'object' ? link.source.id : link.source
                            const targetId = typeof link.target === 'object' ? link.target.id : link.target
                            return (sourceId === hoverNode.id && targetId === node.id) ||
                                (targetId === hoverNode.id && sourceId === node.id)
                        })

                        // Outer glow for hovered/neighbor nodes
                        if (isHovered || isNeighbor) {
                            ctx.beginPath()
                            ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI, false)
                            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'
                            ctx.fill()
                        }

                        // Draw Node with gradient
                        const gradient = ctx.createRadialGradient(
                            node.x - radius * 0.3, node.y - radius * 0.3, 0,
                            node.x, node.y, radius
                        )
                        gradient.addColorStop(0, tagColor)
                        gradient.addColorStop(1, `${tagColor}CC`)

                        ctx.beginPath()
                        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)
                        ctx.fillStyle = gradient
                        ctx.fill()

                        // Border
                        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                        ctx.lineWidth = 1
                        ctx.stroke()

                        // Pulsing glow effect for center node
                        if (node.group === 'center') {
                            ctx.shadowBlur = 20
                            ctx.shadowColor = tagColor
                            ctx.beginPath()
                            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)
                            ctx.fill()
                            ctx.shadowBlur = 0
                        }

                        // Draw Label
                        if (isHovered || node.group === 'center' || node.group === 'parent' || globalScale > 1.5) {
                            const maxLabelLength = 25
                            const truncatedLabel = label.length > maxLabelLength
                                ? label.substring(0, maxLabelLength) + '...'
                                : label

                            ctx.textAlign = 'center'
                            ctx.textBaseline = 'middle'

                            // Text shadow for better readability
                            ctx.fillStyle = isDark ? '#111827' : '#FFFFFF'
                            ctx.fillText(truncatedLabel, node.x + 0.5, node.y + radius + fontSize + 0.5)

                            ctx.fillStyle = isDark ? '#E5E7EB' : '#374151'
                            ctx.fillText(truncatedLabel, node.x, node.y + radius + fontSize)
                        }
                    }}
                    cooldownTicks={100}
                />
            )}

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-dark-surface/80">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-sm text-text-light dark:text-dark-text-muted">Building knowledge graph...</span>
                    </div>
                </div>
            )}
        </div>
    )
}
