import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syrealize.com'
    const supabase = await createClient()

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${siteUrl}/feed`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${siteUrl}/explore`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${siteUrl}/groups`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${siteUrl}/auth/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${siteUrl}/auth/signup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]

    // Fetch all published posts
    const { data: posts } = await supabase
        .from('posts')
        .select('id, updated_at, created_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(1000)

    const postPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
        url: `${siteUrl}/post/${post.id}`,
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    // Fetch all public groups
    const { data: groups } = await supabase
        .from('groups')
        .select('id, updated_at, created_at')
        .eq('visibility', 'public')
        .order('updated_at', { ascending: false })
        .limit(500)

    const groupPages: MetadataRoute.Sitemap = (groups || []).map((group) => ({
        url: `${siteUrl}/groups/${group.id}`,
        lastModified: new Date(group.updated_at || group.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
    }))

    // Fetch user profiles (only those with posts)
    const { data: users } = await supabase
        .from('users')
        .select('id, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(1000)

    const profilePages: MetadataRoute.Sitemap = (users || []).map((user) => ({
        url: `${siteUrl}/profile/${user.id}`,
        lastModified: new Date(user.updated_at || user.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.4,
    }))

    return [...staticPages, ...postPages, ...groupPages, ...profilePages]
}
