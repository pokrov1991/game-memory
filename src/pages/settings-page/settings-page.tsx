import { Layout, Navigate, Button } from '@/shared/components'
import { Language, useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

const LANGUAGES: Array<{ id: Language; labelKey: string }> = [
  { id: 'ru', labelKey: 'settings.russian' },
  { id: 'en', labelKey: 'settings.english' },
]

export const SettingsPage = () => {
  const { t, language, setLanguage } = useI18n()

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

  const handleSave = () => {
    console.log('Сохранить настройки')
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
                  <button onClick={() => {}} disabled={true}>-</button>
                  <span>100</span>
                  <button onClick={() => {}} disabled={false}>+</button>
                </div>
              </div>

              <div className={styles['settings-page__counter']}>
                <div className={styles['settings-page__counter-name']}>{t('common.effects')}</div>
                <div className={styles['settings-page__counter-controls']}>
                  <button onClick={() => {}} disabled={true}>-</button>
                  <span>100</span>
                  <button onClick={() => {}} disabled={false}>+</button>
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
