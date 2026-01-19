'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import {
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Info,
    ExternalLink,
    Maximize2,
    Minimize2,
    Search,
    Loader2,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Types
interface KnowledgeGraphProps {
    centerPostId: string
}

interface GraphNode {
    id: string
    title: string
    group: 'center' | 'fork' | 'citation' | 'related' | 'author'
    tag: string
    authorName?: string
    contentType: 'post' | 'resource'
}

interface GraphEdge {
    source: string
    target: string
    type: 'fork' | 'citation' | 'shared_tag' | 'shared_author'
}

type RelationType = 'fork' | 'citation' | 'shared_tag' | 'shared_author'

// Design System Colors
const THEME_COLORS = {
    primary: '#1A3D40',
    primaryLight: '#2A5558',
    secondary: '#4AA3A5',
    accent: '#C9A227',         // Golden amber like reference
    citation: '#C41E3A',       // Heritage Red for citations
    textLight: '#5A6A72',
    darkBg: '#0F1419',         // Darker background like reference
    darkSurface: '#1A2028',
    lightBg: '#FAFAFA',
    lightSurface: '#FFFFFF',
    textDark: '#2A3A42',
    textDarkMode: '#E8EDEE'
}

// Node colors by relationship type
const NODE_COLORS: Record<string, { bg: string, border: string, text: string }> = {
    center: { bg: THEME_COLORS.secondary, border: THEME_COLORS.primaryLight, text: '#FFFFFF' },
    fork: { bg: THEME_COLORS.accent, border: '#B8911F', text: '#1A1A1A' },
    citation: { bg: THEME_COLORS.citation, border: '#A31830', text: '#FFFFFF' },
    related: { bg: THEME_COLORS.primaryLight, border: THEME_COLORS.primary, text: '#FFFFFF' },
    author: { bg: '#6366F1', border: '#4F46E5', text: '#FFFFFF' }
}

const RELATION_LABELS: Record<RelationType, string> = {
    fork: 'Fork',
    citation: 'Cites This',
    shared_tag: 'Related Topic',
    shared_author: 'Same Author'
}

// Edge descriptions for hover tooltips
const EDGE_DESCRIPTIONS: Record<RelationType, string> = {
    fork: 'This work was derived from or built upon the original',
    citation: 'This work references or cites the original',
    shared_tag: 'These works share common topics or themes',
    shared_author: 'These works are by the same author'
}

// Helper component for dialog canvas - fully self-contained with its own state
function DialogGraphCanvas({
    nodes,
    edges,
    calculatePositions,
    expanded
}: {
    nodes: GraphNode[]
    edges: GraphEdge[]
    calculatePositions: (width: number, height: number) => Map<string, { x: number, y: number }>
    expanded: boolean
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [positions, setPositions] = useState<Map<string, { x: number, y: number }>>(new Map())
    const [zoomLevel, setZoomLevel] = useState(0.9)
    const [draggedNode, setDraggedNode] = useState<string | null>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null) // For click-to-show-info panel
    const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null)
    const hasDragged = useRef(false)

    const t = useTranslations('KnowledgeGraph')

    const RELATION_LABELS: Record<RelationType, string> = {
        fork: t('relations.fork'),
        citation: t('relations.citation'),
        shared_tag: t('relations.shared_tag'),
        shared_author: t('relations.shared_author')
    }

    const EDGE_DESCRIPTIONS: Record<RelationType, string> = {
        fork: t('highlightFork'), // Need to make sure these match or add to en/ar.json
        citation: t('highlightCitation'),
        shared_tag: t('highlightTopic'),
        shared_author: t('highlightAuthor')
    }

    // Initialize positions when dialog opens
    useEffect(() => {
        if (expanded && containerRef.current && nodes.length > 0) {
            const timer = setTimeout(() => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect()
                    const newPositions = calculatePositions(rect.width, rect.height)
                    setPositions(newPositions)
                }
            }, 50)
            return () => clearTimeout(timer)
        }
    }, [expanded, nodes, calculatePositions])

    // Draw function for dialog
    const drawDialogGraph = useCallback(() => {
        if (!canvasRef.current || !containerRef.current || positions.size === 0) return

        const canvas = canvasRef.current
        const rect = containerRef.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.scale(dpr, dpr)

        // Clear
        ctx.fillStyle = THEME_COLORS.darkBg
        ctx.fillRect(0, 0, width, height)

        // Apply zoom
        ctx.save()
        const centerX = width / 2
        const centerY = height / 2
        ctx.translate(centerX, centerY)
        ctx.scale(zoomLevel, zoomLevel)
        ctx.translate(-centerX, -centerY)

        // Draw edges with semantic styling
        edges.forEach(edge => {
            const sourcePos = positions.get(edge.source)
            const targetPos = positions.get(edge.target)
            if (!sourcePos || !targetPos) return

            const midX = (sourcePos.x + targetPos.x) / 2
            const midY = (sourcePos.y + targetPos.y) / 2
            const dx = targetPos.x - sourcePos.x
            const dy = targetPos.y - sourcePos.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const curvature = dist * 0.15
            const perpX = -dy / dist * curvature
            const perpY = dx / dist * curvature

            const edgeColor = edge.type === 'citation' ? THEME_COLORS.citation :
                edge.type === 'fork' ? THEME_COLORS.accent :
                    edge.type === 'shared_author' ? '#6366F1' : THEME_COLORS.secondary

            const isHovered = hoveredEdge?.source === edge.source && hoveredEdge?.target === edge.target

            // Apply glow effect when hovered
            if (isHovered) {
                ctx.shadowColor = edgeColor
                ctx.shadowBlur = 12
            }

            ctx.beginPath()
            ctx.moveTo(sourcePos.x, sourcePos.y)
            ctx.quadraticCurveTo(midX + perpX, midY + perpY, targetPos.x, targetPos.y)

            // Solid for forks (derived work), dashed for citations
            if (edge.type === 'citation' || edge.type === 'shared_tag') {
                ctx.setLineDash([6, 4])
            } else {
                ctx.setLineDash([])
            }

            // Thicker when hovered
            ctx.lineWidth = isHovered ? 3 : 2
            ctx.strokeStyle = isHovered ? edgeColor : `${edgeColor}60`
            ctx.stroke()

            // Reset
            ctx.setLineDash([])
            ctx.shadowColor = 'transparent'
            ctx.shadowBlur = 0
        })

        // Draw nodes
        nodes.forEach(node => {
            const pos = positions.get(node.id)
            if (!pos) return

            const colors = NODE_COLORS[node.group]
            const isCenter = node.group === 'center'
            const isHovered = hoveredNode?.id === node.id
            const nodeWidth = isCenter ? 110 : 90
            const nodeHeight = isCenter ? 44 : 36
            const radius = 6

            if (isHovered || isCenter) {
                ctx.shadowColor = `${colors.bg}40`
                ctx.shadowBlur = 15
                ctx.shadowOffsetY = 4
            }

            ctx.beginPath()
            ctx.roundRect(pos.x - nodeWidth / 2, pos.y - nodeHeight / 2, nodeWidth, nodeHeight, radius)
            ctx.fillStyle = colors.bg
            ctx.fill()
            ctx.strokeStyle = colors.border
            ctx.lineWidth = isHovered ? 3 : 2
            ctx.stroke()

            ctx.shadowColor = 'transparent'
            ctx.shadowBlur = 0
            ctx.shadowOffsetY = 0

            ctx.fillStyle = colors.text
            ctx.font = `${isCenter ? '600' : '500'} ${isCenter ? 12 : 11}px Inter, system-ui, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            const title = node.title.length > 12 ? node.title.substring(0, 11) + '…' : node.title
            ctx.fillText(title, pos.x, pos.y - (isCenter ? 5 : 3))

            ctx.font = '500 9px Inter, system-ui, sans-serif'
            ctx.fillStyle = `${colors.text}99`
            const tag = node.tag.length > 12 ? node.tag.substring(0, 11) + '…' : node.tag
            ctx.fillText(tag, pos.x, pos.y + (isCenter ? 10 : 8))
        })

        ctx.restore()
    }, [nodes, edges, positions, zoomLevel, hoveredNode, hoveredEdge])

    // Redraw when positions/zoom change
    useEffect(() => {
        drawDialogGraph()
    }, [drawDialogGraph])

    // Get node at position (adjusted for zoom)
    const getNodeAtPosition = useCallback((x: number, y: number, rect: DOMRect): GraphNode | null => {
        if (positions.size === 0) return null
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        // Adjust for zoom - transform screen coords back to canvas coords
        const adjustedX = centerX + (x - centerX) / zoomLevel
        const adjustedY = centerY + (y - centerY) / zoomLevel

        for (const node of nodes) {
            const pos = positions.get(node.id)
            if (!pos) continue
            const isCenter = node.group === 'center'
            const nodeWidth = isCenter ? 110 : 90
            const nodeHeight = isCenter ? 44 : 36

            // Check if click is within node bounds
            if (adjustedX >= pos.x - nodeWidth / 2 && adjustedX <= pos.x + nodeWidth / 2 &&
                adjustedY >= pos.y - nodeHeight / 2 && adjustedY <= pos.y + nodeHeight / 2) {
                return node
            }
        }
        return null
    }, [nodes, positions, zoomLevel])

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        hasDragged.current = false
        const node = getNodeAtPosition(x, y, rect)
        if (node) {
            const pos = positions.get(node.id)
            if (pos) {
                // Adjust for zoom
                const centerX = rect.width / 2
                const centerY = rect.height / 2
                const adjustedX = centerX + (x - centerX) / zoomLevel
                const adjustedY = centerY + (y - centerY) / zoomLevel
                setDraggedNode(node.id)
                setDragOffset({ x: adjustedX - pos.x, y: adjustedY - pos.y })
            }
        }
    }, [getNodeAtPosition, positions, zoomLevel])

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (draggedNode) {
            hasDragged.current = true
            const centerX = rect.width / 2
            const centerY = rect.height / 2
            const adjustedX = centerX + (x - centerX) / zoomLevel
            const adjustedY = centerY + (y - centerY) / zoomLevel
            const padding = 70
            const newX = Math.max(padding, Math.min(rect.width - padding, adjustedX - dragOffset.x))
            const newY = Math.max(padding, Math.min(rect.height - padding, adjustedY - dragOffset.y))

            setPositions(prev => {
                const next = new Map(prev)
                next.set(draggedNode, { x: newX, y: newY })
                return next
            })
        } else {
            // Check for node hover first
            const node = getNodeAtPosition(x, y, rect)
            setHoveredNode(node)

            // Only check for edge hover if not hovering a node
            if (!node && containerRef.current) {
                const centerX = rect.width / 2
                const centerY = rect.height / 2
                const adjustedX = centerX + (x - centerX) / zoomLevel
                const adjustedY = centerY + (y - centerY) / zoomLevel

                // Find if hovering near an edge
                let foundEdge: GraphEdge | null = null
                for (const edge of edges) {
                    const sourcePos = positions.get(edge.source)
                    const targetPos = positions.get(edge.target)
                    if (!sourcePos || !targetPos) continue

                    // Check distance to line (simplified - check distance to midpoint)
                    const midX = (sourcePos.x + targetPos.x) / 2
                    const midY = (sourcePos.y + targetPos.y) / 2
                    const dist = Math.sqrt((adjustedX - midX) ** 2 + (adjustedY - midY) ** 2)

                    if (dist < 30) {
                        foundEdge = edge
                        break
                    }
                }
                setHoveredEdge(foundEdge)
            } else {
                setHoveredEdge(null)
            }

            e.currentTarget.style.cursor = node ? 'pointer' : 'default'
        }
    }, [draggedNode, dragOffset, getNodeAtPosition, zoomLevel, edges, positions])

    const handleMouseUp = useCallback(() => {
        setDraggedNode(null)
    }, [])

    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (hasDragged.current) {
            hasDragged.current = false
            return
        }
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const node = getNodeAtPosition(x, y, rect)

        // Click to select node (shows info panel)
        if (node) {
            setSelectedNode(node)
        } else {
            // Click on empty space clears selection
            setSelectedNode(null)
        }
    }, [getNodeAtPosition])


    const resetLayout = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setPositions(calculatePositions(rect.width, rect.height))
        }
        setZoomLevel(0.9)
    }, [calculatePositions])

    return (
        <div ref={containerRef} className="absolute inset-0">
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleClick}
            />

            {/* Info Panel - Always visible */}
            <div className="absolute top-3 left-3 z-10 bg-[#1A2028]/95 backdrop-blur-md rounded-lg border border-dark-border p-4 shadow-lg w-[280px]">
                {/* Header */}
                <div className="text-[10px] text-dark-text-muted uppercase tracking-wider mb-3 pb-2 border-b border-dark-border">
                    {t('nodeDetails')}
                </div>

                {selectedNode ? (
                    <>
                        {/* Relationship Badge */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: NODE_COLORS[selectedNode.group].bg }} />
                                <span className="text-xs font-medium text-dark-text uppercase tracking-wide">
                                    {RELATION_LABELS[selectedNode.group as RelationType] || selectedNode.group}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="text-dark-text-muted hover:text-dark-text transition-colors p-1 hover:bg-dark-border/30 rounded"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Title */}
                        <div className="text-base font-semibold text-dark-text mb-2 leading-tight">
                            {selectedNode.title}
                        </div>

                        {/* Author */}
                        {selectedNode.authorName && (
                            <div className="flex items-center gap-2 text-sm text-dark-text-muted mb-2">
                                <span className="text-dark-text-muted/60">By</span>
                                <span className="text-dark-text">{selectedNode.authorName}</span>
                            </div>
                        )}

                        {/* Tag */}
                        <div className="inline-block bg-dark-border/40 text-xs text-dark-text-muted px-2 py-1 rounded mb-3">
                            #{selectedNode.tag}
                        </div>

                        {/* Relationship Explanation */}
                        <div className="bg-dark-border/20 rounded p-2 mb-3">
                            <div className="text-[10px] text-dark-text-muted uppercase tracking-wider mb-1">{t('connection')}</div>
                            <div className="text-xs text-dark-text">
                                {selectedNode.group === 'center' && t('currentlyViewing')}
                                {selectedNode.group === 'fork' && t('highlightFork')}
                                {selectedNode.group === 'citation' && t('highlightCitation')}
                                {selectedNode.group === 'related' && t('highlightTopic')}
                                {selectedNode.group === 'author' && t('highlightAuthor')}
                            </div>
                        </div>

                        {/* Action Button */}
                        {selectedNode.group !== 'center' && (
                            <Button
                                onClick={() => window.location.href = selectedNode.contentType === 'resource' ? `/resources/${selectedNode.id}` : `/post/${selectedNode.id}`}
                                className="w-full bg-secondary hover:bg-secondary/80 text-white text-sm h-9 font-medium"
                            >
                                {selectedNode.contentType === 'resource' ? t('viewResource') : t('viewPost')} →
                            </Button>
                        )}
                        {selectedNode.group === 'center' && (
                            <div className="text-center text-xs text-secondary py-2">
                                {t('currentlyViewing')}
                            </div>
                        )}
                    </>
                ) : hoveredEdge ? (
                    <>
                        {/* Edge Hover Info */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-0.5" style={{
                                backgroundColor: hoveredEdge.type === 'citation' ? THEME_COLORS.citation :
                                    hoveredEdge.type === 'fork' ? THEME_COLORS.accent : THEME_COLORS.secondary,
                            }} />
                            <span className="text-sm font-medium text-dark-text uppercase tracking-wide">
                                {RELATION_LABELS[hoveredEdge.type]}
                            </span>
                        </div>
                        <div className="text-sm text-dark-text">
                            {EDGE_DESCRIPTIONS[hoveredEdge.type]}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Empty State - Instructions */}
                        <div className="text-center py-4">
                            <div className="text-4xl mb-3 opacity-40">🔍</div>
                            <div className="text-sm text-dark-text mb-2">{t('selectNode')}</div>
                            <div className="text-xs text-dark-text-muted leading-relaxed">
                                {t('exploreHint')}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="border-t border-dark-border pt-3 mt-3">
                            <div className="text-[10px] text-dark-text-muted uppercase tracking-wider mb-2">{t('graphOverview')}</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-dark-border/30 rounded p-2 text-center">
                                    <div className="text-lg font-bold text-dark-text">{nodes.length}</div>
                                    <div className="text-dark-text-muted">{t('nodes')}</div>
                                </div>
                                <div className="bg-dark-border/30 rounded p-2 text-center">
                                    <div className="text-lg font-bold text-dark-text">{edges.length}</div>
                                    <div className="text-dark-text-muted">{t('connections')}</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-[#1A2028]/95 backdrop-blur-md rounded-full border border-dark-border p-1.5 shadow-lg">
                <Button variant="ghost" size="icon" onClick={() => setZoomLevel(z => Math.min(z * 1.2, 2))} className="h-8 w-8 rounded-full text-dark-text-muted hover:text-dark-text hover:bg-dark-border/50" title="Zoom in">
                    <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setZoomLevel(z => Math.max(z / 1.2, 0.4))} className="h-8 w-8 rounded-full text-dark-text-muted hover:text-dark-text hover:bg-dark-border/50" title="Zoom out">
                    <ZoomOut className="w-4 h-4" />
                </Button>
                <div className="h-4 w-px bg-dark-border mx-1" />
                <Button variant="ghost" size="icon" onClick={resetLayout} className="h-8 w-8 rounded-full text-dark-text-muted hover:text-dark-text hover:bg-dark-border/50" title="Reset layout">
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </div>

            {/* Legend */}
            <div className="absolute top-3 right-3 z-10 bg-[#1A2028]/90 backdrop-blur-md rounded-lg border border-dark-border p-3 shadow-sm">
                <div className="text-[10px] text-dark-text-muted uppercase tracking-wide mb-2">{t('nodeTypes')}</div>
                <div className="flex flex-wrap gap-3 text-xs mb-3">
                    {Object.entries(NODE_COLORS).filter(([key]) => key !== 'center').map(([key, colors]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.bg }} />
                            <span className="text-dark-text-muted capitalize">
                                {key === 'related' ? t('relations.shared_tag') : (RELATION_LABELS[key as RelationType] || key)}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="text-[10px] text-dark-text-muted uppercase tracking-wide mb-2">{t('edgeTypes')}</div>
                <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-0.5 bg-dark-text-muted" />
                        <span className="text-dark-text-muted">{t('legendSolid')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-0 border-t-2 border-dashed border-dark-text-muted" />
                        <span className="text-dark-text-muted">{t('legendDashed')}</span>
                    </div>
                </div>
            </div>

            {/* Purpose Hint */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 text-xs text-dark-text-muted/70 text-center">
                {t('exploreHint')}
            </div>
        </div>
    )
}

export function KnowledgeGraph({ centerPostId }: KnowledgeGraphProps) {
    const [nodes, setNodes] = useState<GraphNode[]>([])
    const [edges, setEdges] = useState<GraphEdge[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
    const t = useTranslations('KnowledgeGraph')

    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const dialogCanvasRef = useRef<HTMLCanvasElement>(null)

    const supabase = useMemo(() => createClient(), [])
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'

    // Node positions (will be calculated once and stored)
    const [nodePositions, setNodePositions] = useState<Map<string, { x: number, y: number }>>(new Map())
    const [dialogPositions, setDialogPositions] = useState<Map<string, { x: number, y: number }>>(new Map())
    const [draggedNode, setDraggedNode] = useState<string | null>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [zoomLevel, setZoomLevel] = useState(0.85) // Start slightly zoomed out
    const [dialogZoomLevel, setDialogZoomLevel] = useState(0.85)
    const hasDragged = useRef(false) // Track if actual dragging occurred
    const dialogContainerRef = useRef<HTMLDivElement>(null)

    // Fetch graph data
    const fetchGraphData = useCallback(async () => {
        try {
            const { data: centerPost } = await supabase
                .from('posts')
                .select('id, title, forked_from_id, tags, author_id, users:author_id(name)')
                .eq('id', centerPostId)
                .single()

            if (!centerPost) return

            const newNodes: GraphNode[] = []
            const newEdges: GraphEdge[] = []
            const nodeIds = new Set<string>()

            const addNode = (post: any, group: GraphNode['group'], contentType: 'post' | 'resource' = 'post') => {
                if (nodeIds.has(post.id)) return
                nodeIds.add(post.id)
                newNodes.push({
                    id: post.id,
                    title: post.title || post.name || 'Untitled',
                    group,
                    tag: post.tags?.[0] || post.resource_type || 'Research',
                    authorName: post.users?.name || post.created_by_user?.name || 'Unknown',
                    contentType
                })
            }

            // Center node
            addNode({ ...centerPost, users: (centerPost as any).users }, 'center')

            // Parent fork
            if (centerPost.forked_from_id) {
                const { data: parent } = await supabase
                    .from('posts')
                    .select('id, title, tags, author_id, users:author_id(name)')
                    .eq('id', centerPost.forked_from_id)
                    .single()
                if (parent) {
                    addNode(parent, 'fork')
                    newEdges.push({ source: parent.id, target: centerPost.id, type: 'fork' })
                }
            }

            // Child forks
            const { data: forks } = await supabase
                .from('posts')
                .select('id, title, tags, author_id, users:author_id(name)')
                .eq('forked_from_id', centerPostId)
                .eq('status', 'published')
                .limit(4)

            forks?.forEach(fork => {
                addNode(fork, 'fork')
                newEdges.push({ source: centerPost.id, target: fork.id, type: 'fork' })
            })

            // Citations
            const { data: citations } = await supabase
                .from('citations')
                .select('source_post_id, posts!citations_source_post_id_fkey(id, title, tags, author_id, users:author_id(name))')
                .eq('target_post_id', centerPostId)
                .limit(4)

            citations?.forEach((citation: any) => {
                if (citation.posts) {
                    addNode(citation.posts, 'citation')
                    newEdges.push({ source: citation.posts.id, target: centerPost.id, type: 'citation' })
                }
            })

            // Related by tag
            const primaryTag = centerPost.tags?.[0]
            if (primaryTag) {
                const { data: shared } = await supabase
                    .from('posts')
                    .select('id, title, tags, author_id, users:author_id(name)')
                    .contains('tags', [primaryTag])
                    .neq('id', centerPostId)
                    .eq('status', 'published')
                    .limit(3)

                shared?.forEach(post => {
                    if (!nodeIds.has(post.id)) {
                        addNode(post, 'related')
                        newEdges.push({ source: centerPost.id, target: post.id, type: 'shared_tag' })
                    }
                })
            }

            // Same author
            if (centerPost.author_id) {
                const { data: authorPosts } = await supabase
                    .from('posts')
                    .select('id, title, tags, author_id, users:author_id(name)')
                    .eq('author_id', centerPost.author_id)
                    .neq('id', centerPostId)
                    .eq('status', 'published')
                    .limit(3)

                authorPosts?.forEach(post => {
                    if (!nodeIds.has(post.id)) {
                        addNode(post, 'author')
                        newEdges.push({ source: centerPost.id, target: post.id, type: 'shared_author' })
                    }
                })
            }

            setNodes(newNodes)
            setEdges(newEdges)
        } catch (err) {
            console.error('Error fetching graph data:', err)
        } finally {
            setLoading(false)
        }
    }, [centerPostId, supabase])

    useEffect(() => { fetchGraphData() }, [fetchGraphData])

    // Calculate initial positions in a clean layout
    const calculatePositions = useCallback((width: number, height: number) => {
        const positions = new Map<string, { x: number, y: number }>()
        const centerX = width / 2
        const centerY = height / 2

        // Group nodes by type
        const centerNode = nodes.find(n => n.group === 'center')
        const forkNodes = nodes.filter(n => n.group === 'fork')
        const citationNodes = nodes.filter(n => n.group === 'citation')
        const relatedNodes = nodes.filter(n => n.group === 'related')
        const authorNodes = nodes.filter(n => n.group === 'author')

        // Center node
        if (centerNode) {
            positions.set(centerNode.id, { x: centerX, y: centerY })
        }

        // Arrange other nodes in concentric arcs
        const arrangeInArc = (nodeList: GraphNode[], radius: number, startAngle: number, sweep: number) => {
            const count = nodeList.length
            if (count === 0) return
            const angleStep = sweep / Math.max(count - 1, 1)
            nodeList.forEach((node, i) => {
                const angle = startAngle + (count === 1 ? sweep / 2 : i * angleStep)
                positions.set(node.id, {
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                })
            })
        }

        // Distribute by type in different directions - even wider spacing
        const radius1 = Math.min(width, height) * 0.42
        const radius2 = Math.min(width, height) * 0.48

        arrangeInArc(forkNodes, radius1, -Math.PI * 0.85, Math.PI * 0.6)     // Top-left arc (wider sweep)
        arrangeInArc(citationNodes, radius1, Math.PI * 0.15, Math.PI * 0.6)  // Bottom-right arc
        arrangeInArc(relatedNodes, radius2, -Math.PI * 0.1, Math.PI * 0.25)  // Right side
        arrangeInArc(authorNodes, radius2, Math.PI * 0.9, Math.PI * 0.25)    // Left side

        return positions
    }, [nodes])

    // Initialize positions when nodes change
    useEffect(() => {
        if (nodes.length > 0 && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const positions = calculatePositions(rect.width, rect.height)
            setNodePositions(positions)
        }
    }, [nodes, calculatePositions])

    // Draw the graph on canvas
    const drawGraph = useCallback((canvas: HTMLCanvasElement | null, width: number, height: number) => {
        if (!canvas || nodePositions.size === 0) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size with device pixel ratio for sharp rendering
        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.scale(dpr, dpr)

        // Clear - always use dark background
        ctx.fillStyle = THEME_COLORS.darkBg
        ctx.fillRect(0, 0, width, height)

        // Apply zoom transform
        ctx.save()
        const centerX = width / 2
        const centerY = height / 2
        ctx.translate(centerX, centerY)
        ctx.scale(zoomLevel, zoomLevel)
        ctx.translate(-centerX, -centerY)

        // Draw edges first (behind nodes) with semantic styling
        edges.forEach(edge => {
            const sourcePos = nodePositions.get(edge.source)
            const targetPos = nodePositions.get(edge.target)
            if (!sourcePos || !targetPos) return

            // Calculate control points for bezier curve
            const midX = (sourcePos.x + targetPos.x) / 2
            const midY = (sourcePos.y + targetPos.y) / 2
            const dx = targetPos.x - sourcePos.x
            const dy = targetPos.y - sourcePos.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            // Perpendicular offset for curve
            const curvature = dist * 0.15
            const perpX = -dy / dist * curvature
            const perpY = dx / dist * curvature

            // Solid for forks (derived work), dashed for citations
            if (edge.type === 'citation' || edge.type === 'shared_tag') {
                ctx.setLineDash([5, 3])
            } else {
                ctx.setLineDash([])
            }

            ctx.beginPath()
            ctx.moveTo(sourcePos.x, sourcePos.y)
            ctx.quadraticCurveTo(midX + perpX, midY + perpY, targetPos.x, targetPos.y)

            // Edge color based on type
            const edgeColor = edge.type === 'citation' ? THEME_COLORS.citation :
                edge.type === 'fork' ? THEME_COLORS.accent :
                    edge.type === 'shared_author' ? '#6366F1' :
                        THEME_COLORS.secondary

            ctx.lineWidth = 2
            ctx.strokeStyle = `${edgeColor}60`
            ctx.stroke()

            // Reset line dash
            ctx.setLineDash([])
        })

        // Draw nodes
        nodes.forEach(node => {
            const pos = nodePositions.get(node.id)
            if (!pos) return

            const colors = NODE_COLORS[node.group]
            const isCenter = node.group === 'center'
            const isHovered = hoveredNode?.id === node.id

            // Node dimensions - narrower nodes
            const nodeWidth = isCenter ? 110 : 90
            const nodeHeight = isCenter ? 44 : 36
            const radius = 6

            // Shadow
            if (isHovered || isCenter) {
                ctx.shadowColor = `${colors.bg}40`
                ctx.shadowBlur = 15
                ctx.shadowOffsetY = 4
            }

            // Draw rounded rectangle
            ctx.beginPath()
            ctx.roundRect(pos.x - nodeWidth / 2, pos.y - nodeHeight / 2, nodeWidth, nodeHeight, radius)
            ctx.fillStyle = colors.bg
            ctx.fill()
            ctx.strokeStyle = colors.border
            ctx.lineWidth = isHovered ? 3 : 2
            ctx.stroke()

            // Reset shadow
            ctx.shadowColor = 'transparent'
            ctx.shadowBlur = 0
            ctx.shadowOffsetY = 0

            // Title text
            ctx.fillStyle = colors.text
            ctx.font = `${isCenter ? '600' : '500'} ${isCenter ? 12 : 11}px Inter, system-ui, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            const title = node.title.length > 12 ? node.title.substring(0, 11) + '…' : node.title
            ctx.fillText(title, pos.x, pos.y - (isCenter ? 5 : 3))

            // Tag badge
            ctx.font = '500 9px Inter, system-ui, sans-serif'
            ctx.fillStyle = `${colors.text}99`
            const tag = node.tag.length > 12 ? node.tag.substring(0, 11) + '…' : node.tag
            ctx.fillText(tag, pos.x, pos.y + (isCenter ? 10 : 8))
        })

        // Restore context after zoom transform
        ctx.restore()

    }, [nodes, edges, nodePositions, hoveredNode, zoomLevel])


    // Redraw on position or zoom changes
    useEffect(() => {
        if (canvasRef.current && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            drawGraph(canvasRef.current, rect.width, rect.height)
        }
    }, [nodePositions, drawGraph, hoveredNode, zoomLevel])

    // Handle mouse events for dragging and hovering
    const getNodeAtPosition = useCallback((x: number, y: number): GraphNode | null => {
        for (const node of nodes) {
            const pos = nodePositions.get(node.id)
            if (!pos) continue
            const isCenter = node.group === 'center'
            const nodeWidth = isCenter ? 110 : 90
            const nodeHeight = isCenter ? 44 : 36

            if (x >= pos.x - nodeWidth / 2 && x <= pos.x + nodeWidth / 2 &&
                y >= pos.y - nodeHeight / 2 && y <= pos.y + nodeHeight / 2) {
                return node
            }
        }
        return null
    }, [nodes, nodePositions])

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const node = getNodeAtPosition(x, y)

        hasDragged.current = false // Reset on mousedown

        if (node) {
            const pos = nodePositions.get(node.id)
            if (pos) {
                setDraggedNode(node.id)
                setDragOffset({ x: x - pos.x, y: y - pos.y })
            }
        }
    }, [getNodeAtPosition, nodePositions])

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (draggedNode) {
            hasDragged.current = true // Mark that we actually dragged

            // Bounded dragging - keep nodes within container
            const padding = 70
            const newX = Math.max(padding, Math.min(rect.width - padding, x - dragOffset.x))
            const newY = Math.max(padding, Math.min(rect.height - padding, y - dragOffset.y))

            setNodePositions(prev => {
                const next = new Map(prev)
                next.set(draggedNode, { x: newX, y: newY })
                return next
            })
        } else {
            // Hover detection
            const node = getNodeAtPosition(x, y)
            setHoveredNode(node)
            setTooltipPos({ x: e.clientX, y: e.clientY })

            // Change cursor
            e.currentTarget.style.cursor = node ? 'pointer' : 'default'
        }
    }, [draggedNode, dragOffset, getNodeAtPosition])

    const handleMouseUp = useCallback(() => {
        setDraggedNode(null)
    }, [])

    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        // Don't navigate if we actually dragged
        if (hasDragged.current) {
            hasDragged.current = false
            return
        }

        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const node = getNodeAtPosition(x, y)

        if (node && node.group !== 'center') {
            const route = node.contentType === 'resource' ? '/resources/' : '/post/'
            window.location.href = `${route}${node.id}`
        }
    }, [getNodeAtPosition])

    const resetLayout = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const positions = calculatePositions(rect.width, rect.height)
            setNodePositions(positions)
        }
        setZoomLevel(0.85)
    }, [calculatePositions])

    const zoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev * 1.2, 2))
    }, [])

    const zoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(prev / 1.2, 0.4))
    }, [])

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                drawGraph(canvasRef.current, rect.width, rect.height)
            }
        }

        const observer = new ResizeObserver(handleResize)
        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [drawGraph])

    if (loading) {
        return (
            <div className="relative border border-dark-border rounded-xl overflow-hidden bg-[#0F1419] h-[400px] w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
        )
    }

    if (nodes.length <= 1) {
        return (
            <div className="relative border border-dark-border rounded-xl overflow-hidden bg-[#0F1419] h-[200px] w-full flex items-center justify-center">
                <p className="text-dark-text-muted text-sm">{t('noConnections')}</p>
            </div>
        )
    }

    return (
        <>
            <div
                ref={containerRef}
                className="relative border border-dark-border rounded-xl overflow-hidden bg-[#0F1419] h-[400px] w-full"
            >
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={handleClick}
                />

                {/* Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-[#1A2028]/95 backdrop-blur-md rounded-full border border-dark-border p-1.5 shadow-lg">
                    <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8 rounded-full text-dark-text-muted hover:text-dark-text hover:bg-dark-border/50" title="Zoom in">
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8 rounded-full text-dark-text-muted hover:text-dark-text hover:bg-dark-border/50" title="Zoom out">
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <div className="h-4 w-px bg-dark-border mx-1" />
                    <Button variant="ghost" size="icon" onClick={resetLayout} className="h-8 w-8 rounded-full text-dark-text-muted hover:text-dark-text hover:bg-dark-border/50" title="Reset layout">
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                    <div className="h-4 w-px bg-dark-border mx-1" />
                    <Button variant="ghost" size="icon" onClick={() => setExpanded(true)} className="h-8 w-8 rounded-full text-dark-text-muted hover:text-dark-text hover:bg-dark-border/50" title="Expand">
                        <Maximize2 className="w-4 h-4" />
                    </Button>
                </div>

                {/* Legend */}
                <div className="absolute top-3 right-3 z-10 bg-[#1A2028]/90 backdrop-blur-md rounded-lg border border-dark-border p-2 shadow-sm">
                    <div className="flex flex-wrap gap-2 text-[10px]">
                        {Object.entries(NODE_COLORS).slice(0, 4).map(([key, colors]) => (
                            <div key={key} className="flex items-center gap-1">
                                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: colors.bg }} />
                                <span className="text-dark-text-muted">
                                    {key === 'center' ? t('legend.center') :
                                        key === 'fork' ? t('legend.fork') :
                                            key === 'citation' ? t('legend.citation') :
                                                key === 'related' ? t('legend.topic') : key}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tooltip */}
                {hoveredNode && hoveredNode.group !== 'center' && (
                    <div
                        className="fixed z-50 pointer-events-none"
                        style={{ left: tooltipPos.x + 10, top: tooltipPos.y + 10 }}
                    >
                        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-xl p-3 min-w-[180px]">
                            <div className="text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
                                {RELATION_LABELS[edges.find(e => e.source === hoveredNode.id || e.target === hoveredNode.id)?.type || 'shared_tag']}
                            </div>
                            <div className="font-semibold text-sm text-text dark:text-dark-text">
                                {hoveredNode.title}
                            </div>
                            {hoveredNode.authorName && (
                                <div className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                                    {t('byAuthor', { author: hoveredNode.authorName })}
                                </div>
                            )}
                            <div className="text-xs text-secondary dark:text-secondary-light mt-1">
                                {hoveredNode?.contentType === 'resource' ? t('viewResource') : t('viewPost')} →
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Expanded Dialog */}
            <Dialog open={expanded} onOpenChange={setExpanded}>
                <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col p-0 gap-0 bg-[#0F1419] overflow-hidden">
                    <DialogHeader className="p-4 border-b border-dark-border flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-dark-text">{t('explorerTitle')}</DialogTitle>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 relative overflow-hidden bg-[#0F1419]">
                        <DialogGraphCanvas
                            nodes={nodes}
                            edges={edges}
                            calculatePositions={calculatePositions}
                            expanded={expanded}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
