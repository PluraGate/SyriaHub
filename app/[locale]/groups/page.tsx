import Link from 'next/link'
import { Plus, Users, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { GroupCard } from '@/components/GroupCard'
import { getTranslations } from 'next-intl/server'

export default async function GroupsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const t = await getTranslations('Groups')

    // Fetch user's groups
    const { data: myGroups } = await supabase
        .from('groups')
        .select(`
      *,
      members:group_members(count)
    `)
        .eq('group_members.user_id', user?.id) // This filter needs a join, but Supabase simple client might not support deep filtering easily on M:N without view or RPC. 
    // Actually, for M:N via join table, we usually query the join table.
    // Let's try a different approach: fetch group_members for this user, then fetch groups.
    // OR use the !inner join syntax if supported.

    // Simpler approach for now:
    // 1. Get group_ids from group_members
    // 2. Fetch groups with those IDs

    // Let's try the direct join first, if it fails we fallback.
    // Actually, supabase-js supports !inner on foreign tables to filter parent.
    // .select('*, group_members!inner(*)') .eq('group_members.user_id', user.id)

    let myGroupsData: any[] = []

    if (user) {
        const { data } = await supabase
            .from('groups')
            .select(`
        id,
        name,
        description,
        visibility,
        group_members!inner(user_id)
      `)
            .eq('group_members.user_id', user.id)

        // We also need member counts for these groups. 
        // It's often better to create a view or use a separate query for counts if performance matters.
        // For now, let's fetch counts separately or assume we can get them.
        // Actually, let's just fetch all public groups for "Discover" and filter "My Groups" in memory if dataset is small, 
        // or use proper queries.

        // Let's refine the query to get what we need for the card.
        // We need: id, name, description, visibility, member_count.

        // Query for My Groups
        const { data: myGroupsResult } = await supabase
            .from('groups')
            .select(`
            id,
            name,
            description,
            visibility,
            group_members!inner(user_id)
        `)
            .eq('group_members.user_id', user.id)

        if (myGroupsResult) {
            // Now fetch member counts for these groups
            const groupIds = myGroupsResult.map(g => g.id)
            if (groupIds.length > 0) {
                const { data: counts } = await supabase
                    .from('group_members')
                    .select('group_id')
                    .in('group_id', groupIds)

                // Aggregate counts
                const countMap = new Map()
                counts?.forEach(c => {
                    countMap.set(c.group_id, (countMap.get(c.group_id) || 0) + 1)
                })

                myGroupsData = myGroupsResult.map(g => ({
                    ...g,
                    member_count: countMap.get(g.id) || 0
                }))
            }
        }
    }

    // Fetch Discover Groups (Public groups not joined by user)
    // This is tricky in one query. Let's just fetch public groups and filter out joined ones in JS for MVP.
    const { data: publicGroups } = await supabase
        .from('groups')
        .select('id, name, description, visibility')
        .eq('visibility', 'public')
        .limit(20)

    // Calculate counts for public groups
    let discoverGroupsData: any[] = []
    if (publicGroups) {
        const publicIds = publicGroups.map(g => g.id)
        // Filter out groups user is already in
        const myGroupIds = new Set(myGroupsData.map(g => g.id))
        const filteredPublic = publicGroups.filter(g => !myGroupIds.has(g.id))

        if (filteredPublic.length > 0) {
            const { data: counts } = await supabase
                .from('group_members')
                .select('group_id')
                .in('group_id', filteredPublic.map(g => g.id))

            const countMap = new Map()
            counts?.forEach(c => {
                countMap.set(c.group_id, (countMap.get(c.group_id) || 0) + 1)
            })

            discoverGroupsData = filteredPublic.map(g => ({
                ...g,
                member_count: countMap.get(g.id) || 0
            }))
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="container-custom max-w-6xl py-12">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-2">
                            {t('title')}
                        </h1>
                        <p className="text-text-light dark:text-dark-text-muted max-w-2xl">
                            {t('subtitle')}
                        </p>
                    </div>

                    <Link
                        href="/groups/create"
                        className="btn btn-primary flex-shrink-0"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('createGroup')}
                    </Link>
                </div>

                {/* My Groups Section */}
                {user && (
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="w-5 h-5 text-primary dark:text-accent-light" />
                            <h2 className="text-xl font-display font-semibold text-text dark:text-dark-text">
                                {t('myGroups')}
                            </h2>
                        </div>

                        {myGroupsData.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {myGroupsData.map((group) => (
                                    <GroupCard key={group.id} group={group} />
                                ))}
                            </div>
                        ) : (
                            <div className="card p-8 text-center bg-gray-50 dark:bg-dark-surface/50 border-dashed">
                                <p className="text-text-light dark:text-dark-text-muted mb-4">
                                    {t('noGroupsDesc')}
                                </p>
                                <Link href="/groups/create" className="text-primary hover:underline font-medium">
                                    {t('createGroup')}
                                </Link>
                            </div>
                        )}
                    </section>
                )}

                {/* Discover Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Search className="w-5 h-5 text-primary dark:text-accent-light" />
                        <h2 className="text-xl font-display font-semibold text-text dark:text-dark-text">
                            {t('discoverGroups')}
                        </h2>
                    </div>

                    {discoverGroupsData.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {discoverGroupsData.map((group) => (
                                <GroupCard key={group.id} group={group} />
                            ))}
                        </div>
                    ) : (
                        <div className="card p-8 text-center">
                            <p className="text-text-light dark:text-dark-text-muted">
                                {t('noGroups')}
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

