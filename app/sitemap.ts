import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const locales = ['en', 'ar'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syriahub.org'
    const supabase = await createClient()

    // Helper: generate entries for all locales with alternates
    function localizedEntry(
        path: string,
        lastModified: Date,
        changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
        priority: number,
    ): MetadataRoute.Sitemap {
        return locales.map((locale) => ({
            url: `${siteUrl}/${locale}${path}`,
            lastModified,
            changeFrequency,
            priority,
            alternates: {
                languages: Object.fromEntries(
                    locales.map((l) => [l, `${siteUrl}/${l}${path}`])
                ),
            },
        }))
    }

    // Static pages - auth pages deliberately excluded for crawl budget
    const staticPages: MetadataRoute.Sitemap = [
        ...localizedEntry('', new Date(), 'daily', 1),
        ...localizedEntry('/explore', new Date(), 'daily', 0.8),
        ...localizedEntry('/insights', new Date(), 'daily', 0.8),
        ...localizedEntry('/groups', new Date(), 'daily', 0.7),
        ...localizedEntry('/resources', new Date(), 'daily', 0.7),
        ...localizedEntry('/events', new Date(), 'weekly', 0.7),
        ...localizedEntry('/research-gaps', new Date(), 'weekly', 0.6),
    ]

    // Fetch all published posts (non-resource) with slugs
    const { data: posts } = await supabase
        .from('posts')
        .select('id, slug, updated_at, created_at')
        .eq('status', 'published')
        .neq('content_type', 'resource')
        .order('updated_at', { ascending: false })
        .limit(1000)

    const postPages: MetadataRoute.Sitemap = (posts || []).flatMap((post) =>
        localizedEntry(
            `/post/${post.slug || post.id}`,
            new Date(post.updated_at || post.created_at),
            'weekly',
            0.6,
        )
    )

    // Fetch all published resources (with slugs)
    const { data: resources } = await supabase
        .from('posts')
        .select('id, slug, updated_at, created_at')
        .eq('status', 'published')
        .eq('content_type', 'resource')
        .order('updated_at', { ascending: false })
        .limit(1000)

    const resourcePages: MetadataRoute.Sitemap = (resources || []).flatMap((resource) =>
        localizedEntry(
            `/resources/${resource.slug || resource.id}`,
            new Date(resource.updated_at || resource.created_at),
            'weekly',
            0.6,
        )
    )

    // Fetch all public groups
    const { data: groups } = await supabase
        .from('groups')
        .select('id, updated_at, created_at')
        .eq('visibility', 'public')
        .order('updated_at', { ascending: false })
        .limit(500)

    const groupPages: MetadataRoute.Sitemap = (groups || []).flatMap((group) =>
        localizedEntry(
            `/groups/${group.id}`,
            new Date(group.updated_at || group.created_at),
            'weekly',
            0.5,
        )
    )

    // Fetch user profiles
    const { data: users } = await supabase
        .from('users')
        .select('id, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(1000)

    const profilePages: MetadataRoute.Sitemap = (users || []).flatMap((user) =>
        localizedEntry(
            `/profile/${user.id}`,
            new Date(user.updated_at || user.created_at),
            'weekly',
            0.4,
        )
    )

    return [...staticPages, ...postPages, ...resourcePages, ...groupPages, ...profilePages]
}
