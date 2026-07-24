import { Button } from '@/shared/components'
import { openSteamPage } from '@/shared/components/full-version-modal'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

const FULL_VERSION_FEATURES = [
  'campaign',
  'enemies',
  'arcade',
  'pvp',
  'equipment',
  'achievements',
]

export const DemoCompletedPage = () => {
  const { t } = useI18n()

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <p className={styles.badge}>{t('demo.badge')}</p>
        <h1>{t('demo.completed.title')}</h1>
        <h2>{t('demo.completed.subtitle')}</h2>
        <p>{t('demo.completed.text')}</p>
        <p>{t('demo.completed.featuresTitle')}</p>
        <ul>
          {FULL_VERSION_FEATURES.map(feature => (
            <li key={feature}>{t(`demo.completed.features.${feature}`)}</li>
          ))}
        </ul>
        <p>{t('demo.completed.steamPrompt')}</p>
        <Button onClick={openSteamPage}>{t('demo.fullVersion.button')}</Button>
      </section>
    </main>
  )
}
