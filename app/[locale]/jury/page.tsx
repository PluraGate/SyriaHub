import { JuryPanel } from '@/components/JuryPanel'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Scale, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function JuryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user is eligible for jury duty
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    const isEligible = ['admin', 'moderator', 'researcher'].includes(userData?.role || '')

    if (!isEligible) {
        return (
            <main className="min-h-screen bg-background dark:bg-dark-bg py-8 px-4">
                <div className="max-w-2xl mx-auto text-center py-12">
                    <Scale className="w-16 h-16 mx-auto mb-4 text-text-light/50" />
                    <h1 className="text-2xl font-bold mb-2">Not Eligible for Jury Duty</h1>
                    <p className="text-text-light mb-6">
                        Jury duty is only available for researchers, moderators, and admins.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background dark:bg-dark-bg py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <Link
                        href="/admin"
                        className="text-text-light hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <Scale className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold">Jury Panel</h1>
                </div>

                {/* Info box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
                    <h2 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                        About Jury Review
                    </h2>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                        As a jury member, you help ensure fair decisions on content appeals.
                        Your vote is anonymous until the deliberation concludes. A 2/3 majority
                        is required to reach a decision. Please review each case carefully and
                        provide thoughtful reasoning for your vote.
                    </p>
                </div>

                <JuryPanel userId={user.id} />
            </div>
        </main>
    )
}

export const metadata = {
    title: 'Jury Panel | Syrealize',
    description: 'Review and vote on content appeals as part of the decentralized moderation jury.'
}
