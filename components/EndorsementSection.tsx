'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SkillBadge } from './SkillBadge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Plus, ChevronDown, ChevronUp, Award, Users, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Endorser {
    id: string
    name: string | null
    avatar_url: string | null
}

interface UserSkill {
    skill_id: string
    skill_name: string
    skill_category: string
    is_recognized: boolean
    endorsement_count: number
    endorsers: Endorser[]
}

interface EndorsementSectionProps {
    userId: string
    isOwnProfile: boolean
}

const SKILL_CATEGORIES = [
    'Research Methods',
    'Technical',
    'Domain Knowledge',
    'Work Field',
    'Practical Expertise'
]

export function EndorsementSection({ userId, isOwnProfile }: EndorsementSectionProps) {
    const [skills, setSkills] = useState<UserSkill[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [endorsedSkills, setEndorsedSkills] = useState<Set<string>>(new Set())
    const [showAddSkill, setShowAddSkill] = useState(false)
    const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
    const [newSkillName, setNewSkillName] = useState('')
    const [newSkillCategory, setNewSkillCategory] = useState(SKILL_CATEGORIES[0])
    const [availableSkills, setAvailableSkills] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [addingSkill, setAddingSkill] = useState(false)
    const [loadingSkills, setLoadingSkills] = useState(false)

    const supabase = createClient()
    const { showToast } = useToast()

    // Load user skills and endorsements
    useEffect(() => {
        async function loadData() {
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser()
                setCurrentUserId(user?.id || null)

                // Get user's skills with endorsements
                const { data: userSkills, error } = await supabase
                    .rpc('get_user_endorsements', { p_user_id: userId })

                if (error && error.message) {
                    console.warn('Endorsements RPC unavailable, using fallback:', error.message)
                    // Fallback: load skills directly
                    const { data: fallbackSkills } = await supabase
                        .from('user_skills')
                        .select(`
                            skill_id,
                            skills(id, name, category, is_recognized)
                        `)
                        .eq('user_id', userId)

                    if (fallbackSkills) {
                        setSkills(fallbackSkills.map((us: any) => ({
                            skill_id: us.skill_id,
                            skill_name: us.skills?.name || 'Unknown',
                            skill_category: us.skills?.category || 'Other',
                            is_recognized: us.skills?.is_recognized || false,
                            endorsement_count: 0,
                            endorsers: []
                        })))
                    }
                } else if (userSkills) {
                    setSkills(userSkills)
                }

                // Check which skills current user has endorsed
                if (user && user.id !== userId) {
                    const { data: myEndorsements } = await supabase
                        .from('endorsements')
                        .select('skill_id')
                        .eq('endorser_id', user.id)
                        .eq('endorsed_user_id', userId)

                    if (myEndorsements) {
                        setEndorsedSkills(new Set(myEndorsements.map(e => e.skill_id)))
                    }
                }
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [userId, supabase])

    // Load available skills for adding
    useEffect(() => {
        if (!showAddSkill) return

        async function loadAvailableSkills() {
            setLoadingSkills(true)
            const { data } = await supabase
                .from('skills')
                .select('*')
                .order('is_recognized', { ascending: false })
                .order('name')

            if (data) {
                // Filter out skills user already has
                const userSkillIds = new Set(skills.map(s => s.skill_id))
                setAvailableSkills(data.filter(s => !userSkillIds.has(s.id)))
            }
            setLoadingSkills(false)
        }

        loadAvailableSkills()
    }, [showAddSkill, skills, supabase])

    const handleEndorse = async (skillId: string) => {
        if (!currentUserId || currentUserId === userId) return

        const hasEndorsed = endorsedSkills.has(skillId)

        try {
            if (hasEndorsed) {
                // Remove endorsement
                await supabase
                    .from('endorsements')
                    .delete()
                    .eq('endorser_id', currentUserId)
                    .eq('endorsed_user_id', userId)
                    .eq('skill_id', skillId)

                setEndorsedSkills(prev => {
                    const next = new Set(prev)
                    next.delete(skillId)
                    return next
                })
                setSkills(prev => prev.map(s =>
                    s.skill_id === skillId
                        ? { ...s, endorsement_count: Math.max(0, s.endorsement_count - 1) }
                        : s
                ))
                showToast('Endorsement removed', 'success')
            } else {
                // Add endorsement
                await supabase
                    .from('endorsements')
                    .insert({
                        endorser_id: currentUserId,
                        endorsed_user_id: userId,
                        skill_id: skillId
                    })

                setEndorsedSkills(prev => new Set([...prev, skillId]))
                setSkills(prev => prev.map(s =>
                    s.skill_id === skillId
                        ? { ...s, endorsement_count: s.endorsement_count + 1 }
                        : s
                ))
                showToast('Skill endorsed!', 'success')
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to update endorsement', 'error')
        }
    }

    const handleAddSkill = async (skillId: string) => {
        if (!currentUserId) return
        setAddingSkill(true)

        try {
            await supabase
                .from('user_skills')
                .insert({
                    user_id: userId,
                    skill_id: skillId
                })

            // Reload skills
            const skill = availableSkills.find(s => s.id === skillId)
            if (skill) {
                setSkills(prev => [...prev, {
                    skill_id: skill.id,
                    skill_name: skill.name,
                    skill_category: skill.category,
                    is_recognized: skill.is_recognized,
                    endorsement_count: 0,
                    endorsers: []
                }])
            }

            setShowAddSkill(false)
            setSearchQuery('')
            showToast('Skill added to your profile', 'success')

            // Notify ProfileCompletionCard to refresh
            window.dispatchEvent(new CustomEvent('profile-updated'))
        } catch (error: any) {
            showToast(error.message || 'Failed to add skill', 'error')
        } finally {
            setAddingSkill(false)
        }
    }

    const handleCreateAndAddSkill = async () => {
        if (!currentUserId || !newSkillName.trim()) return
        setAddingSkill(true)

        try {
            // Create skill using RPC function
            const { data: skillId, error } = await supabase
                .rpc('find_or_create_skill', {
                    p_name: newSkillName.trim(),
                    p_category: newSkillCategory,
                    p_created_by: currentUserId
                })

            if (error) throw error

            // Add to user's skills
            await supabase
                .from('user_skills')
                .insert({
                    user_id: userId,
                    skill_id: skillId
                })

            setSkills(prev => [...prev, {
                skill_id: skillId,
                skill_name: newSkillName.trim(),
                skill_category: newSkillCategory,
                is_recognized: false,
                endorsement_count: 0,
                endorsers: []
            }])

            setShowAddSkill(false)
            setNewSkillName('')
            showToast('Custom skill added', 'success')

            // Notify ProfileCompletionCard to refresh
            window.dispatchEvent(new CustomEvent('profile-updated'))
        } catch (error: any) {
            showToast(error.message || 'Failed to create skill', 'error')
        } finally {
            setAddingSkill(false)
        }
    }

    const handleRemoveSkill = async (skillId: string) => {
        if (!currentUserId) return

        try {
            await supabase
                .from('user_skills')
                .delete()
                .eq('user_id', userId)
                .eq('skill_id', skillId)

            setSkills(prev => prev.filter(s => s.skill_id !== skillId))
            showToast('Skill removed', 'success')
        } catch (error: any) {
            showToast(error.message || 'Failed to remove skill', 'error')
        }
    }

    // Group skills by category
    const skillsByCategory = skills.reduce<Record<string, UserSkill[]>>((acc, skill) => {
        const cat = skill.skill_category
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(skill)
        return acc
    }, {})

    // Filter available skills by search - show all when query is empty or partial match
    const searchTerm = (searchQuery || newSkillName).toLowerCase().trim()
    const filteredAvailableSkills = searchTerm
        ? availableSkills.filter(s => s.name.toLowerCase().includes(searchTerm))
        : availableSkills

    if (loading) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-dark-border rounded w-1/3"></div>
                    <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-dark-border rounded-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-text dark:text-dark-text">
                        Skills & Endorsements
                    </h3>
                    {skills.length > 0 && (
                        <span className="text-sm text-text-light dark:text-dark-text-muted">
                            ({skills.reduce((sum, s) => sum + s.endorsement_count, 0)} endorsements)
                        </span>
                    )}
                </div>
                {isOwnProfile && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddSkill(!showAddSkill)}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Skill
                    </Button>
                )}
            </div>

            {/* Add Skill Panel - Unified Autocomplete Design */}
            {showAddSkill && isOwnProfile && (
                <div className="mb-6 p-4 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <div className="space-y-3">
                        {/* Unified Search/Add Input */}
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    value={searchQuery || newSkillName}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setNewSkillName(e.target.value)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (searchQuery || newSkillName).trim()) {
                                            e.preventDefault()
                                            // If there are matching skills, add the first one
                                            if (filteredAvailableSkills.length > 0) {
                                                handleAddSkill(filteredAvailableSkills[0].id)
                                            } else {
                                                // No matches, create custom skill
                                                handleCreateAndAddSkill()
                                            }
                                        }
                                        if (e.key === 'Escape') {
                                            setShowAddSkill(false)
                                            setSearchQuery('')
                                            setNewSkillName('')
                                        }
                                    }}
                                    placeholder="Type a skill name..."
                                    autoFocus
                                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            {/* Autocomplete Dropdown - Shows immediately */}
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border shadow-lg overflow-hidden z-10 max-h-64 overflow-y-auto">
                                {loadingSkills ? (
                                    <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Loading skills...
                                    </div>
                                ) : filteredAvailableSkills.length > 0 ? (
                                    <>
                                        {filteredAvailableSkills.slice(0, 8).map((skill, index) => (
                                            <button
                                                key={skill.id}
                                                onClick={() => handleAddSkill(skill.id)}
                                                disabled={addingSkill}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors",
                                                    index === 0
                                                        ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-primary"
                                                        : "hover:bg-gray-50 dark:hover:bg-dark-bg"
                                                )}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Award className={cn(
                                                        "w-4 h-4",
                                                        skill.is_recognized
                                                            ? "text-primary"
                                                            : "text-gray-400 dark:text-gray-500"
                                                    )} />
                                                    <span className="font-medium text-text dark:text-dark-text">
                                                        {skill.name}
                                                    </span>
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-bg px-2 py-0.5 rounded">
                                                    {skill.category}
                                                </span>
                                            </button>
                                        ))}
                                        {filteredAvailableSkills.length > 8 && (
                                            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg text-center">
                                                +{filteredAvailableSkills.length - 8} more results
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* No matches - show create option */
                                    <div className="p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-light dark:text-dark-text-muted">
                                                No matching skills found
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleCreateAndAddSkill}
                                            disabled={addingSkill || !(searchQuery || newSkillName).trim()}
                                            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add "{(searchQuery || newSkillName).trim()}" as new skill
                                        </button>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Category:</span>
                                            <select
                                                value={newSkillCategory}
                                                onChange={(e) => setNewSkillCategory(e.target.value)}
                                                className="flex-1 h-8 text-xs rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg px-2"
                                            >
                                                {SKILL_CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Helper Text */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-gray-100 dark:bg-dark-border rounded text-center text-[10px] leading-4 font-mono">↵</span>
                            Press Enter to add • Esc to cancel
                        </p>
                    </div>
                </div>
            )}

            {/* Skills by Category */}
            {skills.length === 0 ? (
                <p className="text-text-light dark:text-dark-text-muted text-sm">
                    {isOwnProfile
                        ? 'Add skills to your profile so others can endorse you.'
                        : 'No skills added yet.'}
                </p>
            ) : (
                <div className="space-y-4">
                    {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                        <div key={category}>
                            <h4 className="text-xs font-medium text-text-light dark:text-dark-text-muted uppercase tracking-wide mb-2">
                                {category}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {catSkills.map(skill => (
                                    <div key={skill.skill_id} className="relative group">
                                        <SkillBadge
                                            skillId={skill.skill_id}
                                            name={skill.skill_name}
                                            category={skill.skill_category}
                                            isRecognized={skill.is_recognized}
                                            endorsementCount={skill.endorsement_count}
                                            hasEndorsed={endorsedSkills.has(skill.skill_id)}
                                            onEndorse={currentUserId ? () => handleEndorse(skill.skill_id) : undefined}
                                            isOwnProfile={isOwnProfile}
                                        />
                                        {/* Expand endorsers */}
                                        {skill.endorsement_count > 0 && (
                                            <button
                                                onClick={() => setExpandedSkill(
                                                    expandedSkill === skill.skill_id ? null : skill.skill_id
                                                )}
                                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                {expandedSkill === skill.skill_id
                                                    ? <ChevronUp className="w-3 h-3" />
                                                    : <ChevronDown className="w-3 h-3" />
                                                }
                                            </button>
                                        )}
                                        {/* Remove button for own profile */}
                                        {isOwnProfile && (
                                            <button
                                                onClick={() => handleRemoveSkill(skill.skill_id)}
                                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Expanded endorsers list */}
                            {catSkills.map(skill => (
                                expandedSkill === skill.skill_id && skill.endorsers.length > 0 && (
                                    <div key={`${skill.skill_id}-endorsers`} className="mt-3 p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                                            <span className="text-sm text-text-light dark:text-dark-text-muted">
                                                Endorsed by:
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {skill.endorsers.map((endorser: Endorser) => (
                                                <div
                                                    key={endorser.id}
                                                    className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-dark-surface rounded-full border border-gray-200 dark:border-dark-border"
                                                >
                                                    <UserAvatar
                                                        name={endorser.name}
                                                        avatarUrl={endorser.avatar_url}
                                                        size="sm"
                                                    />
                                                    <span className="text-sm text-text dark:text-dark-text">
                                                        {endorser.name || 'Anonymous'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
