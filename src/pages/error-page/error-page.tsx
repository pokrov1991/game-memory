import { Button } from '@/shared'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

const bgUrl = './ui/500.png'

export const ErrorPage = () => {
  const { t } = useI18n()

  return (
    <div className={styles.bg} style={{ backgroundImage: `url(${bgUrl})` }}>
      <Button href="/">{t('common.menu')}</Button>
    </div>
  )
}
