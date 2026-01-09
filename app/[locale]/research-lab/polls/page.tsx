import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ResearchLabNav } from '@/components/research-lab/ResearchLabNav'
import { PollsList } from '@/components/research-lab/PollsList'

export default async function PollsPage({
    searchParams
}: {
    searchParams: Promise<{ create?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch polls - active ones and user's own (including closed)
    let pollsQuery = supabase
        .from('polls')
        .select(`
            *,
            author:users!author_id(name, email)
        `)
        .order('created_at', { ascending: false })

    // If user is logged in, show active polls OR their own polls
    if (user) {
        pollsQuery = pollsQuery.or(`is_active.eq.true,author_id.eq.${user.id}`)
    } else {
        pollsQuery = pollsQuery.eq('is_active', true)
    }

    const { data: polls } = await pollsQuery

    // Fetch user's votes
    const userVotes: Record<string, string[]> = {}
    if (user) {
        const { data: votes } = await supabase
            .from('poll_votes')
            .select('poll_id, option_ids')
            .eq('user_id', user.id)

        if (votes) {
            votes.forEach((vote: any) => {
                userVotes[vote.poll_id] = vote.option_ids
            })
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <div className="flex flex-1">
                {/* Sidebar - hidden on mobile */}
                <ResearchLabNav className="hidden md:flex" />

                {/* Main Content */}
                <main className="flex-1 container-custom py-8">
                    <PollsList
                        polls={polls || []}
                        userVotes={userVotes}
                        userId={user?.id}
                        showCreate={params.create === 'true'}
                    />
                </main>
            </div>

            <Footer />
        </div>
    )
}
