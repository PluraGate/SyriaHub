import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ResourceCard } from '@/components/ResourceCard'
import Link from 'next/link'
import { UploadCloud } from 'lucide-react'

export default async function ResourcesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: resources } = await supabase
        .from('posts')
        .select(`
      *,
      author:users(name, email)
    `)
        .eq('content_type', 'resource')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 container-custom py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-2">
                            Resource Library
                        </h1>
                        <p className="text-text-light dark:text-dark-text-muted">
                            Access datasets, reports, and tools shared by the community.
                        </p>
                    </div>

                    <Link
                        href="/resources/upload"
                        className="btn btn-primary flex items-center justify-center gap-2"
                    >
                        <UploadCloud className="w-5 h-5" />
                        Upload Resource
                    </Link>
                </div>

                <div className="grid gap-6">
                    {resources && resources.length > 0 ? (
                        resources.map((resource: any) => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">
                                No resources yet
                            </h3>
                            <p className="text-text-light dark:text-dark-text-muted mb-6">
                                Be the first to share a resource!
                            </p>
                            <Link
                                href="/resources/upload"
                                className="btn btn-outline"
                            >
                                Upload Resource
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
