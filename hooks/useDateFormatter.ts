'use client'

import { useCallback } from 'react'
import { useLocale } from 'next-intl'
import { usePreferences } from '@/contexts/PreferencesContext'
import {
    formatLocalizedDate,
    formatLocalizedDateTime,
    formatSavedDate,
    type DateFormatType,
    type CalendarSystem,
} from '@/lib/formatDate'

/**
 * Hook that provides date formatting functions with automatic locale and calendar detection.
 * Uses the current locale from next-intl and the calendar preference from user settings.
 * 
 * @example
 * const { formatDate, formatDateTime } = useDateFormatter()
 * formatDate(new Date()) // Automatically uses Hijri/Gregorian based on user preference
 */
export function useDateFormatter() {
    const locale = useLocale()
    const { preferences } = usePreferences()
    const calendar = preferences.calendar as CalendarSystem

    const formatDate = useCallback(
        (date: Date | string | number, formatType: DateFormatType = 'medium') => {
            return formatLocalizedDate(date, locale, formatType, calendar)
        },
        [locale, calendar]
    )

    const formatDateTime = useCallback(
        (date: Date | string | number) => {
            return formatLocalizedDateTime(date, locale, calendar)
        },
        [locale, calendar]
    )

    const formatSaved = useCallback(
        (date: Date | string | number) => {
            return formatSavedDate(date, locale, calendar)
        },
        [locale, calendar]
    )

    return {
        formatDate,
        formatDateTime,
        formatSaved,
        locale,
        calendar,
    }
}
