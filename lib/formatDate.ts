/**
 * Locale-aware date and number formatting utilities for SyriaHub.
 * Provides consistent formatting across the application with RTL/Arabic support.
 */

import { format, formatDistanceToNow, formatRelative, type Locale } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

// Map of supported locales to date-fns locale objects
const localeMap: Record<string, Locale> = {
    en: enUS,
    ar: ar,
}

export type DateFormatType = 'short' | 'medium' | 'long' | 'relative' | 'distance'

/**
 * Format a date according to locale and format type.
 * 
 * @param date - The date to format (Date object, string, or number)
 * @param locale - The locale code ('en' or 'ar')
 * @param formatType - The type of format to use
 * @returns Formatted date string
 * 
 * @example
 * formatLocalizedDate(new Date(), 'ar', 'medium') // "٢٢ ديسمبر ٢٠٢٥"
 * formatLocalizedDate(new Date(), 'en', 'short')  // "Dec 22"
 */
export function formatLocalizedDate(
    date: Date | string | number,
    locale: string = 'en',
    formatType: DateFormatType = 'medium'
): string {
    const dateObj = typeof date === 'string' || typeof date === 'number'
        ? new Date(date)
        : date

    if (isNaN(dateObj.getTime())) {
        return ''
    }

    const dateLocale = localeMap[locale] || enUS

    switch (formatType) {
        case 'short':
            // Dec 22
            return format(dateObj, 'MMM d', { locale: dateLocale })

        case 'medium':
            // Dec 22, 2025
            return format(dateObj, 'MMM d, yyyy', { locale: dateLocale })

        case 'long':
            // December 22, 2025
            return format(dateObj, 'MMMM d, yyyy', { locale: dateLocale })

        case 'relative':
            // yesterday, last Friday, etc.
            return formatRelative(dateObj, new Date(), { locale: dateLocale })

        case 'distance':
            // 2 days ago, in 3 hours, etc.
            return formatDistanceToNow(dateObj, { addSuffix: true, locale: dateLocale })

        default:
            return format(dateObj, 'MMM d, yyyy', { locale: dateLocale })
    }
}

/**
 * Format a date with time.
 * 
 * @param date - The date to format
 * @param locale - The locale code
 * @returns Formatted date and time string
 */
export function formatLocalizedDateTime(
    date: Date | string | number,
    locale: string = 'en'
): string {
    const dateObj = typeof date === 'string' || typeof date === 'number'
        ? new Date(date)
        : date

    if (isNaN(dateObj.getTime())) {
        return ''
    }

    const dateLocale = localeMap[locale] || enUS
    return format(dateObj, 'MMM d, yyyy h:mm a', { locale: dateLocale })
}

/**
 * Format a number according to locale.
 * Converts to Arabic-Indic numerals for Arabic locale.
 * 
 * @param num - The number to format
 * @param locale - The locale code
 * @returns Formatted number string
 */
export function formatLocalizedNumber(
    num: number,
    locale: string = 'en'
): string {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(num)
}

/**
 * Format a date for display in saved items, posts, etc.
 * Returns a user-friendly format like "Saved Dec 22" or "تم الحفظ في ٢٢ ديسمبر"
 * 
 * @param date - The date to format
 * @param locale - The locale code
 * @returns Formatted date string suitable for UI display
 */
export function formatSavedDate(
    date: Date | string | number,
    locale: string = 'en'
): string {
    return formatLocalizedDate(date, locale, 'short')
}
