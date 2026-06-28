import { Modal } from '.'
import { MouseEvent } from 'react'
import { Button, Typography } from '@mui/material'
import { TModalNonType, TypeModal } from './types'
import style from './modal-content.module.css'
import { useI18n } from '@/shared/services/i18n'

interface IProps extends TModalNonType {
  type: TypeModal.Win | TypeModal.Lose
  onContinue(e?: MouseEvent<HTMLButtonElement>): void
}

export const ModalResult = ({
  onContinue,
  levelName,
  isOpened,
  type,
}: IProps) => {
  const { t } = useI18n()

  return (
    <Modal isOpened={isOpened} type={type}>
      <div className={style['result']}>
        <Typography
          marginBottom="10px"
          fontSize="60px"
          variant="h3"
          color="white">
          {type === TypeModal.Win ? t('modal.win') : t('modal.lose')}
        </Typography>
        <Typography fontSize="24px" marginBottom="60px" color="#BAB8BB">
          {levelName}
        </Typography>
      </div>

      <div className={style['actions']}>
        <div className={style['approve-wrapper']}>
          <Button
            className={style['approve']}
            size="large"
            color="inherit"
            onClick={onContinue}>
            <span>{t('common.continue')}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
