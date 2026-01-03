import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { afterAll, describe, expect, it } from 'vitest'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const hasDbConfig = Boolean(supabaseUrl && serviceRoleKey)

function createAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase env vars for counter audit tests')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

async function getAuditMismatches(supabase: ReturnType<typeof createAdminClient>) {
  const { data, error } = await supabase.rpc('audit_counter_mismatches')
  if (error) {
    throw error
  }
  return data || []
}

async function expectAuditClean(supabase: ReturnType<typeof createAdminClient>) {
  const mismatches = await getAuditMismatches(supabase)
  expect(mismatches, JSON.stringify(mismatches, null, 2)).toEqual([])
}

async function waitForUserProfile(supabase: ReturnType<typeof createAdminClient>, userId: string) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (data?.id) {
      return
    }

    await new Promise(resolve => setTimeout(resolve, 100))
  }

  throw new Error(`Timed out waiting for public.users row for ${userId}`)
}

describe('counter audit', () => {
  if (!hasDbConfig) {
    it.skip('requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY', () => {})
    return
  }

  const supabase = createAdminClient()
  const createdUserIds: string[] = []

  afterAll(async () => {
    await Promise.all(
      createdUserIds.map(async (userId) => {
        await supabase.auth.admin.deleteUser(userId)
      })
    )
  })

  it('returns no mismatches in current database', async () => {
    await expectAuditClean(supabase)
  })

  it('stays consistent after mutations', async () => {
    const runId = crypto.randomUUID().slice(0, 8)
    const password = 'TestPassword123!'

    const { data: userA, error: userAError } = await supabase.auth.admin.createUser({
      email: `counter-audit-a-${runId}@example.com`,
      password,
      email_confirm: true,
    })
    if (userAError || !userA.user) {
      throw userAError || new Error('Failed to create test user A')
    }

    const { data: userB, error: userBError } = await supabase.auth.admin.createUser({
      email: `counter-audit-b-${runId}@example.com`,
      password,
      email_confirm: true,
    })
    if (userBError || !userB.user) {
      throw userBError || new Error('Failed to create test user B')
    }

    createdUserIds.push(userA.user.id, userB.user.id)

    await waitForUserProfile(supabase, userA.user.id)
    await waitForUserProfile(supabase, userB.user.id)

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .insert([
        {
          title: `Audit Article ${runId}`,
          content: 'Counter audit article content.',
          author_id: userA.user.id,
          status: 'published',
          content_type: 'article',
        },
        {
          title: `Audit Event ${runId}`,
          content: 'Counter audit event content.',
          author_id: userA.user.id,
          status: 'published',
          content_type: 'event',
        },
        {
          title: `Audit Source ${runId}`,
          content: 'Counter audit source content.',
          author_id: userB.user.id,
          status: 'published',
          content_type: 'article',
        },
      ])
      .select('id, author_id, content_type')

    if (postsError || !posts || posts.length < 3) {
      throw postsError || new Error('Failed to create test posts')
    }

    const articlePost = posts.find(p => p.author_id === userA.user.id && p.content_type === 'article')
    const eventPost = posts.find(p => p.author_id === userA.user.id && p.content_type === 'event')
    const sourcePost = posts.find(p => p.author_id === userB.user.id && p.content_type === 'article')

    if (!articlePost || !eventPost || !sourcePost) {
      throw new Error('Failed to resolve test posts for audit')
    }

    const { error: commentsError } = await supabase
      .from('comments')
      .insert([
        {
          content: 'Audit comment A.',
          post_id: articlePost.id,
          user_id: userA.user.id,
        },
        {
          content: 'Audit comment B.',
          post_id: articlePost.id,
          user_id: userB.user.id,
        },
      ])

    if (commentsError) {
      throw commentsError
    }

    const { error: followsError } = await supabase
      .from('follows')
      .insert({
        follower_id: userB.user.id,
        following_id: userA.user.id,
      })

    if (followsError) {
      throw followsError
    }

    const { error: citationError } = await supabase
      .from('citations')
      .insert({
        source_post_id: sourcePost.id,
        target_post_id: articlePost.id,
      })

    if (citationError) {
      throw citationError
    }

    const { error: votesError } = await supabase
      .from('post_votes')
      .insert([
        {
          post_id: articlePost.id,
          voter_id: userA.user.id,
          value: 1,
        },
        {
          post_id: articlePost.id,
          voter_id: userB.user.id,
          value: -1,
        },
      ])

    if (votesError) {
      throw votesError
    }

    const pollOptions = [
      { id: `opt-${runId}-a`, text: 'Option A', vote_count: 0 },
      { id: `opt-${runId}-b`, text: 'Option B', vote_count: 0 },
    ]

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        question: `Audit poll ${runId}`,
        author_id: userA.user.id,
        options: pollOptions,
        is_multiple_choice: true,
        is_active: true,
      })
      .select('id')
      .single()

    if (pollError || !poll) {
      throw pollError || new Error('Failed to create test poll')
    }

    const { error: pollVotesError } = await supabase
      .from('poll_votes')
      .insert([
        {
          poll_id: poll.id,
          user_id: userA.user.id,
          option_ids: [pollOptions[0].id],
        },
        {
          poll_id: poll.id,
          user_id: userB.user.id,
          option_ids: [pollOptions[0].id, pollOptions[1].id],
        },
      ])

    if (pollVotesError) {
      throw pollVotesError
    }

    const { data: gap, error: gapError } = await supabase
      .from('research_gaps')
      .insert({
        title: `Audit gap ${runId}`,
        description: 'Counter audit gap description.',
        created_by: userA.user.id,
      })
      .select('id')
      .single()

    if (gapError || !gap) {
      throw gapError || new Error('Failed to create test research gap')
    }

    const { error: gapUpvoteError } = await supabase
      .from('research_gap_upvotes')
      .insert({
        gap_id: gap.id,
        user_id: userB.user.id,
      })

    if (gapUpvoteError) {
      throw gapUpvoteError
    }

    await expectAuditClean(supabase)
  })
})
