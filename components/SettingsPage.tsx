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
    RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferences, type UserPreferences } from '@/contexts/PreferencesContext'
import { useToast } from '@/components/ui/toast'

interface SettingsPageProps {
    user: {
        id: string
        email?: string
    }
}

export function SettingsPage({ user }: SettingsPageProps) {
    const { preferences, updatePreference, updateNestedPreference, resetToDefaults, loading } = usePreferences()
    const { showToast } = useToast()
    const [activeSection, setActiveSection] = useState<'notifications' | 'appearance' | 'display' | 'privacy' | 'editor'>('appearance')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpdate = async (section: keyof UserPreferences, key: string, value: any) => {
        try {
            // @ts-expect-error - Dynamic key access for settings
            await updateNestedPreference(section, key, value)
            showToast('Settings saved', 'success')
        } catch (error) {
            showToast('Failed to save settings', 'error')
        }
    }



    const handleReset = async () => {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            await resetToDefaults()
            showToast('Settings reset to defaults', 'success')
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
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'display', label: 'Display', icon: Eye },
        { id: 'privacy', label: 'Privacy', icon: Lock },
        { id: 'editor', label: 'Editor', icon: FileEdit },
    ] as const

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text">
                        Settings
                    </h1>
                </div>
                <Button variant="outline" onClick={handleReset} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset to Defaults
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
                                Appearance
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-3">
                                    Theme
                                </label>
                                <div className="flex gap-3">
                                    {[
                                        { value: 'light', label: 'Light', icon: Sun },
                                        { value: 'dark', label: 'Dark', icon: Moon },
                                        { value: 'system', label: 'System', icon: Monitor },
                                    ].map(option => {
                                        const Icon = option.icon
                                        const isSelected = preferences.theme === option.value
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => updatePreference('theme', option.value as UserPreferences['theme'])}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${isSelected
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-gray-200 dark:border-dark-border hover:border-primary/50'
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
                                Notification Settings
                            </h2>

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted uppercase tracking-wide">
                                    Email Notifications
                                </h3>

                                <ToggleSetting
                                    label="Mentions"
                                    description="Get notified when someone mentions you"
                                    checked={preferences.notifications.email_mentions}
                                    onChange={(v) => handleUpdate('notifications', 'email_mentions', v)}
                                />
                                <ToggleSetting
                                    label="Replies"
                                    description="Get notified when someone replies to your posts or comments"
                                    checked={preferences.notifications.email_replies}
                                    onChange={(v) => handleUpdate('notifications', 'email_replies', v)}
                                />
                                <ToggleSetting
                                    label="New Followers"
                                    description="Get notified when someone follows you"
                                    checked={preferences.notifications.email_follows}
                                    onChange={(v) => handleUpdate('notifications', 'email_follows', v)}
                                />

                                <div className="pt-4">
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Email Digest
                                    </label>
                                    <select
                                        value={preferences.notifications.email_digest}
                                        onChange={(e) => handleUpdate('notifications', 'email_digest', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                                    >
                                        <option value="never">Never</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Display */}
                    {activeSection === 'display' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
                                Display Settings
                            </h2>

                            <ToggleSetting
                                label="Compact Mode"
                                description="Show more content with smaller spacing"
                                checked={preferences.display.compact_mode}
                                onChange={(v) => handleUpdate('display', 'compact_mode', v)}
                            />
                            <ToggleSetting
                                label="Show Avatars"
                                description="Display user avatars in posts and comments"
                                checked={preferences.display.show_avatars}
                                onChange={(v) => handleUpdate('display', 'show_avatars', v)}
                            />

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                    Posts Per Page
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
                                    Default Sort
                                </label>
                                <select
                                    value={preferences.display.default_sort}
                                    onChange={(e) => handleUpdate('display', 'default_sort', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="trending">Trending</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Privacy */}
                    {activeSection === 'privacy' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
                                Privacy Settings
                            </h2>

                            <ToggleSetting
                                label="Public Profile"
                                description="Allow anyone to view your profile"
                                checked={preferences.privacy.show_profile_public}
                                onChange={(v) => handleUpdate('privacy', 'show_profile_public', v)}
                            />
                            <ToggleSetting
                                label="Show Email"
                                description="Display your email on your profile"
                                checked={preferences.privacy.show_email}
                                onChange={(v) => handleUpdate('privacy', 'show_email', v)}
                            />
                            <ToggleSetting
                                label="Allow Messages"
                                description="Allow other users to send you messages"
                                checked={preferences.privacy.allow_messages}
                                onChange={(v) => handleUpdate('privacy', 'allow_messages', v)}
                            />
                        </div>
                    )}

                    {/* Editor */}
                    {activeSection === 'editor' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
                                Editor Settings
                            </h2>

                            <ToggleSetting
                                label="Auto-save"
                                description="Automatically save drafts while editing"
                                checked={preferences.editor.autosave}
                                onChange={(v) => handleUpdate('editor', 'autosave', v)}
                            />

                            {preferences.editor.autosave && (
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Auto-save Interval (seconds)
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
                                label="Spellcheck"
                                description="Enable browser spellchecking in editor"
                                checked={preferences.editor.spellcheck}
                                onChange={(v) => handleUpdate('editor', 'spellcheck', v)}
                            />
                            <ToggleSetting
                                label="Line Numbers"
                                description="Show line numbers in editor"
                                checked={preferences.editor.line_numbers}
                                onChange={(v) => handleUpdate('editor', 'line_numbers', v)}
                            />
                        </div>
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
