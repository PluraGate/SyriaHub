import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 })
    }

    try {
        const supabase = await createClient()

        // 1. Fetch resource metadata
        const { data: post, error } = await supabase
            .from('posts')
            .select('id, metadata')
            .eq('id', id)
            .single()

        if (error || !post) {
            console.error('Download error: Resource not found', error)
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
        }

        const metadata = post.metadata || {}
        const fileUrl = metadata.url
        const originalName = metadata.original_name || 'download'

        if (!fileUrl) {
            return NextResponse.json({ error: 'File URL not found' }, { status: 404 })
        }

        // 2. Increment download count
        // Create a new independent object for the update to avoid type issues with JSONB
        // We cast to any to allow partial update structure if needed, but standard update is safer
        const currentDownloads = typeof metadata.downloads === 'number' ? metadata.downloads : 0
        const newDownloads = currentDownloads + 1

        const updatedMetadata = {
            ...metadata,
            downloads: newDownloads
        }

        await supabase
            .from('posts')
            .update({
                metadata: updatedMetadata
            })
            .eq('id', id)

        // 3. Generate Signed URL with Content-Disposition for renaming
        // Extract storage path from the public URL
        // Expected format: .../storage/v1/object/public/resources/<path>
        let storagePath = ''
        try {
            const urlObj = new URL(fileUrl)
            const resourcesIndex = urlObj.pathname.indexOf('/resources/')
            if (resourcesIndex !== -1) {
                storagePath = urlObj.pathname.substring(resourcesIndex + '/resources/'.length)
            }
        } catch (e) {
            console.error('Error parsing file URL', e)
        }

        if (storagePath) {
            const cleanPath = decodeURIComponent(storagePath)

            const { data: signedData, error: signedError } = await supabase
                .storage
                .from('resources')
                .createSignedUrl(cleanPath, 60, {
                    download: originalName
                })

            if (!signedError && signedData?.signedUrl) {
                return NextResponse.redirect(signedData.signedUrl)
            } else {
                console.error('Error creating signed URL', signedError)
                // Fallback to original URL
                return NextResponse.redirect(fileUrl)
            }
        }

        // Fallback
        return NextResponse.redirect(fileUrl)

    } catch (err) {
        console.error('Download handler error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
