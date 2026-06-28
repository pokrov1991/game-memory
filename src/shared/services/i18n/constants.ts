import { en } from './translations/en'
import { ru } from './translations/ru'
import { Language, TranslationDictionary } from './types'

export const DEFAULT_LANGUAGE: Language = 'ru'

export const LANGUAGE_STORAGE_KEY = 'orion7_language'

export const SUPPORTED_LANGUAGES: Language[] = ['ru', 'en']

export const translations: Record<Language, TranslationDictionary> = {
  ru,
  en,
}

export const isLanguage = (value: unknown): value is Language => {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as Language)
}
