import type { DictionaryNamespace, Locale } from './config'
import { DEFAULT_LOCALE, DICTIONARY_NAMESPACES, FALLBACK_LOCALE } from './config'

import enCommon from './locales/en/common.json'
import arCommon from './locales/ar/common.json'

export type NamespaceDictionary = Record<string, string>
export type LocaleDictionaries = Record<DictionaryNamespace, NamespaceDictionary>

const dictionaries: Record<Locale, LocaleDictionaries> = {
  en: {
    common: enCommon,
  },
  ar: {
    common: arCommon,
  },
}

export function getDictionary(locale: Locale, namespace: DictionaryNamespace = 'common'): NamespaceDictionary {
  const resolvedLocale = dictionaries[locale] ? locale : FALLBACK_LOCALE
  const resolvedNamespace = DICTIONARY_NAMESPACES.includes(namespace) ? namespace : 'common'
  return dictionaries[resolvedLocale][resolvedNamespace]
}

export function getAllDictionaries(locale: Locale): LocaleDictionaries {
  const resolvedLocale = dictionaries[locale] ? locale : DEFAULT_LOCALE
  return dictionaries[resolvedLocale]
}
