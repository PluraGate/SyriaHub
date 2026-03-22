'use client'

/**
 * Lazy-loaded wrappers for heavy client components.
 *
 * These use next/dynamic with ssr:false to keep the initial JS bundle lean.
 * Each component is code-split into its own chunk and loaded on demand.
 *
 * Usage:  import { LazyKnowledgeGraph } from '@/components/lazy'
 */

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// ── Shared loading fallback ──────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface animate-pulse">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  )
}

// ── Knowledge Graph (1 147 lines, canvas-heavy) ──────────────────

export const LazyKnowledgeGraph = dynamic(
  () => import('@/components/KnowledgeGraph').then(m => ({ default: m.KnowledgeGraph })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

// ── PostCharts (recharts) ────────────────────────────────────────

export const LazyPostCharts = dynamic(
  () => import('@/components/PostCharts').then(m => ({ default: m.PostCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

// ── ChartBlock (recharts — used in editor) ───────────────────────

export const LazyChartBlock = dynamic(
  () => import('@/components/ChartBlock').then(m => ({ default: m.ChartBlock })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export const LazyChartBlockDisplay = dynamic(
  () => import('@/components/ChartBlock').then(m => ({ default: m.ChartBlockDisplay })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

// ── StatisticsTools (recharts — research lab) ────────────────────

export const LazyStatisticsTools = dynamic(
  () => import('@/components/research-lab/StatisticsTools').then(m => ({ default: m.StatisticsTools })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

// ── AnalyticsDashboard (recharts — admin) ────────────────────────

export const LazyAnalyticsDashboard = dynamic(
  () => import('@/components/admin/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

// ── PlatformHealthDashboard (recharts — admin) ──────────────────

export const LazyPlatformHealthDashboard = dynamic(
  () => import('@/components/admin/PlatformHealthDashboard').then(m => ({ default: m.PlatformHealthDashboard })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)
