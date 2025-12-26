/**
 * Locale-aware date and number formatting utilities for SyriaHub.
 * Provides consistent formatting across the application with RTL/Arabic support.
 * Supports Hijri (Islamic) and Gregorian calendar systems.
 */

import { formatDistanceToNow, type Locale } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

// Map of supported locales to date-fns locale objects
const localeMap: Record<string, Locale> = {
    en: enUS,
    ar: ar,
}

export type DateFormatType = 'short' | 'medium' | 'long' | 'relative' | 'distance'
export type CalendarSystem = 'hijri' | 'gregorian'

/**
 * Get Intl.DateTimeFormat options for the specified calendar and format type.
 */
function getDateFormatOptions(
    formatType: DateFormatType,
    calendar: CalendarSystem
): Intl.DateTimeFormatOptions {
    const calendarExtension = calendar === 'hijri' ? 'islamic-umalqura' : 'gregory'

    const baseOptions: Intl.DateTimeFormatOptions = {
        calendar: calendarExtension,
    }

    switch (formatType) {
        case 'short':
            // Dec 22 or ٢٢ جمادى الآخرة
            return { ...baseOptions, month: 'short', day: 'numeric' }
        case 'medium':
            // Dec 22, 2025 or ٢٢ جمادى الآخرة ١٤٤٧
            return { ...baseOptions, month: 'short', day: 'numeric', year: 'numeric' }
        case 'long':
            // December 22, 2025 or ٢٢ جمادى الآخرة ١٤٤٧ هـ
            return { ...baseOptions, month: 'long', day: 'numeric', year: 'numeric' }
        default:
            return { ...baseOptions, month: 'short', day: 'numeric', year: 'numeric' }
    }
}

/**
 * Format a date according to locale, format type, and calendar system.
 * 
 * @param date - The date to format (Date object, string, or number)
 * @param locale - The locale code ('en' or 'ar')
 * @param formatType - The type of format to use
 * @param calendar - The calendar system to use ('hijri' or 'gregorian')
 * @returns Formatted date string
 * 
 * @example
 * formatLocalizedDate(new Date(), 'ar', 'medium', 'hijri') // "٢٢ جمادى الآخرة ١٤٤٧"
 * formatLocalizedDate(new Date(), 'en', 'short', 'gregorian')  // "Dec 22"
 */
export function formatLocalizedDate(
    date: Date | string | number,
    locale: string = 'en',
    formatType: DateFormatType = 'medium',
    calendar: CalendarSystem = 'hijri'
): string {
    const dateObj = typeof date === 'string' || typeof date === 'number'
        ? new Date(date)
        : date

    if (isNaN(dateObj.getTime())) {
        return ''
    }

    // For relative and distance formats, use date-fns (calendar-agnostic)
    if (formatType === 'relative' || formatType === 'distance') {
        const dateLocale = localeMap[locale] || enUS
        return formatDistanceToNow(dateObj, { addSuffix: true, locale: dateLocale })
    }

    // Use Intl.DateTimeFormat for Hijri/Gregorian support
    const localeString = locale === 'ar' ? 'ar-SA' : 'en-US'
    const options = getDateFormatOptions(formatType, calendar)

    try {
        return new Intl.DateTimeFormat(localeString, options).format(dateObj)
    } catch (error) {
        // Fallback to Gregorian if Hijri fails
        console.warn('Date formatting failed, falling back to Gregorian:', error)
        const fallbackOptions = getDateFormatOptions(formatType, 'gregorian')
        return new Intl.DateTimeFormat(localeString, fallbackOptions).format(dateObj)
    }
}

/**
 * Format a date with time.
 * 
 * @param date - The date to format
 * @param locale - The locale code
 * @param calendar - The calendar system to use
 * @returns Formatted date and time string
 */
export function formatLocalizedDateTime(
    date: Date | string | number,
    locale: string = 'en',
    calendar: CalendarSystem = 'hijri'
): string {
    const dateObj = typeof date === 'string' || typeof date === 'number'
        ? new Date(date)
        : date

    if (isNaN(dateObj.getTime())) {
        return ''
    }

    const localeString = locale === 'ar' ? 'ar-SA' : 'en-US'
    const calendarExtension = calendar === 'hijri' ? 'islamic-umalqura' : 'gregory'

    const options: Intl.DateTimeFormatOptions = {
        calendar: calendarExtension,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }

    try {
        return new Intl.DateTimeFormat(localeString, options).format(dateObj)
    } catch (error) {
        console.warn('DateTime formatting failed, falling back to Gregorian:', error)
        const fallbackOptions: Intl.DateTimeFormatOptions = {
            ...options,
            calendar: 'gregory',
        }
        return new Intl.DateTimeFormat(localeString, fallbackOptions).format(dateObj)
    }
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
 * @param calendar - The calendar system to use
 * @returns Formatted date string suitable for UI display
 */
export function formatSavedDate(
    date: Date | string | number,
    locale: string = 'en',
    calendar: CalendarSystem = 'hijri'
): string {
    return formatLocalizedDate(date, locale, 'short', calendar)
}
