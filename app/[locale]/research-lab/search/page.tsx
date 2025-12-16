import { ResearchSearchEngine } from '@/components/research-lab/ResearchSearchEngine'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ResearchLabNav } from '@/components/research-lab/ResearchLabNav'
import { redirect } from 'next/navigation'

export default async function ResearchSearchPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <div className="flex flex-1 overflow-x-hidden">
                {/* Sidebar - collapsed icons at md, full at xl */}
                <div className="hidden md:block shrink-0">
                    <ResearchLabNav />
                </div>

                {/* Main Content */}
                <main className="flex-1 min-w-0 container-custom py-8">
                    <ResearchSearchEngine />
                </main>
            </div>

            <Footer />
        </div>
    )
}

export const metadata = {
    title: 'Search Engine | Syrealize Research Lab',
    description: 'Discipline-aware, evidence-first search with explainable results for Syria reconstruction research.'
}
