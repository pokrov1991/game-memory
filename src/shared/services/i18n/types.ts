import { ru } from './translations/ru'

export type Language = 'ru' | 'en'

export type TranslationDictionary = typeof ru

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never

export type TranslationKey<T = TranslationDictionary> = T extends string
  ? never
  : {
    [K in keyof T]: T[K] extends string
      ? K
      : Join<K, TranslationKey<T[K]>>
  }[keyof T] & string

export type Translate = (key: TranslationKey | string) => string
