// Redirect from old messages route to new correspondence system
import { redirect } from 'next/navigation'

export default async function MessagesPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale } = await params
    // Note: Direct user messaging is no longer supported.
    // Users should use "Request Clarification" on posts instead.
    redirect(`/${locale}/correspondence`)
}
