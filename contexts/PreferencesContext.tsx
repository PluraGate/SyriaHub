'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserPreferences {
    // Theme
    theme: 'light' | 'dark' | 'system'

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
    theme: 'system',
    language: 'en',
    notifications: {
        email_mentions: true,
        email_replies: true,
        email_follows: false,
        email_digest: 'weekly',
        push_enabled: false,
        push_mentions: true,
        push_replies: true,
    },
    display: {
        compact_mode: false,
        show_avatars: true,
        posts_per_page: 20,
        default_sort: 'recent',
    },
    privacy: {
        show_profile_public: true,
        show_email: false,
        allow_messages: true,
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
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Load preferences from localStorage and database
    useEffect(() => {
        async function loadPreferences() {
            // First, load from localStorage for immediate use
            const localPrefs = localStorage.getItem('user_preferences')
            if (localPrefs) {
                try {
                    const parsed = JSON.parse(localPrefs)
                    setPreferences(prev => ({ ...prev, ...parsed }))
                } catch (error) {
                    console.error('Failed to parse local preferences:', error)
                }
            }

            // If user is logged in, sync with database
            if (userId) {
                try {
                    const { data, error } = await supabase
                        .from('user_preferences')
                        .select('preferences')
                        .eq('user_id', userId)
                        .single()

                    if (data?.preferences) {
                        const dbPrefs = data.preferences as UserPreferences
                        setPreferences(prev => ({ ...prev, ...dbPrefs }))
                        localStorage.setItem('user_preferences', JSON.stringify(dbPrefs))
                    }
                } catch (error) {
                    // Preferences might not exist yet, that's okay
                    console.log('No database preferences found, using defaults')
                }
            }

            setLoading(false)
        }

        loadPreferences()
    }, [userId, supabase])

    // Apply theme preference
    useEffect(() => {
        // Guard for SSR
        if (typeof window === 'undefined') return

        const root = document.documentElement

        // Clean up old 'theme' localStorage key from legacy Navbar logic
        const oldTheme = localStorage.getItem('theme')
        if (oldTheme) {
            localStorage.removeItem('theme')
        }

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
        // Save to localStorage immediately
        localStorage.setItem('user_preferences', JSON.stringify(newPrefs))

        // Save to database if user is logged in
        if (userId) {
            try {
                await supabase
                    .from('user_preferences')
                    .upsert({
                        user_id: userId,
                        preferences: newPrefs,
                        updated_at: new Date().toISOString(),
                    })
            } catch (error) {
                console.error('Failed to save preferences to database:', error)
            }
        }
    }, [userId, supabase])

    const updatePreference = useCallback(async <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        console.log('[Preferences] Updating:', key, '=', value)
        const newPrefs = { ...preferences, [key]: value }
        setPreferences(newPrefs)
        await savePreferences(newPrefs)
    }, [preferences, savePreferences])

    const updateNestedPreference = useCallback(async <
        K extends keyof UserPreferences,
        NK extends keyof UserPreferences[K]
    >(
        key: K,
        nestedKey: NK,
        value: UserPreferences[K][NK]
    ) => {
        const newPrefs = {
            ...preferences,
            [key]: {
                ...(preferences[key] as object),
                [nestedKey]: value,
            },
        }
        setPreferences(newPrefs)
        await savePreferences(newPrefs)
    }, [preferences, savePreferences])

    const resetToDefaults = useCallback(async () => {
        setPreferences(defaultPreferences)
        await savePreferences(defaultPreferences)
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
