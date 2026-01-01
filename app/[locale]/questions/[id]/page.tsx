import { redirect } from 'next/navigation'

export default async function QuestionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    redirect(`/post/${id}`)
}
