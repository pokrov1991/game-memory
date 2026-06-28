import classNames from 'classnames'
import { Typography } from '@mui/material'
import { useOrientationGuard } from '@/shared/hooks'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

const rotateIcon = './ui/icons/screen-rotate.svg'

export const OrientationOverlay = () => {
  const { t } = useI18n()
  const { shouldBlock, expectedOrientation } = useOrientationGuard()

  if (!shouldBlock || expectedOrientation === null) {
    return null
  }

  const orientationText = expectedOrientation === 'portrait'
    ? t('orientation.descriptionPortrait')
    : t('orientation.descriptionLandscape')

  return (
    <div className={classNames(styles.overlay, {[styles.overlay_portrait]: expectedOrientation === 'portrait'})} role="dialog" aria-modal="true" aria-live="polite">
      <div className={styles.content}>
        <img className={styles.icon} src={rotateIcon} alt="" aria-hidden="true" />
        <Typography className={styles.title} component="h1" fontFamily={'Roboto'}>
          {t('orientation.title')}
        </Typography>
        <Typography className={styles.description} fontFamily={'Roboto'}>
          {orientationText}
        </Typography>
      </div>
    </div>
  )
}
