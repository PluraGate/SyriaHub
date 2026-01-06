
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Try to load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
// Also try standard .env as fallback
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const levels = [
    // Bronze Tier (1-10)
    { level: 1, name: 'Newcomer', tier: 'bronze', xp_required: 0, perks: ['Basic profile'], color: 'bg-amber-700' },
    { level: 2, name: 'Explorer', tier: 'bronze', xp_required: 100, perks: ['Can comment'], color: 'bg-amber-700' },
    { level: 3, name: 'Learner', tier: 'bronze', xp_required: 250, perks: ['Extended bio'], color: 'bg-amber-700' },
    { level: 4, name: 'Curious', tier: 'bronze', xp_required: 450, perks: ['Custom avatar'], color: 'bg-amber-700' },
    { level: 5, name: 'Engaged', tier: 'bronze', xp_required: 700, perks: ['Profile banner'], color: 'bg-amber-700' },
    { level: 6, name: 'Active', tier: 'bronze', xp_required: 1000, perks: ['Featured tag'], color: 'bg-amber-600' },
    { level: 7, name: 'Regular', tier: 'bronze', xp_required: 1350, perks: ['Invite boost +1'], color: 'bg-amber-600' },
    { level: 8, name: 'Dedicated', tier: 'bronze', xp_required: 1750, perks: ['Early access'], color: 'bg-amber-600' },
    { level: 9, name: 'Committed', tier: 'bronze', xp_required: 2200, perks: ['Priority support'], color: 'bg-amber-600' },
    { level: 10, name: 'Established', tier: 'bronze', xp_required: 2700, perks: ['Bronze badge'], color: 'bg-amber-600' },

    // Silver Tier (11-25)
    { level: 11, name: 'Rising Star', tier: 'silver', xp_required: 3300, perks: ['Silver frame'], color: 'bg-gray-400' },
    { level: 12, name: 'Contributor', tier: 'silver', xp_required: 4000, perks: ['Custom theme'], color: 'bg-gray-400' },
    { level: 13, name: 'Influencer', tier: 'silver', xp_required: 4800, perks: ['Highlight posts'], color: 'bg-gray-400' },
    { level: 14, name: 'Mentor', tier: 'silver', xp_required: 5700, perks: ['Mentorship badge'], color: 'bg-gray-400' },
    { level: 15, name: 'Leader', tier: 'silver', xp_required: 6700, perks: ['Create groups'], color: 'bg-gray-400' },
    { level: 16, name: 'Expert', tier: 'silver', xp_required: 7800, perks: ['Verified status'], color: 'bg-gray-400' },
    { level: 17, name: 'Specialist', tier: 'silver', xp_required: 9000, perks: ['Research tools'], color: 'bg-gray-400' },
    { level: 18, name: 'Authority', tier: 'silver', xp_required: 10300, perks: ['Featured profile'], color: 'bg-gray-400' },
    { level: 19, name: 'Innovator', tier: 'silver', xp_required: 11700, perks: ['Beta features'], color: 'bg-gray-400' },
    { level: 20, name: 'Pioneer', tier: 'silver', xp_required: 13200, perks: ['Silver badge'], color: 'bg-gray-400' },
    { level: 21, name: 'Trailblazer', tier: 'silver', xp_required: 14800, perks: ['Invite boost +2'], color: 'bg-gray-400' },
    { level: 22, name: 'Veteran', tier: 'silver', xp_required: 16500, perks: ['Custom flair'], color: 'bg-gray-400' },
    { level: 23, name: 'Sage', tier: 'silver', xp_required: 18300, perks: ['Sage title'], color: 'bg-gray-400' },
    { level: 24, name: 'Guardian', tier: 'silver', xp_required: 20200, perks: ['Guardian badge'], color: 'bg-gray-400' },
    { level: 25, name: 'Champion', tier: 'silver', xp_required: 22200, perks: ['Champion title'], color: 'bg-gray-400' },

    // Gold Tier (26-40)
    { level: 26, name: 'Gold Member', tier: 'gold', xp_required: 24300, perks: ['Gold frame'], color: 'bg-yellow-500' },
    { level: 27, name: 'Distinguished', tier: 'gold', xp_required: 26500, perks: ['Profile spotlight'], color: 'bg-yellow-500' },
    { level: 28, name: 'Renowned', tier: 'gold', xp_required: 28800, perks: ['Featured content'], color: 'bg-yellow-500' },
    { level: 29, name: 'Celebrated', tier: 'gold', xp_required: 31200, perks: ['Celebration badge'], color: 'bg-yellow-500' },
    { level: 30, name: 'Acclaimed', tier: 'gold', xp_required: 33700, perks: ['Annual recap'], color: 'bg-yellow-500' },
    { level: 31, name: 'Illustrious', tier: 'gold', xp_required: 36300, perks: ['Invite boost +3'], color: 'bg-yellow-500' },
    { level: 32, name: 'Prestigious', tier: 'gold', xp_required: 39000, perks: ['VIP events'], color: 'bg-yellow-500' },
    { level: 33, name: 'Eminent', tier: 'gold', xp_required: 41800, perks: ['Custom emoji'], color: 'bg-yellow-500' },
    { level: 34, name: 'Prominent', tier: 'gold', xp_required: 44700, perks: ['Mod powers lite'], color: 'bg-yellow-500' },
    { level: 35, name: 'Notable', tier: 'gold', xp_required: 47700, perks: ['Gold badge'], color: 'bg-yellow-500' },
    { level: 36, name: 'Esteemed', tier: 'gold', xp_required: 50800, perks: ['Esteemed title'], color: 'bg-yellow-500' },
    { level: 37, name: 'Honored', tier: 'gold', xp_required: 54000, perks: ['Honor badge'], color: 'bg-yellow-500' },
    { level: 38, name: 'Revered', tier: 'gold', xp_required: 57300, perks: ['Revered frame'], color: 'bg-yellow-500' },
    { level: 39, name: 'Exalted', tier: 'gold', xp_required: 60700, perks: ['Exalted title'], color: 'bg-yellow-500' },
    { level: 40, name: 'Legendary', tier: 'gold', xp_required: 64200, perks: ['Legend status'], color: 'bg-yellow-500' },

    // Platinum Tier (41-50)
    { level: 41, name: 'Platinum Elite', tier: 'platinum', xp_required: 67800, perks: ['Platinum frame'], color: 'bg-purple-500' },
    { level: 42, name: 'Grandmaster', tier: 'platinum', xp_required: 71500, perks: ['Grandmaster title'], color: 'bg-purple-500' },
    { level: 43, name: 'Virtuoso', tier: 'platinum', xp_required: 75300, perks: ['Virtuoso badge'], color: 'bg-purple-500' },
    { level: 44, name: 'Luminary', tier: 'platinum', xp_required: 79200, perks: ['Hall of fame'], color: 'bg-purple-500' },
    { level: 45, name: 'Paragon', tier: 'platinum', xp_required: 83200, perks: ['Paragon title'], color: 'bg-purple-500' },
    { level: 46, name: 'Transcendent', tier: 'platinum', xp_required: 87300, perks: ['Unique effects'], color: 'bg-purple-500' },
    { level: 47, name: 'Mythical', tier: 'platinum', xp_required: 91500, perks: ['Mythic frame'], color: 'bg-purple-500' },
    { level: 48, name: 'Immortal', tier: 'platinum', xp_required: 95800, perks: ['Immortal badge'], color: 'bg-purple-500' },
    { level: 49, name: 'Eternal', tier: 'platinum', xp_required: 100200, perks: ['Eternal flame'], color: 'bg-purple-500' },
    { level: 50, name: 'Apex', tier: 'platinum', xp_required: 104700, perks: ['Apex crown', 'All perks'], color: 'bg-purple-500' }
]

const achievements = [
    // Contribution achievements
    { name: 'First Steps', description: 'Create your first post', icon: 'footprints', category: 'contribution', criteria: { type: 'post_count', threshold: 1 }, xp_reward: 25 },
    { name: 'Prolific Writer', description: 'Create 10 posts', icon: 'pen-tool', category: 'contribution', criteria: { type: 'post_count', threshold: 10 }, xp_reward: 100 },
    { name: 'Author Extraordinaire', description: 'Create 50 posts', icon: 'book-open', category: 'contribution', criteria: { type: 'post_count', threshold: 50 }, xp_reward: 500 },
    { name: 'Thought Leader', description: 'Create 100 posts', icon: 'lightbulb', category: 'contribution', criteria: { type: 'post_count', threshold: 100 }, xp_reward: 1000 },

    // Community achievements
    { name: 'Helpful Hand', description: 'Have 5 answers accepted as solutions', icon: 'hand-helping', category: 'community', criteria: { type: 'solution_count', threshold: 5 }, xp_reward: 150 },
    { name: 'Community Pillar', description: 'Have 25 answers accepted as solutions', icon: 'award', category: 'community', criteria: { type: 'solution_count', threshold: 25 }, xp_reward: 500 },
    { name: 'Solution Master', description: 'Have 100 answers accepted as solutions', icon: 'trophy', category: 'community', criteria: { type: 'solution_count', threshold: 100 }, xp_reward: 2000 },
    { name: 'Discussion Starter', description: 'Start 10 discussions with 5+ replies', icon: 'message-circle', category: 'community', criteria: { type: 'discussions_started', threshold: 10 }, xp_reward: 150 },
    { name: 'Team Player', description: 'Join 3 groups', icon: 'users', category: 'community', criteria: { type: 'groups_joined', threshold: 3 }, xp_reward: 75 },

    // Expertise achievements
    { name: 'Rising Star', description: 'Reach 100 reputation points', icon: 'star', category: 'expertise', criteria: { type: 'reputation_score', threshold: 100 }, xp_reward: 50 },
    { name: 'Expert', description: 'Reach 500 reputation points', icon: 'medal', category: 'expertise', criteria: { type: 'reputation_score', threshold: 500 }, xp_reward: 200 },
    { name: 'Master', description: 'Reach 2000 reputation points', icon: 'crown', category: 'expertise', criteria: { type: 'reputation_score', threshold: 2000 }, xp_reward: 750 },
    { name: 'Popular Voice', description: 'Get 100 total upvotes on your content', icon: 'thumbs-up', category: 'expertise', criteria: { type: 'total_upvotes', threshold: 100 }, xp_reward: 150 },
    { name: 'Influencer', description: 'Get 500 total upvotes on your content', icon: 'trending-up', category: 'expertise', criteria: { type: 'total_upvotes', threshold: 500 }, xp_reward: 500 },

    // Engagement achievements  
    { name: 'Consistent Contributor', description: '7-day login streak', icon: 'flame', category: 'special', criteria: { type: 'login_streak', threshold: 7 }, xp_reward: 100 },
    { name: 'Dedicated Member', description: '30-day login streak', icon: 'zap', category: 'special', criteria: { type: 'login_streak', threshold: 30 }, xp_reward: 500 },
    { name: 'Survey Master', description: 'Complete 10 surveys', icon: 'clipboard-check', category: 'special', criteria: { type: 'surveys_completed', threshold: 10 }, xp_reward: 100 },
    { name: 'Profile Pro', description: 'Complete your profile 100%', icon: 'user-check', category: 'special', criteria: { type: 'profile_complete', threshold: 100 }, xp_reward: 50 },
    { name: 'Early Adopter', description: 'Joined during beta phase', icon: 'rocket', category: 'special', criteria: { type: 'early_adopter' }, xp_reward: 200 },
    { name: 'Inviter', description: 'Successfully invite 5 new members', icon: 'user-plus', category: 'special', criteria: { type: 'invites_used', threshold: 5 }, xp_reward: 150 }
]

async function seed() {
    console.log('Seeding user_levels...')
    const { error: errorLevels } = await supabase
        .from('user_levels')
        .upsert(levels, { onConflict: 'level' })

    if (errorLevels) {
        console.error('Error seeding levels:', errorLevels)
    } else {
        console.log('User levels seeded successfully')
    }

    console.log('Seeding achievements...')
    const { error: errorAchievements } = await supabase
        .from('achievements')
        .upsert(achievements, { onConflict: 'name' })

    if (errorAchievements) {
        console.error('Error seeding achievements:', errorAchievements)
    } else {
        console.log('Achievements seeded successfully')
    }
}

seed()
