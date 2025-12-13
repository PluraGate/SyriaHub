import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const postId = searchParams.get('id')
        const title = searchParams.get('title')
        const author = searchParams.get('author')
        const type = searchParams.get('type') || 'post'

        // If we have a post ID, fetch the data
        let postTitle = title || 'Syrealize'
        let postAuthor = author || 'Research Platform'
        let postType = type

        if (postId && !title) {
            const supabase = await createClient()
            const { data: post } = await supabase
                .from('posts')
                .select(`
          title,
          content_type,
          author:users!posts_author_id_fkey(name, email)
        `)
                .eq('id', postId)
                .single()

            if (post) {
                postTitle = post.title
                postType = post.content_type || 'article'
                postAuthor = (post.author as any)?.name || (post.author as any)?.email?.split('@')[0] || 'Anonymous'
            }
        }

        // Truncate title if too long
        const displayTitle = postTitle.length > 80 ? postTitle.substring(0, 77) + '...' : postTitle

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-end',
                        padding: '60px',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    {/* Background Pattern */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0.1,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* Logo/Brand */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50px',
                            left: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
                                <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span
                            style={{
                                fontSize: '28px',
                                fontWeight: 700,
                                color: 'white',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Syrealize
                        </span>
                    </div>

                    {/* Content Type Badge */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '20px',
                        }}
                    >
                        <div
                            style={{
                                padding: '8px 16px',
                                background: postType === 'question' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                borderRadius: '20px',
                                color: postType === 'question' ? '#fb923c' : '#a5b4fc',
                                fontSize: '16px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}
                        >
                            {postType === 'question' ? '❓ Question' : '📝 Article'}
                        </div>
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            fontSize: '56px',
                            fontWeight: 800,
                            color: 'white',
                            lineHeight: 1.2,
                            marginBottom: '24px',
                            letterSpacing: '-0.02em',
                            maxWidth: '90%',
                        }}
                    >
                        {displayTitle}
                    </div>

                    {/* Author */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '18px',
                                fontWeight: 600,
                            }}
                        >
                            {postAuthor.charAt(0).toUpperCase()}
                        </div>
                        <span
                            style={{
                                fontSize: '22px',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: 500,
                            }}
                        >
                            {postAuthor}
                        </span>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (error) {
        console.error('OG Image generation error:', error)

        // Fallback image
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    <div
                        style={{
                            fontSize: '64px',
                            fontWeight: 800,
                            color: 'white',
                        }}
                    >
                        Syrealize
                    </div>
                    <div
                        style={{
                            fontSize: '24px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginTop: '16px',
                        }}
                    >
                        Research Platform
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    }
}
