import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useUser } from '@/shared/contexts/UserContext'
import { platformApi } from '@/shared/services/platform'
import {
  DEFAULT_LANGUAGE,
  isLanguage,
  translations,
} from './constants'
import { Language, Translate, TranslationKey } from './types'

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => Promise<void>
  t: Translate
}

const I18nContext = createContext<I18nContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: async () => {},
  t: (key) => key,
})

const getTranslation = (language: Language, key: TranslationKey | string): string => {
  const parts = key.split('.')
  let value: unknown = translations[language]

  for (const part of parts) {
    if (!value || typeof value !== 'object' || !(part in value)) {
      return key
    }

    value = (value as Record<string, unknown>)[part]
  }

  return typeof value === 'string' ? value : key
}

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const { game, loading, setGame } = useUser()
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)

  useEffect(() => {
    if (loading) return

    let cancelled = false

    const loadLanguage = async () => {
      try {
        const savedLanguage = await platformApi.getLanguage()
        const nextLanguage = isLanguage(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE

        if (!cancelled) {
          setLanguageState(nextLanguage)
        }

        if (!isLanguage(savedLanguage)) {
          await platformApi.setLanguage(DEFAULT_LANGUAGE)
        }
      } catch {
        if (!cancelled) {
          setLanguageState(DEFAULT_LANGUAGE)
        }
      }
    }

    loadLanguage()

    return () => {
      cancelled = true
    }
  }, [loading])

  const setLanguage = useCallback(async (nextLanguage: Language) => {
    const normalizedLanguage = isLanguage(nextLanguage) ? nextLanguage : DEFAULT_LANGUAGE

    setLanguageState(normalizedLanguage)

    try {
      await platformApi.setLanguage(normalizedLanguage)

      if (game) {
        setGame({
          ...game,
          language: normalizedLanguage,
        })
      }
    } catch {
      setLanguageState(DEFAULT_LANGUAGE)
    }
  }, [game, setGame])

  const t = useCallback<Translate>((key) => {
    return getTranslation(language, key)
  }, [language])

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
