import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ResearchLabNav } from '@/components/research-lab/ResearchLabNav'
import { QuestionAdvisor } from '@/components/research-lab/QuestionAdvisor'

export default async function QuestionAdvisorPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check AI usage limits
    let usageLimits = null
    if (user) {
        const { data } = await supabase.rpc('check_ai_usage_limit', {
            p_user_id: user.id,
            p_feature: 'question_advisor'
        })
        usageLimits = data?.[0]
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <div className="flex flex-1">
                {/* Sidebar - hidden on mobile */}
                <div className="hidden lg:block">
                    <ResearchLabNav />
                </div>

                {/* Main Content */}
                <main className="flex-1 container-custom py-8">
                    <QuestionAdvisor
                        userId={user?.id}
                        usageLimits={usageLimits}
                    />
                </main>
            </div>

            <Footer />
        </div>
    )
}
