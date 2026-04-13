import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // revalidate every hour

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function stripMarkdown(content: string): string {
    return content
        .replace(/[#*_`\[\]]/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
        .trim()
}

export async function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syriahub.org'
    const supabase = await createClient()

    const { data: posts } = await supabase
        .from('posts')
        .select(`
            id,
            slug,
            title,
            content,
            content_type,
            tags,
            created_at,
            updated_at,
            author:users!posts_author_id_fkey(name)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(50)

    const items = (posts || []).map((post) => {
        const author = (post.author as { name?: string } | null)?.name || 'Anonymous'
        const link = `${siteUrl}/en/post/${post.slug || post.id}`
        const description = stripMarkdown(post.content || '').substring(0, 500)
        const categories = (post.tags || [])
            .map((tag: string) => `        <category>${escapeXml(tag)}</category>`)
            .join('\n')

        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(author)}</dc:creator>
      <description>${escapeXml(description)}</description>
${categories}
    </item>`
    }).join('\n')

    const lastBuildDate = posts?.[0]
        ? new Date(posts[0].created_at).toUTCString()
        : new Date().toUTCString()

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SyriaHub – Open Knowledge for Reconstruction</title>
    <link>${siteUrl}</link>
    <description>Research-driven platform for architecture, urbanism, data, and post-conflict reconstruction.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    })
}
