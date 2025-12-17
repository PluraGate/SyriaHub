'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import {
    BookOpen,
    Target,
    Shield,
    Settings,
    Users,
    HelpCircle,
    Lock,
    FileText,
    ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AboutLayoutProps {
    children: React.ReactNode
    user?: {
        id: string
        email?: string
        user_metadata?: {
            avatar_url?: string
            full_name?: string
            name?: string
        }
    } | null
}

const navigationItems = [
    { href: '/about', icon: BookOpen, key: 'overview' },
    { href: '/about/mission', icon: Target, key: 'mission' },
    { href: '/about/ethics', icon: Shield, key: 'ethics' },
    { href: '/about/methodology', icon: Settings, key: 'methodology' },
    { href: '/about/roles', icon: Users, key: 'roles' },
    { href: '/about/faq', icon: HelpCircle, key: 'faq' },
    { href: '/about/privacy', icon: Lock, key: 'privacy' },
    { href: '/about/terms', icon: FileText, key: 'terms' },
]

export function AboutLayout({ children, user }: AboutLayoutProps) {
    const t = useTranslations('About')
    const pathname = usePathname()

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-primary dark:text-dark-text mb-2">
                            {t('title')}
                        </h1>
                        <p className="text-text-muted dark:text-dark-text-muted">
                            {t('subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="w-full lg:w-64 flex-shrink-0">
                            <nav className="bg-white dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-4 sticky top-24">
                                <ul className="space-y-1">
                                    {navigationItems.map((item) => {
                                        const Icon = item.icon
                                        const isActive = pathname === item.href ||
                                            (item.href !== '/about' && pathname.startsWith(item.href))
                                        const isExactActive = pathname === item.href

                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                                        isExactActive
                                                            ? 'bg-primary text-white'
                                                            : isActive
                                                                ? 'bg-primary/10 text-primary dark:text-secondary'
                                                                : 'text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border'
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                                    <span>{t(`navigation.${item.key}`)}</span>
                                                    {isActive && !isExactActive && (
                                                        <ChevronRight className="w-4 h-4 ms-auto" />
                                                    )}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </nav>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                            <article className="bg-white dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6 lg:p-8">
                                {children}
                            </article>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
