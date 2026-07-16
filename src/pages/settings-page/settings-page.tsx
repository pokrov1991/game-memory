import { useState } from 'react'
import { Layout, Navigate, Button } from '@/shared/components'
import { Language, useI18n } from '@/shared/services/i18n'
import { useAudio, useProgress } from '@/shared/hooks'
import { useUser } from '@/shared/contexts/UserContext'
import { platformApi } from '@/shared/services/platform'
import styles from './styles.module.css'

const LANGUAGES: Array<{ id: Language; labelKey: string }> = [
  { id: 'ru', labelKey: 'settings.russian' },
  { id: 'en', labelKey: 'settings.english' },
  { id: 'de', labelKey: 'settings.german' },
  { id: 'fr', labelKey: 'settings.french' },
  { id: 'es', labelKey: 'settings.spanish' },
  { id: 'ja', labelKey: 'settings.japanese' },
  { id: 'ko', labelKey: 'settings.korean' },
  { id: 'pl', labelKey: 'settings.polish' },
  { id: 'tr', labelKey: 'settings.turkish' },
  { id: 'zh-CN', labelKey: 'settings.simplifiedChinese' },
  { id: 'pt-BR', labelKey: 'settings.brazilianPortuguese' },
]

export const SettingsPage = () => {
  const { t, language, setLanguage } = useI18n()
  const { game, setGame } = useUser()
  const { settings: savedSettings, updateSettings } = useProgress()
  const [gameFieldSize, setGameFieldSize] = useState(savedSettings.gameFieldSize ?? 75)
  const {
    musicVolume,
    effectsVolume,
    setMusicVolume,
    setEffectsVolume,
  } = useAudio()

  const routes = [
    {
      path: '/',
      name: t('common.back'),
      sort: 20,
    },
    {
      path: '/settings',
      name: t('settings.title'),
      sort: 10,
    },
  ]

  const changeVolume = (volume: number, direction: 1 | -1) => {
    return Math.min(100, Math.max(0, volume + direction * 10))
  }

  const changeGameFieldSize = (direction: 1 | -1) => {
    setGameFieldSize(size => Math.min(100, Math.max(0, size + direction * 5)))
  }

  const handleSave = async () => {
    const settings = {
      language,
      musicVolume,
      effectsVolume,
      gameFieldSize,
    }

    await platformApi.setSettings(settings)
    updateSettings(settings)

    if (game) {
      setGame({
        ...game,
        settings: {
          ...game.settings,
          ...settings,
        },
      })
    }
  }

  const selectLang = (id: Language) => {
    setLanguage(id)
  }

  return (
    <main className={styles['settings-page']}>
      <Layout title={t('settings.title')}>
        <div className={styles['settings-page__container']}>

          <div className={styles['settings-page__navigation']}>
            <Navigate routes={routes} />
          </div>

          <section className={styles['settings-page__section']}>
            <h2>{t('settings.languageTitle')}</h2>

            <div className={styles['settings-page-list']}>
              {LANGUAGES.map((lang) => {
                return (
                  <button
                    type="button"
                    className={language === lang.id
                      ? `${styles['settings-page-list-item']} ${styles['settings-page-list-item_active']}`
                      : styles['settings-page-list-item']}
                    onClick={() => {
                    selectLang(lang.id)
                  }} key={lang.id}>
                    <b>{t(lang.labelKey)}</b>
                  </button>)
              })}
            </div>
          </section>

          <section className={styles['settings-page__section']}>
            <h2>{t('settings.volume')}</h2>

            <div className={styles['settings-page__counters']}>
              <div className={styles['settings-page__counter']}>
                <div className={styles['settings-page__counter-name']}>{t('settings.background')}</div>
                <div className={styles['settings-page__counter-controls']}>
                  <button
                    onClick={() => setMusicVolume(changeVolume(musicVolume, -1))}
                    disabled={musicVolume <= 0}
                  >-</button>
                  <span>{musicVolume}</span>
                  <button
                    onClick={() => setMusicVolume(changeVolume(musicVolume, 1))}
                    disabled={musicVolume >= 100}
                  >+</button>
                </div>
              </div>

              <div className={styles['settings-page__counter']}>
                <div className={styles['settings-page__counter-name']}>{t('common.effects')}</div>
                <div className={styles['settings-page__counter-controls']}>
                  <button
                    onClick={() => setEffectsVolume(changeVolume(effectsVolume, -1))}
                    disabled={effectsVolume <= 0}
                  >-</button>
                  <span>{effectsVolume}</span>
                  <button
                    onClick={() => setEffectsVolume(changeVolume(effectsVolume, 1))}
                    disabled={effectsVolume >= 100}
                  >+</button>
                </div>
              </div>
            </div>
          </section>

          <section className={styles['settings-page__section']}>
            <h2>{t('settings.game')}</h2>

            <div className={styles['settings-page__counter']}>
              <div className={styles['settings-page__counter-name']}>{t('settings.gameFieldSize')}</div>
              <div className={styles['settings-page__counter-controls']}>
                <button
                  onClick={() => changeGameFieldSize(-1)}
                  disabled={gameFieldSize <= 0}
                >-</button>
                <span>{gameFieldSize}%</span>
                <button
                  onClick={() => changeGameFieldSize(1)}
                  disabled={gameFieldSize >= 100}
                >+</button>
              </div>
            </div>
          </section>

          <section className={styles['settings-page__section']}>
            <Button type="button" onClick={handleSave}>
              {t('common.save')}
            </Button>
          </section>
        </div>
      </Layout>
    </main>
  )
}
