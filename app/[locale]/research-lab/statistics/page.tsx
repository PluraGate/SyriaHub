import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ResearchLabNav } from '@/components/research-lab/ResearchLabNav'
import { StatisticsTools } from '@/components/research-lab/StatisticsTools'

export default async function StatisticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch user's saved analyses
    const { data: analyses } = user ? await supabase
        .from('dataset_analyses')
        .select('*')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5) : { data: null }

    // Fetch resources (datasets) for importing - only JSON/CSV files
    const { data: datasets } = await supabase
        .from('resources')
        .select('id, title, description, file_url, file_type, file_size')
        .in('file_type', ['application/json', 'text/csv', 'application/csv'])
        .order('created_at', { ascending: false })
        .limit(20)

    // Fetch user's surveys with response counts
    const { data: userSurveys } = user ? await supabase
        .from('surveys')
        .select(`
            id,
            title,
            response_count,
            status,
            created_at
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20) : { data: null }

    // Fetch user's polls with vote counts
    const { data: userPolls } = user ? await supabase
        .from('polls')
        .select(`
            id,
            question,
            options,
            total_votes,
            is_active,
            created_at
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20) : { data: null }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <div className="flex flex-1">
                {/* Sidebar - hidden on mobile */}
                <ResearchLabNav className="hidden md:flex" />

                {/* Main Content */}
                <main className="flex-1 container-custom py-8">
                    <StatisticsTools
                        userId={user?.id}
                        savedAnalyses={analyses || []}
                        availableDatasets={datasets || []}
                        userSurveys={userSurveys || []}
                        userPolls={userPolls || []}
                    />
                </main>
            </div>

            <Footer />
        </div>
    )
}

