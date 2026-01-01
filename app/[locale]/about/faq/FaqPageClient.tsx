'use client'

import { useTranslations } from 'next-intl'
import { AboutLayout } from '@/components/AboutLayout'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FaqPageClientProps {
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

export function FaqPageClient({ user }: FaqPageClientProps) {
    const t = useTranslations('Faq')
    const tAbout = useTranslations('About')
    const [openItems, setOpenItems] = useState<string[]>([])

    const toggleItem = (key: string) => {
        setOpenItems(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        )
    }

    const faqItems = [
        'whatIsSyriaHub',
        'howToJoin',
        'whatCanIPost',
        'howModeration',
        'canIEdit',
        'whatAreRoles',
        'howToBecome',
        'isContentFree'
    ]

    const categories = [
        { key: 'gettingStarted', items: ['whatIsSyriaHub', 'howToJoin'] },
        { key: 'content', items: ['whatCanIPost', 'canIEdit'] },
        { key: 'community', items: ['howModeration', 'whatAreRoles', 'howToBecome'] },
        { key: 'account', items: ['isContentFree'] }
    ]

    return (
        <AboutLayout user={user}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-6 flex items-center gap-3">
                    <HelpCircle className="w-7 h-7" />
                    {tAbout('faqTitle')}
                </h2>

                <div className="not-prose space-y-8">
                    {categories.map((category) => (
                        <div key={category.key}>
                            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4">
                                {t(`categories.${category.key}`)}
                            </h3>
                            <div className="space-y-2">
                                {category.items.map((itemKey) => {
                                    const isOpen = openItems.includes(itemKey)
                                    return (
                                        <div
                                            key={itemKey}
                                            className="border border-border dark:border-dark-border rounded-lg overflow-hidden"
                                        >
                                            <button
                                                onClick={() => toggleItem(itemKey)}
                                                className="w-full flex items-center justify-between p-4 text-start bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                            >
                                                <span className="font-medium text-text dark:text-dark-text">
                                                    {t(`questions.${itemKey}.q`)}
                                                </span>
                                                <ChevronDown
                                                    className={cn(
                                                        "w-5 h-5 text-text-muted dark:text-dark-text-muted transition-transform flex-shrink-0 ms-4",
                                                        isOpen && "rotate-180"
                                                    )}
                                                />
                                            </button>
                                            <div
                                                className={cn(
                                                    "overflow-hidden transition-all duration-200",
                                                    isOpen ? "max-h-96" : "max-h-0"
                                                )}
                                            >
                                                <div className="p-4 bg-white dark:bg-dark-surface text-text-light dark:text-dark-text-muted">
                                                    {t(`questions.${itemKey}.a`)}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AboutLayout>
    )
}
