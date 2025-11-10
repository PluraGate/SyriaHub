"use client"

import React, { createContext, useContext, useMemo } from 'react'
import type { DictionaryNamespace, Locale } from './config'
import { DEFAULT_LOCALE, DICTIONARY_NAMESPACES, isLocale } from './config'
import type { LocaleDictionaries, NamespaceDictionary } from './dictionaries'

export type TranslateFn = (key: string, fallback?: string) => string

export interface I18nContextValue {
  locale: Locale
  dictionaries: LocaleDictionaries
  t: TranslateFn
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function isNamespace(candidate: string): candidate is DictionaryNamespace {
  return DICTIONARY_NAMESPACES.includes(candidate as DictionaryNamespace)
}

function resolveDictionaryKey(key: string): {
  namespace: keyof LocaleDictionaries
  lookupKey: string
} {
  const [first, maybeRest] = key.split(':')
  if (maybeRest && isNamespace(first)) {
    return { namespace: first, lookupKey: maybeRest }
  }
  return { namespace: 'common', lookupKey: key }
}

function lookupValue(dictionaries: LocaleDictionaries, key: string, fallback?: string): string {
  const { namespace, lookupKey } = resolveDictionaryKey(key)
  const dictionary: NamespaceDictionary | undefined = dictionaries[namespace]
  if (!dictionary) return fallback ?? key
  return dictionary[lookupKey] ?? fallback ?? key
}

export interface I18nProviderProps {
  locale?: string
  dictionaries: LocaleDictionaries
  children: React.ReactNode
}

export function I18nProvider({ locale, dictionaries, children }: I18nProviderProps) {
  const safeLocale: Locale = useMemo(() => {
    if (locale && isLocale(locale)) return locale
    return DEFAULT_LOCALE
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale: safeLocale,
      dictionaries,
      t: (key, fallback) => lookupValue(dictionaries, key, fallback),
    }),
    [dictionaries, safeLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
