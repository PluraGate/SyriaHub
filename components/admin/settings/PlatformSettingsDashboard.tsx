'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { 
    Settings, 
    Globe, 
    Shield, 
    Bell, 
    Users, 
    FileText,
    Save,
    AlertTriangle,
    CheckCircle2,
    Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsSection {
    id: string
    icon: React.ElementType
    title: string
    description: string
}

export function PlatformSettingsDashboard() {
    const t = useTranslations('Admin')
    const [activeSection, setActiveSection] = useState('general')
    const [isSaving, setIsSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

    // Settings state
    const [settings, setSettings] = useState({
        // General
        siteName: 'SyriaHub',
        siteDescription: 'A minimalist research platform for collaborative knowledge sharing',
        defaultLocale: 'en',
        
        // Registration & Access
        registrationEnabled: true,
        requireEmailVerification: true,
        allowAnonymousBrowsing: true,
        inviteOnlyMode: false,
        
        // Content Moderation
        autoModeration: true,
        requirePostApproval: false,
        maxReportsBeforeAutoHide: 3,
        
        // Notifications
        emailNotifications: true,
        digestFrequency: 'daily',
        
        // Security
        sessionTimeout: 7, // days
        maxLoginAttempts: 5,
        twoFactorRequired: false
    })

    const sections: SettingsSection[] = [
        { id: 'general', icon: Settings, title: 'General Settings', description: 'Basic platform configuration' },
        { id: 'access', icon: Users, title: 'Registration & Access', description: 'User registration and access controls' },
        { id: 'moderation', icon: Shield, title: 'Content Moderation', description: 'Automated moderation settings' },
        { id: 'notifications', icon: Bell, title: 'Notifications', description: 'Email and notification preferences' },
        { id: 'content', icon: FileText, title: 'Content Settings', description: 'Post types and content rules' },
        { id: 'localization', icon: Globe, title: 'Localization', description: 'Language and region settings' },
    ]

    const handleSave = async () => {
        setIsSaving(true)
        setSaveStatus('idle')
        
        try {
            // Simulate API call - In production, this would save to database
            await new Promise(resolve => setTimeout(resolve, 1000))
            setSaveStatus('success')
            setTimeout(() => setSaveStatus('idle'), 3000)
        } catch {
            setSaveStatus('error')
        } finally {
            setIsSaving(false)
        }
    }

    const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-primary dark:text-dark-text">
                        {t('settings')}
                    </h1>
                    <p className="text-text-light dark:text-dark-text-muted mt-1">
                        Configure platform-wide settings and preferences
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                        'bg-primary text-white hover:bg-primary-dark',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saveStatus === 'success' ? (
                        <CheckCircle2 className="w-4 h-4" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Save Status Alert */}
            {saveStatus === 'error' && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Failed to save settings. Please try again.</span>
                </div>
            )}

            <div className="flex gap-6">
                {/* Sidebar Navigation */}
                <nav className="w-64 flex-shrink-0 space-y-1">
                    {sections.map((section) => {
                        const Icon = section.icon
                        const isActive = activeSection === section.id
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white'
                                        : 'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <div>
                                    <div className="font-medium">{section.title}</div>
                                    <div className="text-xs opacity-70">{section.description}</div>
                                </div>
                            </button>
                        )
                    })}
                </nav>

                {/* Settings Content */}
                <div className="flex-1 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                    {activeSection === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">General Settings</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Site Name
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.siteName}
                                        onChange={(e) => updateSetting('siteName', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Site Description
                                    </label>
                                    <textarea
                                        value={settings.siteDescription}
                                        onChange={(e) => updateSetting('siteDescription', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'access' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">Registration & Access</h2>
                            
                            <div className="space-y-4">
                                <ToggleSetting
                                    label="Enable Registration"
                                    description="Allow new users to register on the platform"
                                    checked={settings.registrationEnabled}
                                    onChange={(val) => updateSetting('registrationEnabled', val)}
                                />
                                
                                <ToggleSetting
                                    label="Require Email Verification"
                                    description="Users must verify their email before accessing the platform"
                                    checked={settings.requireEmailVerification}
                                    onChange={(val) => updateSetting('requireEmailVerification', val)}
                                />
                                
                                <ToggleSetting
                                    label="Allow Anonymous Browsing"
                                    description="Non-logged-in users can view public content"
                                    checked={settings.allowAnonymousBrowsing}
                                    onChange={(val) => updateSetting('allowAnonymousBrowsing', val)}
                                />
                                
                                <ToggleSetting
                                    label="Invite-Only Mode"
                                    description="Only users with an invitation can register"
                                    checked={settings.inviteOnlyMode}
                                    onChange={(val) => updateSetting('inviteOnlyMode', val)}
                                />
                            </div>
                        </div>
                    )}

                    {activeSection === 'moderation' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">Content Moderation</h2>
                            
                            <div className="space-y-4">
                                <ToggleSetting
                                    label="Auto-Moderation"
                                    description="Automatically flag content that violates guidelines"
                                    checked={settings.autoModeration}
                                    onChange={(val) => updateSetting('autoModeration', val)}
                                />
                                
                                <ToggleSetting
                                    label="Require Post Approval"
                                    description="All new posts must be approved by a moderator"
                                    checked={settings.requirePostApproval}
                                    onChange={(val) => updateSetting('requirePostApproval', val)}
                                />
                                
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Auto-hide Threshold
                                    </label>
                                    <p className="text-sm text-text-light dark:text-dark-text-muted mb-2">
                                        Number of reports before content is automatically hidden
                                    </p>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={settings.maxReportsBeforeAutoHide}
                                        onChange={(e) => updateSetting('maxReportsBeforeAutoHide', parseInt(e.target.value) || 3)}
                                        className="w-24 px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">Notifications</h2>
                            
                            <div className="space-y-4">
                                <ToggleSetting
                                    label="Email Notifications"
                                    description="Send email notifications to users"
                                    checked={settings.emailNotifications}
                                    onChange={(val) => updateSetting('emailNotifications', val)}
                                />
                                
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Digest Frequency
                                    </label>
                                    <select
                                        value={settings.digestFrequency}
                                        onChange={(e) => updateSetting('digestFrequency', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    >
                                        <option value="realtime">Real-time</option>
                                        <option value="daily">Daily digest</option>
                                        <option value="weekly">Weekly digest</option>
                                        <option value="never">Never</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'content' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">Content Settings</h2>
                            
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border">
                                <p className="text-text-light dark:text-dark-text-muted">
                                    Content type settings are managed in the Schema Registry. 
                                    <Link href="/admin/schema" className="text-primary hover:underline ml-1">
                                        Go to Schema Registry →
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'localization' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">Localization</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Default Language
                                    </label>
                                    <select
                                        value={settings.defaultLocale}
                                        onChange={(e) => updateSetting('defaultLocale', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    >
                                        <option value="en">English</option>
                                        <option value="ar">العربية (Arabic)</option>
                                    </select>
                                </div>
                                
                                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Users can override the default language in their personal preferences.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Toggle Setting Component
function ToggleSetting({ 
    label, 
    description, 
    checked, 
    onChange 
}: { 
    label: string
    description: string
    checked: boolean
    onChange: (value: boolean) => void 
}) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-border last:border-0">
            <div>
                <div className="font-medium text-text dark:text-dark-text">{label}</div>
                <div className="text-sm text-text-light dark:text-dark-text-muted">{description}</div>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    checked ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-border'
                )}
            >
                <span
                    className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        checked ? 'translate-x-5' : 'translate-x-0'
                    )}
                />
            </button>
        </div>
    )
}
