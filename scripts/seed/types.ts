// ─── Seed Types ──────────────────────────────────────────────────────────────
// Shared TypeScript interfaces for the SyriaHub seed content system.
// Each seed item is bilingual (EN + AR); the runner inserts two DB rows per item.

export interface LocalisedContent {
  title: string
  content: string // markdown
}

export interface SeedPost {
  en: LocalisedContent
  ar: LocalisedContent
  tags: string[]
  content_type: 'article' | 'question' | 'resource'
  status: 'published'
  /** Key into ImageMap. Both EN and AR versions share the same cover image. */
  cover_image_key: string | null
  /** Additional metadata merged with { locale } at insert time. */
  metadata?: Record<string, unknown>
}

export interface SeedResearchGap {
  en: { title: string; description: string }
  ar: { title: string; description: string }
  discipline: string
  tags: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  gap_type: 'topical' | 'data' | 'methodological' | 'population' | 'outdated'
  is_strategic: boolean
  spatial_context?: string
  temporal_context_start?: string  // ISO date, e.g. '2011-03-01'
  temporal_context_end?: string | null
}

/**
 * Map of symbolic image keys → absolute local file paths.
 * Set a value to null to skip cover image upload for that key.
 * Edit scripts/seed/image-map.ts before running the seeder.
 */
export type ImageMap = Record<string, string | null>
