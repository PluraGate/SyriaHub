'use client'

import { useState } from 'react'
import {
    Settings,
    Bell,
    Palette,
    Eye,
    Lock,
    FileEdit,
    Sun,
    Moon,
    Monitor,
    Check,
    RotateCcw,
    Ticket,
    MessageSquarePlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferences, type UserPreferences } from '@/contexts/PreferencesContext'
import { useToast } from '@/components/ui/toast'
import { InviteManager } from '@/components/InviteManager'
import { FeedbackSection } from '@/components/feedback'
import { useTranslations } from 'next-intl'

interface SettingsPageProps {
    user: {
        id: string
        email?: string
    }
}

export function SettingsPage({ user }: SettingsPageProps) {
    const { preferences, updatePreference, updateNestedPreference, resetToDefaults, loading } = usePreferences()
    const { showToast } = useToast()
    const t = useTranslations('Settings')
    const [activeSection, setActiveSection] = useState<'notifications' | 'appearance' | 'display' | 'privacy' | 'editor' | 'invites' | 'feedback'>('appearance')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpdate = async (section: keyof UserPreferences, key: string, value: any) => {
        try {
            // @ts-expect-error - Dynamic key access for settings
            await updateNestedPreference(section, key, value)
            showToast(t('saved'), 'success')
        } catch (error) {
            showToast(t('saveFailed') || 'Failed to save settings', 'error')
        }
    }



    const handleReset = async () => {
        if (confirm(t('confirmReset'))) {
            await resetToDefaults()
            showToast(t('settingsReset'), 'success')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        )
    }

    const sections = [
        { id: 'appearance', label: t('appearance'), icon: Palette },
        { id: 'notifications', label: t('notifications'), icon: Bell },
        { id: 'display', label: t('displaySettings.title'), icon: Eye },
        { id: 'privacy', label: t('privacyTab'), icon: Lock },
        { id: 'editor', label: t('editorSettings.title'), icon: FileEdit },
        { id: 'invites', label: t('invitesSection.title'), icon: Ticket },
        { id: 'feedback', label: t('feedbackSection.title'), icon: MessageSquarePlus },
    ] as const

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text">
                        {t('title')}
                    </h1>
                </div>
                <Button variant="outline" onClick={handleReset} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    {t('resetToDefaults')}
                </Button>
            </div>

            <div className="flex gap-8">
                {/* Sidebar */}
                <nav className="w-48 flex-shrink-0">
                    <ul className="space-y-1">
                        {sections.map(section => {
                            const Icon = section.icon
                            return (
                                <li key={section.id}>
                                    <button
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id
                                            ? 'bg-primary text-white'
                                            : 'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-surface'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {section.label}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Content */}
                <div className="flex-1 card p-6">
                    {/* Appearance */}
                    {activeSection === 'appearance' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
                                {t('appearance')}
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-3">
                                    {t('theme.title')}
                                </label>
                                <div className="flex gap-3">
                                    {[
                                        { value: 'light', label: t('theme.light'), icon: Sun },
                                        { value: 'dark', label: t('theme.dark'), icon: Moon },
                                        { value: 'system', label: t('theme.system'), icon: Monitor },
                                    ].map(option => {
                                        const Icon = option.icon
                                        const isSelected = preferences.theme === option.value
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => updatePreference('theme', option.value as UserPreferences['theme'])}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${isSelected
                                                    ? 'border-primary bg-primary/10 text-primary dark:text-primary-light'
                                                    : 'border-gray-200 dark:border-dark-border text-text dark:text-dark-text hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-dark-bg'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{option.label}</span>
                                                {isSelected && <Check className="w-4 h-4" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeSection === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
                                {t('notificationSettings.title')}
                            </h2>

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted uppercase tracking-wide">
                                    {t('notificationSettings.emailNotifications')}
                                </h3>

                                <ToggleSetting
                                    label={t('notificationSettings.mentions')}
                                    description={t('notificationSettings.mentionsDesc')}
                                    checked={preferences.notifications.email_mentions}
                                    onChange={(v) => handleUpdate('notifications', 'email_mentions', v)}
                                />
                                <ToggleSetting
                                    label={t('notificationSettings.replies')}
                                    description={t('notificationSettings.repliesDesc')}
                                    checked={preferences.notifications.email_replies}
                                    onChange={(v) => handleUpdate('notifications', 'email_replies', v)}
                                />
                                <ToggleSetting
                                    label={t('notificationSettings.newFollowers')}
                                    description={t('notificationSettings.newFollowersDesc')}
                                    checked={preferences.notifications.email_follows}
                                    onChange={(v) => handleUpdate('notifications', 'email_follows', v)}
                                />

                                <div className="pt-4">
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        {t('notificationSettings.emailDigest')}
                                    </label>
                                    <select
                                        value={preferences.notifications.email_digest}
                                        onChange={(e) => handleUpdate('notifications', 'email_digest', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                                    >
                                        <option value="never">{t('notificationSettings.never')}</option>
                                        <option value="daily">{t('notificationSettings.daily')}</option>
                                        <option value="weekly">{t('notificationSettings.weekly')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Display */}
                    {activeSection === 'display' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
                                {t('displaySettings.title')}
                            </h2>

                            <ToggleSetting
                                label={t('displaySettings.compactMode')}
                                description={t('displaySettings.compactModeDesc')}
                                checked={preferences.display.compact_mode}
                                onChange={(v) => handleUpdate('display', 'compact_mode', v)}
                            />
                            <ToggleSetting
                                label={t('displaySettings.showAvatars')}
                                description={t('displaySettings.showAvatarsDesc')}
                                checked={preferences.display.show_avatars}
                                onChange={(v) => handleUpdate('display', 'show_avatars', v)}
                            />

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                    {t('displaySettings.postsPerPage')}
                                </label>
                                <select
                                    value={preferences.display.posts_per_page}
                                    onChange={(e) => handleUpdate('display', 'posts_per_page', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                    {t('displaySettings.defaultSort')}
                                </label>
                                <select
                                    value={preferences.display.default_sort}
                                    onChange={(e) => handleUpdate('display', 'default_sort', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                                >
                                    <option value="recent">{t('displaySettings.mostRecent')}</option>
                                    <option value="popular">{t('displaySettings.mostPopular')}</option>
                                    <option value="trending">{t('displaySettings.trending')}</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
                                <ToggleSetting
                                    label={t('displaySettings.guidedReadingMode')}
                                    description={t('displaySettings.guidedReadingModeDesc')}
                                    checked={preferences.display.guided_reading_mode}
                                    onChange={(v) => handleUpdate('display', 'guided_reading_mode', v)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Privacy */}
                    {activeSection === 'privacy' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
                                {t('privacySectionSettings.title')}
                            </h2>

                            <ToggleSetting
                                label={t('privacySectionSettings.publicProfile')}
                                description={t('privacySectionSettings.publicProfileDesc')}
                                checked={preferences.privacy.show_profile_public}
                                onChange={(v) => handleUpdate('privacy', 'show_profile_public', v)}
                            />
                            <ToggleSetting
                                label={t('privacySectionSettings.showEmail')}
                                description={t('privacySectionSettings.showEmailDesc')}
                                checked={preferences.privacy.show_email}
                                onChange={(v) => handleUpdate('privacy', 'show_email', v)}
                            />
                            <ToggleSetting
                                label={t('privacySectionSettings.allowMessages')}
                                description={t('privacySectionSettings.allowMessagesDesc')}
                                checked={preferences.privacy.allow_messages}
                                onChange={(v) => handleUpdate('privacy', 'allow_messages', v)}
                            />
                        </div>
                    )}

                    {/* Editor */}
                    {activeSection === 'editor' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
                                {t('editorSettings.title')}
                            </h2>

                            <ToggleSetting
                                label={t('editorSettings.autosave')}
                                description={t('editorSettings.autosaveDesc')}
                                checked={preferences.editor.autosave}
                                onChange={(v) => handleUpdate('editor', 'autosave', v)}
                            />

                            {preferences.editor.autosave && (
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        {t('editorSettings.autosaveInterval')}
                                    </label>
                                    <input
                                        type="number"
                                        min={10}
                                        max={120}
                                        value={preferences.editor.autosave_interval}
                                        onChange={(e) => handleUpdate('editor', 'autosave_interval', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                                    />
                                </div>
                            )}

                            <ToggleSetting
                                label={t('editorSettings.spellcheck')}
                                description={t('editorSettings.spellcheckDesc')}
                                checked={preferences.editor.spellcheck}
                                onChange={(v) => handleUpdate('editor', 'spellcheck', v)}
                            />
                            <ToggleSetting
                                label={t('editorSettings.lineNumbers')}
                                description={t('editorSettings.lineNumbersDesc')}
                                checked={preferences.editor.line_numbers}
                                onChange={(v) => handleUpdate('editor', 'line_numbers', v)}
                            />
                        </div>
                    )}

                    {/* Invites */}
                    {activeSection === 'invites' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
                                {t('invitesSection.title')}
                            </h2>
                            <p className="text-text-light dark:text-dark-text-muted mb-6">
                                {t('invitesSection.description')}
                            </p>
                            <InviteManager />
                        </div>
                    )}

                    {/* Feedback */}
                    {activeSection === 'feedback' && (
                        <FeedbackSection />
                    )}
                </div>
            </div>
        </div>
    )
}

interface ToggleSettingProps {
    label: string
    description: string
    checked: boolean
    onChange: (checked: boolean) => void
}

function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-border last:border-0">
            <div>
                <p className="font-medium text-text dark:text-dark-text">{label}</p>
                <p className="text-sm text-text-light dark:text-dark-text-muted">{description}</p>
            </div>
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
            >
                <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5.5 left-0.5' : 'translate-x-0.5 left-0'
                        }`}
                    style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
                />
            </button>
        </div>
    )
}
