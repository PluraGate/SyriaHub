import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ResearchLabNav } from '@/components/research-lab/ResearchLabNav'
import { SurveyBuilder } from '@/components/research-lab/SurveyBuilder'
import { redirect } from 'next/navigation'

export default async function CreateSurveyPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <div className="flex flex-1">
                {/* Sidebar - hidden on mobile */}
                <ResearchLabNav className="hidden md:flex" />

                {/* Main Content */}
                <main className="flex-1 container-custom py-8">
                    <SurveyBuilder userId={user.id} />
                </main>
            </div>

            <Footer />
        </div>
    )
}
