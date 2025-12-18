import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')
    const format = searchParams.get('format') || 'markdown'

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch the post with author
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        tags,
        created_at,
        updated_at,
        content_type,
        license,
        author:users!posts_author_id_fkey(name, email)
      `)
      .eq('id', postId)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const authorName = (post.author as any)?.name || (post.author as any)?.email?.split('@')[0] || 'Anonymous'
    const publishedDate = new Date(post.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    if (format === 'markdown') {
      // Generate Markdown export
      const markdown = generateMarkdown(post, authorName, publishedDate)

      return new NextResponse(markdown, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${sanitizeFilename(post.title)}.md"`,
        },
      })
    } else if (format === 'json') {
      // Generate JSON export
      const json = {
        title: post.title,
        author: authorName,
        content: post.content,
        tags: post.tags || [],
        publishedAt: post.created_at,
        updatedAt: post.updated_at,
        contentType: post.content_type,
        license: post.license,
        exportedAt: new Date().toISOString(),
      }

      return NextResponse.json(json, {
        headers: {
          'Content-Disposition': `attachment; filename="${sanitizeFilename(post.title)}.json"`,
        },
      })
    } else if (format === 'html') {
      // Generate HTML export
      const html = generateHTML(post, authorName, publishedDate)

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${sanitizeFilename(post.title)}.html"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format. Use markdown, json, or html.' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export post' }, { status: 500 })
  }
}

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
}

function generateMarkdown(post: any, authorName: string, publishedDate: string): string {
  const tags = post.tags?.length ? post.tags.map((t: string) => `#${t}`).join(' ') : ''

  return `---
title: "${post.title}"
author: "${authorName}"
date: "${publishedDate}"
type: "${post.content_type || 'article'}"
license: "${post.license || 'CC-BY-4.0'}"
tags: [${post.tags?.map((t: string) => `"${t}"`).join(', ') || ''}]
---

# ${post.title}

**Author:** ${authorName}  
**Published:** ${publishedDate}  
${tags ? `**Tags:** ${tags}` : ''}

---

${post.content}

---

*Exported from [SyriaHub](https://syriahub.com) on ${new Date().toLocaleDateString()}*
`
}

function generateHTML(post: any, authorName: string, publishedDate: string): string {
  const tags = post.tags?.length
    ? post.tags.map((t: string) => `<span class="tag">#${t}</span>`).join(' ')
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} - SyriaHub</title>
  <style>
    :root {
      --primary: #6366f1;
      --text: #1a1a2e;
      --text-light: #64748b;
      --bg: #ffffff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
      color: var(--text);
      background: var(--bg);
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    .meta {
      color: var(--text-light);
      font-size: 0.875rem;
    }
    .meta span { margin-right: 1rem; }
    .tags { margin-top: 0.75rem; }
    .tag {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #f1f5f9;
      border-radius: 9999px;
      font-size: 0.75rem;
      color: var(--primary);
      margin-right: 0.5rem;
    }
    article {
      font-size: 1.125rem;
    }
    article h2 { margin-top: 2rem; margin-bottom: 1rem; }
    article p { margin-bottom: 1rem; }
    article ul, article ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    article code {
      background: #f1f5f9;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.875em;
    }
    article pre {
      background: #1a1a2e;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin-bottom: 1rem;
    }
    article blockquote {
      border-left: 4px solid var(--primary);
      padding-left: 1rem;
      color: var(--text-light);
      font-style: italic;
      margin-bottom: 1rem;
    }
    footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
      color: var(--text-light);
      font-size: 0.875rem;
      text-align: center;
    }
    a { color: var(--primary); }
  </style>
</head>
<body>
  <header>
    <h1>${post.title}</h1>
    <div class="meta">
      <span><strong>Author:</strong> ${authorName}</span>
      <span><strong>Published:</strong> ${publishedDate}</span>
    </div>
    ${tags ? `<div class="tags">${tags}</div>` : ''}
  </header>
  <article>
    ${convertMarkdownToBasicHTML(post.content)}
  </article>
  <footer>
    <p>Exported from <a href="https://syriahub.com">SyriaHub</a> on ${new Date().toLocaleDateString()}</p>
    <p>License: ${post.license || 'CC-BY-4.0'}</p>
  </footer>
</body>
</html>`
}

function convertMarkdownToBasicHTML(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match
      return `<p>${match}</p>`
    })
    // Clean up
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6]>)/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
}
