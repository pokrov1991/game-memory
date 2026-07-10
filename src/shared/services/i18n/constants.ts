import { de } from './translations/de'
import { en } from './translations/en'
import { es } from './translations/es'
import { fr } from './translations/fr'
import { ja } from './translations/ja'
import { ko } from './translations/ko'
import { pl } from './translations/pl'
import { ptBR } from './translations/pt-BR'
import { ru } from './translations/ru'
import { tr } from './translations/tr'
import { zhCN } from './translations/zh-CN'
import { Language, TranslationDictionary } from './types'

export const DEFAULT_LANGUAGE: Language = 'en'

export const SUPPORTED_LANGUAGES: Language[] = [
  'ru',
  'en',
  'de',
  'fr',
  'es',
  'ja',
  'ko',
  'pl',
  'tr',
  'zh-CN',
  'pt-BR',
]

export const translations: Record<Language, TranslationDictionary> = {
  ru,
  en,
  de,
  fr,
  es,
  ja,
  ko,
  pl,
  tr,
  'zh-CN': zhCN,
  'pt-BR': ptBR,
}

export const isLanguage = (value: unknown): value is Language => {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as Language)
}
