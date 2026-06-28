import { Layout, Navigate, Button } from '@/shared/components'
import { Language, useI18n } from '@/shared/services/i18n'
import { useAudio, useProgress } from '@/shared/hooks'
import { useUser } from '@/shared/contexts/UserContext'
import { platformApi } from '@/shared/services/platform'
import styles from './styles.module.css'

const LANGUAGES: Array<{ id: Language; labelKey: string }> = [
  { id: 'ru', labelKey: 'settings.russian' },
  { id: 'en', labelKey: 'settings.english' },
]

export const SettingsPage = () => {
  const { t, language, setLanguage } = useI18n()
  const { game, setGame } = useUser()
  const { updateSettings } = useProgress()
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

  const handleSave = async () => {
    const settings = {
      language,
      musicVolume,
      effectsVolume,
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
            
            <Button type="button" onClick={handleSave}>
              {t('common.save')}
            </Button>
          </section>
        </div>
      </Layout>
    </main>
  )
}
