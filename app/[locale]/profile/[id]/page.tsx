import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/service'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
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

  // Fetch target user's preferences for privacy settings
  const { data: prefData } = await supabase
    .from('user_preferences')
    .select('preferences')
    .eq('user_id', params.id)
    .single()

  const privacySettings = prefData?.preferences?.privacy || {
    show_profile_public: true,
    show_email: false,
    allow_messages: true
  }

  const isOwnProfile = user?.id === params.id

  // Privacy Check: Block access if profile is private and viewer is not owner
  if (!privacySettings.show_profile_public && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-bg">
        <Navbar user={user} />
        <main className="container-custom max-w-4xl py-16 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-text dark:text-dark-text mb-2">
            This profile is private
          </h1>
          <p className="text-text-light dark:text-dark-text-muted mb-8">
            The user has chosen to keep their profile information private.
          </p>
          <Link
            href="/feed"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Feed
          </Link>
        </main>
        <Footer />
      </div>
    )
  }


  // Create a mutable copy of the profile to modify
  const displayProfile = { ...profile }

  // Handle Email Privacy: If user allows showing email but RLS hides it, fetch it via admin
  // We check displayProfile.email is missing to avoid redundant fetching if RLS allowed it
  if (privacySettings.show_email && !isOwnProfile && !displayProfile.email) {
    const supabaseAdmin = createAdminClient()
    const { data: userWithEmail } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', params.id)
      .single()

    if (userWithEmail?.email) {
      displayProfile.email = userWithEmail.email
    }
  }

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
          profile={displayProfile}
          stats={stats}
          badges={userBadges || []}
          isOwnProfile={isOwnProfile}
          privacySettings={privacySettings}
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

      <Footer />
    </div>
  )
}

