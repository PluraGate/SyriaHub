export const SUPPORTED_LOCALES = ['en', 'ar'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
export const RTL_LOCALES: ReadonlySet<Locale> = new Set(['ar'])

export const FALLBACK_LOCALE: Locale = DEFAULT_LOCALE

export const DICTIONARY_NAMESPACES = ['common'] as const
export type DictionaryNamespace = (typeof DICTIONARY_NAMESPACES)[number]

export function isLocale(candidate: string | undefined | null): candidate is Locale {
  if (!candidate) return false
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(candidate)
}

export function resolveLocale(candidate?: string | null): Locale {
  if (candidate && isLocale(candidate)) return candidate
  return DEFAULT_LOCALE
}

export function isRtlLocale(locale: Locale): boolean {
  return RTL_LOCALES.has(locale)
}
