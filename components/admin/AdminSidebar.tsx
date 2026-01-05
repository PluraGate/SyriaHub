'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    BarChart3,
    FileText,
    AlertTriangle,
    Tag,
    UserPlus,
    History,
    ChevronLeft,
    ChevronRight,
    MessageSquareWarning,
    MessagesSquare,
    Search,
    MessageSquarePlus,
    Shield,
    BookOpen,
    Activity,
    Database, // Added Database icon
    Settings // Added Settings icon
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

interface AdminSidebarProps {
    className?: string
}

const navItems = [
    {
        label: 'Overview',
        href: '/admin',
        icon: LayoutDashboard,
        exact: true
    },
    {
        label: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        label: 'Platform Health',
        href: '/admin/platform-health',
        icon: Activity,
    },
    {
        label: 'Search Analytics',
        href: '/admin/search-analytics',
        icon: Search,
    },
    {
        label: 'Schema Registry', // Added new navigation item
        href: '/admin/schema',
        icon: Database,
        adminOnly: true,
    },
    {
        label: 'Settings', // Added new navigation item
        href: '/admin/settings',
        icon: Settings,
        adminOnly: true,
    },
    {
        label: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        label: 'Content',
        href: '/admin/content',
        icon: FileText,
    },
    {
        label: 'Reports',
        href: '/admin/reports',
        icon: AlertTriangle,
    },
    {
        label: 'Appeals',
        href: '/admin/appeals',
        icon: MessageSquareWarning,
    },
    {
        label: 'Tags',
        href: '/admin/tags',
        icon: Tag,
    },

    {
        label: 'Waitlist',
        href: '/admin/waitlist',
        icon: UserPlus,
        adminOnly: true,
    },
    {
        label: 'Coordination',
        href: '/admin/coordination',
        icon: MessagesSquare,
    },
    {
        label: 'Feedback',
        href: '/admin/feedback',
        icon: MessageSquarePlus,
    },
    {
        label: 'Governance',
        href: '/admin/governance',
        icon: Shield,
        adminOnly: true,
    },
    {
        label: 'Audit Logs',
        href: '/admin/audit',
        icon: History,
        adminOnly: true,
    },
    {
        label: 'Precedents',
        href: '/admin/precedents',
        icon: BookOpen,
    },
]

export function AdminSidebar({ className }: AdminSidebarProps) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [userRole, setUserRole] = useState<'admin' | 'moderator' | null>(null)
    const supabase = useMemo(() => createClient(), [])
    const t = useTranslations('Admin')

    // Fetch current user's role
    useEffect(() => {
        async function fetchRole() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                if (data && (data.role === 'admin' || data.role === 'moderator')) {
                    setUserRole(data.role)
                }
            }
        }
        fetchRole()
    }, [supabase])

    // Remove locale prefix from pathname for comparison
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')

    const isActive = (href: string, exact?: boolean) => {
        if (exact) {
            return pathWithoutLocale === href
        }
        return pathWithoutLocale.startsWith(href)
    }

    // Filter items based on user role
    const filteredNavItems = navItems.filter(item => {
        if (item.adminOnly && userRole !== 'admin') return false
        return true
    })

    const panelTitle = userRole === 'admin' ? t('adminPanel') : t('moderation')

    return (
        <aside
            className={cn(
                'bg-white dark:bg-dark-surface border-e border-gray-200 dark:border-dark-border',
                'transition-all duration-300 ease-in-out flex flex-col',
                'sticky top-[65px] h-[calc(100vh-65px)] overflow-hidden self-start',
                collapsed ? 'w-16' : 'w-64',
                className
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                {!collapsed && (
                    <h2 className="font-display font-semibold text-primary dark:text-dark-text">
                        {panelTitle}
                    </h2>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border text-text-light dark:text-dark-text-muted transition-colors"
                    title={collapsed ? t('expand') : t('collapse')}
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {filteredNavItems.map((item) => {
                    const active = isActive(item.href, item.exact)
                    const Icon = item.icon
                    // Map label to translation key
                    const keyMap: Record<string, string> = {
                        'Overview': 'overview',
                        'Analytics': 'analytics',
                        'Platform Health': 'platformHealth',
                        'Search Analytics': 'searchAnalytics',
                        'Schema Registry': 'schemaregistry',
                        'Settings': 'settings',
                        'Users': 'users',
                        'Content': 'content',
                        'Reports': 'reports',
                        'Appeals': 'appeals',
                        'Tags': 'tags',
                        'Waitlist': 'waitlist',
                        'Coordination': 'coordination',
                        'Feedback': 'feedback',
                        'Governance': 'governance',
                        'Audit Logs': 'auditLog',
                        'Precedents': 'precedents'
                    }
                    const translationKey = keyMap[item.label] || item.label.toLowerCase().replace(/\s+/g, '')
                    const label = t(translationKey) || item.label

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                active
                                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-dark-text font-medium'
                                    : 'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border hover:text-text dark:hover:text-dark-text'
                            )}
                            title={collapsed ? label : undefined}
                        >
                            <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-primary dark:text-dark-text')} />
                            {!collapsed && <span>{label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-dark-border">
                <Link
                    href="/feed"
                    className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                        'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border transition-colors'
                    )}
                >
                    <ChevronLeft className="w-4 h-4" />
                    {!collapsed && <span>{t('backToSite')}</span>}
                </Link>
            </div>
        </aside>
    )
}
