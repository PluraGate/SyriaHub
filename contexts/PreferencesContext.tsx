'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserPreferences {
    // Theme
    theme: 'light' | 'dark' | 'system'

    // Calendar System
    calendar: 'hijri' | 'gregorian'

    // Language
    language: string

    // Notifications
    notifications: {
        email_mentions: boolean
        email_replies: boolean
        email_follows: boolean
        email_digest: 'never' | 'daily' | 'weekly'
        push_enabled: boolean
        push_mentions: boolean
        push_replies: boolean
    }

    // Display
    display: {
        compact_mode: boolean
        show_avatars: boolean
        posts_per_page: number
        default_sort: 'recent' | 'popular' | 'trending'
        guided_reading_mode: boolean
    }

    // Privacy
    privacy: {
        show_profile_public: boolean
        show_email: boolean
        allow_messages: boolean
    }

    // Editor
    editor: {
        autosave: boolean
        autosave_interval: number
        spellcheck: boolean
        line_numbers: boolean
    }
}

const defaultPreferences: UserPreferences = {
    theme: 'dark',
    calendar: 'hijri',
    language: 'en',
    notifications: {
        email_mentions: true,
        email_replies: true,
        email_follows: true,
        email_digest: 'weekly',
        push_enabled: true,
        push_mentions: true,
        push_replies: true,
    },
    display: {
        compact_mode: false,
        show_avatars: true,
        posts_per_page: 20,
        default_sort: 'recent',
        guided_reading_mode: false,
    },
    privacy: {
        show_profile_public: true,
        show_email: false,
        allow_messages: false,
    },
    editor: {
        autosave: true,
        autosave_interval: 30,
        spellcheck: true,
        line_numbers: false,
    },
}

interface PreferencesContextType {
    preferences: UserPreferences
    loading: boolean
    updatePreference: <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => Promise<void>
    updateNestedPreference: <
        K extends keyof UserPreferences,
        NK extends keyof UserPreferences[K]
    >(
        key: K,
        nestedKey: NK,
        value: UserPreferences[K][NK]
    ) => Promise<void>
    resetToDefaults: () => Promise<void>
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function usePreferences() {
    const context = useContext(PreferencesContext)
    if (!context) {
        throw new Error('usePreferences must be used within PreferencesProvider')
    }
    return context
}

interface PreferencesProviderProps {
    children: ReactNode
    userId?: string
}

export function PreferencesProvider({ children, userId }: PreferencesProviderProps) {
    // Synchronously initialize from localStorage if available to prevent flash/stale state
    const [preferences, setPreferences] = useState<UserPreferences>(() => {
        if (typeof window !== 'undefined') {
            const local = localStorage.getItem('user_preferences')
            if (local) {
                try {
                    return { ...defaultPreferences, ...JSON.parse(local) }
                } catch (e) {
                    console.error('Failed to parse initial preferences', e)
                }
            }
        }
        return defaultPreferences
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Sync with database if user is logged in
    useEffect(() => {
        async function loadPreferences() {
            if (!userId) {
                setLoading(false)
                return
            }

            try {
                const { data, error } = await supabase
                    .from('user_preferences')
                    .select('preferences')
                    .eq('user_id', userId)
                    .maybeSingle()

                if (data?.preferences) {
                    const dbPrefs = data.preferences as Partial<UserPreferences>
                    // Deep merge to preserve defaults for any missing nested fields
                    const merged: UserPreferences = {
                        ...defaultPreferences,
                        ...dbPrefs,
                        notifications: { ...defaultPreferences.notifications, ...(dbPrefs.notifications || {}) },
                        display: { ...defaultPreferences.display, ...(dbPrefs.display || {}) },
                        privacy: { ...defaultPreferences.privacy, ...(dbPrefs.privacy || {}) },
                        editor: { ...defaultPreferences.editor, ...(dbPrefs.editor || {}) },
                    }
                    setPreferences(merged)
                    // Update local cache with merged values
                    localStorage.setItem('user_preferences', JSON.stringify(merged))
                }
            } catch (error) {
                console.log('No database preferences found or sync error')
            } finally {
                setLoading(false)
            }
        }

        loadPreferences()
    }, [userId, supabase])

    // Apply theme preference
    useEffect(() => {
        // Guard for SSR
        if (typeof window === 'undefined') return

        const root = document.documentElement

        if (preferences.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const systemDark = mediaQuery.matches
            console.log('[Theme] System mode - detected system prefers-dark:', systemDark)
            root.classList.toggle('dark', systemDark)

            // Listen for system theme changes
            const listener = (e: MediaQueryListEvent) => {
                if (preferences.theme === 'system') {
                    console.log('[Theme] System preference changed to:', e.matches ? 'dark' : 'light')
                    root.classList.toggle('dark', e.matches)
                }
            }

            mediaQuery.addEventListener('change', listener)
            return () => mediaQuery.removeEventListener('change', listener)
        } else {
            console.log('[Theme] Manual mode:', preferences.theme)
            root.classList.toggle('dark', preferences.theme === 'dark')
        }
    }, [preferences.theme])

    const savePreferences = useCallback(async (newPrefs: UserPreferences) => {
        console.log('[Preferences] Saving:', newPrefs)
        // Save to localStorage immediately
        if (typeof window !== 'undefined') {
            localStorage.setItem('user_preferences', JSON.stringify(newPrefs))
        }

        // Save to database if user is logged in
        if (userId) {
            try {
                const { error } = await supabase
                    .from('user_preferences')
                    .upsert(
                        {
                            user_id: userId,
                            preferences: newPrefs,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'user_id' }
                    )

                if (error) {
                    console.error('[Preferences] Supabase save error:', error)
                } else {
                    console.log('[Preferences] Saved and synced to database')
                }
            } catch (error) {
                console.error('[Preferences] Failed to save preferences to database:', error)
            }
        }
    }, [userId, supabase])

    const updatePreference = useCallback(async <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        setPreferences(prev => {
            const next = { ...prev, [key]: value }
            savePreferences(next)
            return next
        })
    }, [savePreferences])

    const updateNestedPreference = useCallback(async <
        K extends keyof UserPreferences,
        NK extends keyof UserPreferences[K]
    >(
        key: K,
        nestedKey: NK,
        value: UserPreferences[K][NK]
    ) => {
        setPreferences(prev => {
            const next = {
                ...prev,
                [key]: {
                    ...(prev[key] as object),
                    [nestedKey]: value,
                },
            }
            savePreferences(next)
            return next
        })
    }, [savePreferences])

    const resetToDefaults = useCallback(async () => {
        try {
            const freshDefaults: UserPreferences = JSON.parse(JSON.stringify(defaultPreferences))

            if (typeof window !== 'undefined') {
                localStorage.removeItem('user_preferences')
            }

            setPreferences(freshDefaults)
            await savePreferences(freshDefaults)
        } catch (error) {
            console.error('Error in resetToDefaults:', error)
        }
    }, [savePreferences])

    return (
        <PreferencesContext.Provider
            value={{
                preferences,
                loading,
                updatePreference,
                updateNestedPreference,
                resetToDefaults,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    )
}

/**
 * Hook for just the theme preference
 */
export function useTheme() {
    const { preferences, updatePreference } = usePreferences()

    return {
        theme: preferences.theme,
        setTheme: (theme: UserPreferences['theme']) => updatePreference('theme', theme),
        isDark: preferences.theme === 'dark' ||
            (preferences.theme === 'system' &&
                typeof window !== 'undefined' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches),
    }
}
