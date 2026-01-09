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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { NumberInput } from "@/components/ui/NumberInput"
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
        { id: 'general', icon: Settings, title: t('platformSettings.sections.general.title'), description: t('platformSettings.sections.general.description') },
        { id: 'access', icon: Users, title: t('platformSettings.sections.access.title'), description: t('platformSettings.sections.access.description') },
        { id: 'moderation', icon: Shield, title: t('platformSettings.sections.moderation.title'), description: t('platformSettings.sections.moderation.description') },
        { id: 'notifications', icon: Bell, title: t('platformSettings.sections.notifications.title'), description: t('platformSettings.sections.notifications.description') },
        { id: 'content', icon: FileText, title: t('platformSettings.sections.content.title'), description: t('platformSettings.sections.content.description') },
        { id: 'localization', icon: Globe, title: t('platformSettings.sections.localization.title'), description: t('platformSettings.sections.localization.description') },
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
        <div className="space-y-6 overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-display font-bold text-primary dark:text-dark-text">
                        {t('platformSettings.title')}
                    </h1>
                    <p className="text-text-light dark:text-dark-text-muted mt-1">
                        {t('platformSettings.subtitle')}
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
                    {isSaving ? t('platformSettings.saving') : saveStatus === 'success' ? t('platformSettings.saved') : t('platformSettings.saveChanges')}
                </button>
            </div>

            {/* Save Status Alert */}
            {saveStatus === 'error' && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{t('platformSettings.saveError')}</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation - horizontal scroll on mobile */}
                <nav className="lg:w-64 lg:flex-shrink-0">
                    <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:space-y-1 scrollbar-thin">
                        {sections.map((section) => {
                            const Icon = section.icon
                            const isActive = activeSection === section.id
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        'flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-start transition-colors whitespace-nowrap flex-shrink-0 lg:flex-shrink lg:w-full',
                                        isActive
                                            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white'
                                            : 'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                                    )}
                                >
                                    <Icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                                    <div className="hidden lg:block">
                                        <div className="font-medium">{section.title}</div>
                                        <div className="text-xs opacity-70">{section.description}</div>
                                    </div>
                                    <span className="lg:hidden text-sm font-medium">{section.title}</span>
                                </button>
                            )
                        })}
                    </div>
                </nav>

                {/* Settings Content */}
                <div className="flex-1 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                    {activeSection === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">{t('platformSettings.sections.general.title')}</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        {t('platformSettings.general.siteName')}
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
                                        {t('platformSettings.general.siteDescription')}
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
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">{t('platformSettings.sections.access.title')}</h2>

                            <div className="space-y-4">
                                <ToggleSetting
                                    label={t('platformSettings.access.registrationEnabled')}
                                    description={t('platformSettings.access.registrationEnabledDesc')}
                                    checked={settings.registrationEnabled}
                                    onChange={(val) => updateSetting('registrationEnabled', val)}
                                />

                                <ToggleSetting
                                    label={t('platformSettings.access.requireEmailVerification')}
                                    description={t('platformSettings.access.requireEmailVerificationDesc')}
                                    checked={settings.requireEmailVerification}
                                    onChange={(val) => updateSetting('requireEmailVerification', val)}
                                />

                                <ToggleSetting
                                    label={t('platformSettings.access.allowAnonymousBrowsing')}
                                    description={t('platformSettings.access.allowAnonymousBrowsingDesc')}
                                    checked={settings.allowAnonymousBrowsing}
                                    onChange={(val) => updateSetting('allowAnonymousBrowsing', val)}
                                />

                                <ToggleSetting
                                    label={t('platformSettings.access.inviteOnlyMode')}
                                    description={t('platformSettings.access.inviteOnlyModeDesc')}
                                    checked={settings.inviteOnlyMode}
                                    onChange={(val) => updateSetting('inviteOnlyMode', val)}
                                />
                            </div>
                        </div>
                    )}

                    {activeSection === 'moderation' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">{t('platformSettings.sections.moderation.title')}</h2>

                            <div className="space-y-4">
                                <ToggleSetting
                                    label={t('platformSettings.moderation.autoModeration')}
                                    description={t('platformSettings.moderation.autoModerationDesc')}
                                    checked={settings.autoModeration}
                                    onChange={(val) => updateSetting('autoModeration', val)}
                                />

                                <ToggleSetting
                                    label={t('platformSettings.moderation.requirePostApproval')}
                                    description={t('platformSettings.moderation.requirePostApprovalDesc')}
                                    checked={settings.requirePostApproval}
                                    onChange={(val) => updateSetting('requirePostApproval', val)}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        {t('platformSettings.moderation.autoHideThreshold')}
                                    </label>
                                    <p className="text-sm text-text-light dark:text-dark-text-muted mb-2">
                                        {t('platformSettings.moderation.autoHideThresholdDesc')}
                                    </p>
                                    <NumberInput
                                        min={1}
                                        max={10}
                                        value={settings.maxReportsBeforeAutoHide}
                                        onChange={(val) => updateSetting('maxReportsBeforeAutoHide', val)}
                                        className="w-full sm:w-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">{t('platformSettings.sections.notifications.title')}</h2>

                            <div className="space-y-4">
                                <ToggleSetting
                                    label={t('platformSettings.notifications.emailNotifications')}
                                    description={t('platformSettings.notifications.emailNotificationsDesc')}
                                    checked={settings.emailNotifications}
                                    onChange={(val) => updateSetting('emailNotifications', val)}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        {t('platformSettings.notifications.digestFrequency')}
                                    </label>
                                    <Select
                                        value={settings.digestFrequency}
                                        onValueChange={(value) => updateSetting('digestFrequency', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="realtime">{t('platformSettings.notifications.options.realtime')}</SelectItem>
                                            <SelectItem value="daily">{t('platformSettings.notifications.options.daily')}</SelectItem>
                                            <SelectItem value="weekly">{t('platformSettings.notifications.options.weekly')}</SelectItem>
                                            <SelectItem value="never">{t('platformSettings.notifications.options.never')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'content' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">{t('platformSettings.sections.content.title')}</h2>

                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border">
                                <p className="text-text-light dark:text-dark-text-muted">
                                    {t('platformSettings.content.info')}
                                    <Link href="/admin/schema" className="text-primary hover:underline ml-1">
                                        {t('platformSettings.content.link')} →
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'localization' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-primary dark:text-dark-text">{t('platformSettings.sections.localization.title')}</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        {t('platformSettings.localization.defaultLanguage')}
                                    </label>
                                    <Select
                                        value={settings.defaultLocale}
                                        onValueChange={(value) => updateSetting('defaultLocale', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">{t('platformSettings.localization.languages.en')}</SelectItem>
                                            <SelectItem value="ar">{t('platformSettings.localization.languages.ar')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        {t('platformSettings.localization.info')}
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
