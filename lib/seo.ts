/**
 * Centralized SEO Library
 * 
 * JSON-LD schema builders and metadata helpers for SyriaHub.
 * All SEO generation is centralized here so contributors can't break SEO.
 */

import React from 'react'
import { Metadata } from 'next'

// =============================================================================
// Types
// =============================================================================

export interface PostForSEO {
    id: string
    title: string
    content: string
    content_type: string
    tags?: string[]
    created_at: string
    updated_at?: string | null
    author?: { name?: string; email?: string } | null
    license?: string | null
}

export interface AnswerForSEO {
    id: string
    content: string
    author?: { name?: string; email?: string } | null
    is_accepted?: boolean
    created_at: string
}

export interface ResourceForSEO {
    id: string
    slug?: string | null
    title: string
    content: string
    created_at: string
    updated_at?: string | null
    author?: { name?: string; email?: string; avatar_url?: string | null } | null
    metadata?: {
        url?: string
        license?: string
        resource_type?: string
        size?: number
        downloads?: number
    } | null
    tags?: string[]
}

export interface ProfileForSEO {
    id: string
    name?: string | null
    email?: string | null
    bio?: string | null
    affiliation?: string | null
    avatar_url?: string | null
}

// =============================================================================
// Helpers
// =============================================================================

function getAuthorName(author?: { name?: string; email?: string } | null): string {
    return author?.name || author?.email?.split('@')[0] || 'Anonymous'
}

function truncateDescription(content: string, maxLength: number = 155): string {
    if (!content) return 'Published on SyriaHub'
    const cleaned = content.replace(/[#*_`\[\]]/g, '').trim()
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength - 3) + '...' : cleaned
}

function getSiteUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://syrealize.com'
}

// =============================================================================
// JSON-LD Schema Builders
// =============================================================================

/**
 * Build Article or ScholarlyArticle schema for posts
 */
export function buildArticleSchema(
    post: PostForSEO,
    options: {
        type?: 'Article' | 'ScholarlyArticle'
        siteUrl?: string
    } = {}
): object {
    const { type = 'Article', siteUrl = getSiteUrl() } = options
    const authorName = getAuthorName(post.author)

    return {
        '@context': 'https://schema.org',
        '@type': type,
        'headline': post.title,
        'description': truncateDescription(post.content),
        'author': {
            '@type': 'Person',
            'name': authorName
        },
        'datePublished': post.created_at,
        'dateModified': post.updated_at || post.created_at,
        'publisher': {
            '@type': 'Organization',
            'name': 'SyriaHub',
            'url': siteUrl
        },
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `${siteUrl}/post/${post.id}`
        },
        ...(post.tags?.length ? { 'keywords': post.tags.join(', ') } : {}),
        ...(post.license ? { 'license': post.license } : {})
    }
}

/**
 * Build QAPage schema for questions WITH answers
 * Only use this when answers exist, otherwise use Article
 */
export function buildQAPageSchema(
    question: PostForSEO,
    answers: AnswerForSEO[],
    options: { siteUrl?: string } = {}
): object {
    const { siteUrl = getSiteUrl() } = options
    const authorName = getAuthorName(question.author)

    const acceptedAnswer = answers.find(a => a.is_accepted)
    const suggestedAnswers = answers.filter(a => !a.is_accepted)

    return {
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        'mainEntity': {
            '@type': 'Question',
            'name': question.title,
            'text': truncateDescription(question.content, 500),
            'author': {
                '@type': 'Person',
                'name': authorName
            },
            'dateCreated': question.created_at,
            'answerCount': answers.length,
            ...(acceptedAnswer ? {
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': truncateDescription(acceptedAnswer.content, 500),
                    'author': {
                        '@type': 'Person',
                        'name': getAuthorName(acceptedAnswer.author)
                    },
                    'dateCreated': acceptedAnswer.created_at
                }
            } : {}),
            ...(suggestedAnswers.length > 0 ? {
                'suggestedAnswer': suggestedAnswers.slice(0, 3).map(a => ({
                    '@type': 'Answer',
                    'text': truncateDescription(a.content, 500),
                    'author': {
                        '@type': 'Person',
                        'name': getAuthorName(a.author)
                    },
                    'dateCreated': a.created_at
                }))
            } : {})
        }
    }
}

/**
 * Build Dataset schema for resources
 */
export function buildDatasetSchema(
    resource: ResourceForSEO,
    options: { siteUrl?: string } = {}
): object {
    const { siteUrl = getSiteUrl() } = options
    const authorName = getAuthorName(resource.author)
    const url = `${siteUrl}/resources/${resource.slug || resource.id}`

    return {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        'name': resource.title,
        'description': truncateDescription(resource.content),
        'creator': {
            '@type': 'Person',
            'name': authorName
        },
        'datePublished': resource.created_at,
        'dateModified': resource.updated_at || resource.created_at,
        'url': url,
        'identifier': resource.id,
        ...(resource.metadata?.license ? { 'license': resource.metadata.license } : {}),
        ...(resource.metadata?.url ? {
            'distribution': {
                '@type': 'DataDownload',
                'contentUrl': resource.metadata.url,
                'encodingFormat': resource.metadata.resource_type || 'application/octet-stream'
            }
        } : {}),
        ...(resource.tags?.length ? { 'keywords': resource.tags.join(', ') } : {})
    }
}

/**
 * Build Person schema for profiles
 */
export function buildPersonSchema(
    profile: ProfileForSEO,
    options: { siteUrl?: string } = {}
): object {
    const { siteUrl = getSiteUrl() } = options
    const name = profile.name || 'Researcher'

    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': name,
        'url': `${siteUrl}/profile/${profile.id}`,
        ...(profile.bio ? { 'description': truncateDescription(profile.bio) } : {}),
        ...(profile.affiliation ? { 'affiliation': { '@type': 'Organization', 'name': profile.affiliation } } : {}),
        ...(profile.avatar_url ? { 'image': profile.avatar_url } : {})
    }
}

// =============================================================================
// Metadata Builders
// =============================================================================

/**
 * Build Next.js Metadata for posts
 */
export function buildPostMetadata(
    post: PostForSEO,
    options: { siteUrl?: string } = {}
): Metadata {
    const { siteUrl = getSiteUrl() } = options
    const authorName = getAuthorName(post.author)
    const description = truncateDescription(post.content)
    const url = `${siteUrl}/post/${post.id}`
    const ogImageUrl = `${siteUrl}/api/og?id=${post.id}`

    return {
        title: `${post.title} | SyriaHub`,
        description,
        authors: [{ name: authorName }],
        keywords: post.tags || [],
        openGraph: {
            title: post.title,
            description,
            type: 'article',
            url,
            images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
            siteName: 'SyriaHub'
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description,
            images: [ogImageUrl]
        },
        alternates: {
            canonical: url
        }
    }
}

/**
 * Build Next.js Metadata for resources
 */
export function buildResourceMetadata(
    resource: ResourceForSEO,
    options: { siteUrl?: string } = {}
): Metadata {
    const { siteUrl = getSiteUrl() } = options
    const authorName = getAuthorName(resource.author)
    const description = resource.content
        ? truncateDescription(resource.content)
        : 'Research resource published on SyriaHub'
    const url = `${siteUrl}/resources/${resource.slug || resource.id}`

    return {
        title: `${resource.title} | SyriaHub Resources`,
        description,
        authors: [{ name: authorName }],
        keywords: resource.tags || [],
        openGraph: {
            title: resource.title,
            description,
            type: 'article',
            url,
            siteName: 'SyriaHub'
        },
        twitter: {
            card: 'summary',
            title: resource.title,
            description
        },
        alternates: {
            canonical: url
        }
    }
}

/**
 * Build Next.js Metadata for profiles
 */
export function buildProfileMetadata(
    profile: ProfileForSEO,
    options: { siteUrl?: string } = {}
): Metadata {
    const { siteUrl = getSiteUrl() } = options
    const name = profile.name || 'Researcher'
    const description = profile.bio
        ? truncateDescription(profile.bio)
        : `${name} on SyriaHub - Research Platform`
    const url = `${siteUrl}/profile/${profile.id}`

    return {
        title: `${name} | SyriaHub`,
        description,
        openGraph: {
            title: `${name} | SyriaHub`,
            description,
            type: 'profile',
            url,
            siteName: 'SyriaHub',
            ...(profile.avatar_url ? { images: [{ url: profile.avatar_url }] } : {})
        },
        twitter: {
            card: 'summary',
            title: name,
            description
        },
        alternates: {
            canonical: url
        }
    }
}

// =============================================================================
// JSON-LD Component Helper
// =============================================================================

/**
 * Renders JSON-LD as a script tag for use in Next.js pages
 * Usage: <JsonLdScript data={buildArticleSchema(post)} />
 */
export function JsonLdScript({ data }: { data: object }): React.ReactElement {
    return React.createElement('script', {
        type: 'application/ld+json',
        dangerouslySetInnerHTML: { __html: JSON.stringify(data) }
    })
}

