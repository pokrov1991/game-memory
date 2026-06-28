import { Modal } from '.'
import { Button, Typography } from '@mui/material'
import { MouseEvent } from 'react'
import { TModalNonType, TypeModal } from './types'
import style from './modal-content.module.css'
import { useI18n } from '@/shared/services/i18n'

interface IProps extends TModalNonType {
  onContinue(e?: MouseEvent<HTMLButtonElement>): void,
  level: number
}

export const ModalLevelUp = ({
  onContinue,
  level,
  isOpened
}: IProps) => {
  const { t } = useI18n()

  return (
    <Modal isOpened={isOpened} type={TypeModal.Exit}>
      <div className={style['exit']}>
        <Typography marginBottom="8px" fontSize="22px" color="white">
          {t('xp.levelTitle')} {level} {t('xp.levelReached')}
        </Typography>
        <Typography marginBottom="40px" fontSize="22px" color="#BAB8BB">
          {t('xp.upgradeInfo')}
        </Typography>
        <Typography marginBottom="50px" fontSize="22px" color="white">
          {t('xp.totalSpheres')}: {level}
        </Typography>
      </div>
      <div className={style['actions']}>
        <div className={style['approve-wrapper']}>
          <Button
            size="large"
            color="inherit"
            className={style['approve']}
            onClick={onContinue}>
            <span>{t('common.continue')}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
