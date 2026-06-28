import { en } from './translations/en'
import { ptBR } from './translations/pt-BR'
import { ru } from './translations/ru'
import { zhCN } from './translations/zh-CN'
import { Language, TranslationDictionary } from './types'

export const DEFAULT_LANGUAGE: Language = 'en'

export const SUPPORTED_LANGUAGES: Language[] = ['ru', 'en', 'zh-CN', 'pt-BR']

export const translations: Record<Language, TranslationDictionary> = {
  ru,
  en,
  'zh-CN': zhCN,
  'pt-BR': ptBR,
}

export const isLanguage = (value: unknown): value is Language => {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as Language)
}
