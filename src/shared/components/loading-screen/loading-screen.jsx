import styles from './styles.module.css'
import { useI18n } from '@/shared/services/i18n'

export const LoadingScreen = ({ progress, error }) => {
  const { t } = useI18n()

  return (
    <div className={styles['loading-screen']}>
      <div className={styles['loading-box']}>
        <h1 className={styles['loading-title']}>ORION-7</h1>

        <h2 className={styles['loading-pre-title']}>{t('loading.title')}</h2>

        <div className={styles['loading-bar']}>
          <div
            className={styles['loading-bar-fill']}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={styles['loading-percent']}>
          {error ? t('loading.error') : `${progress}%`}
        </div>

        {error && <div className={styles['loading-error']}>{error}</div>}
      </div>
    </div>
  )
}
