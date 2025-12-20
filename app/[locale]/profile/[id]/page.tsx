import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { ProfileHeader } from '@/components/ProfileHeader'
import { EndorsementSection } from '@/components/EndorsementSection'
import { UserActivityFeed } from '@/components/UserActivityFeed'
import { ProfileCompletionCard } from '@/components/ProfileCompletionCard'

interface ProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile data - use select('*') to avoid column mismatch issues
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single()

  if (profileError) {
    console.error('Profile fetch error:', profileError)
    notFound()
  }

  if (!profile) {
    notFound()
  }

  // Fetch user stats
  const { data: stats } = await supabase
    .rpc('get_user_stats', { user_uuid: params.id })
    .single()

  // Fetch user badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', params.id)

  // Fetch user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', params.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // Fetch user's groups
  const { data: groupMembers } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', params.id)

  let groups: any[] = []
  if (groupMembers && groupMembers.length > 0) {
    const groupIds = groupMembers.map(gm => gm.group_id)
    const { data: groupsData } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds)
      .eq('visibility', 'public') // Only show public groups on profile

    groups = groupsData || []
  }

  const isOwnProfile = user?.id === params.id

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg overflow-x-hidden">
      <Navbar user={user} />

      {/* Back Navigation */}
      <div className="border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
        <div className="container-custom max-w-6xl py-4">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Link>
        </div>
      </div>

      <main className="container-custom max-w-6xl py-8">
        <ProfileHeader
          profile={profile}
          stats={stats}
          badges={userBadges || []}
          isOwnProfile={isOwnProfile}
        />

        {/* Skills & Endorsements Section */}
        <div className="mb-8">
          <EndorsementSection
            userId={params.id}
            isOwnProfile={isOwnProfile}
          />
        </div>

        {/* Profile Completion - only show on own profile */}
        {isOwnProfile && (
          <div className="mb-8">
            <ProfileCompletionCard userId={params.id} />
          </div>
        )}

        <UserActivityFeed
          posts={posts || []}
          groups={groups}
        />
      </main>
    </div>
  )
}

