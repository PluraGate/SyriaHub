import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { QuestionCard } from '@/components/QuestionCard'
import Link from 'next/link'
import { PlusCircle, Search } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function QuestionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const t = await getTranslations('Questions')

    const { data: questions } = await supabase
        .from('posts')
        .select(`
      *,
      author:users(name, email),
      comment_count:comments(count),
      tags
    `)
        .eq('content_type', 'question')
        .eq('status', 'published')
        .neq('approval_status', 'rejected')
        .order('created_at', { ascending: false })

    // Transform for QuestionCard
    const formattedQuestions = questions?.map(q => ({
        ...q,
        comment_count: q.comment_count?.[0]?.count || 0
    })) || []

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 container-custom py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-2">
                            {t('title')}
                        </h1>
                        <p className="text-text-light dark:text-dark-text-muted">
                            {t('subtitle')}
                        </p>
                    </div>

                    <Link
                        href="/questions/ask"
                        className="btn btn-primary flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="w-5 h-5" />
                        {t('askQuestion')}
                    </Link>
                </div>

                <div className="grid gap-6">
                    {formattedQuestions.length > 0 ? (
                        formattedQuestions.map((question) => (
                            <QuestionCard key={question.id} post={question} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">
                                {t('noQuestions')}
                            </h3>
                            <p className="text-text-light dark:text-dark-text-muted mb-6">
                                {t('noQuestionsDesc')}
                            </p>
                            <Link
                                href="/questions/ask"
                                className="btn btn-outline"
                            >
                                {t('askQuestion')}
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}

