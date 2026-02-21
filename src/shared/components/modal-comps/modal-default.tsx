import { Modal } from '.'
import { Button, Typography } from '@mui/material'
import { TModalNonType, TypeModal } from './types'
import style from './modal-content.module.css'

export const ModalDefault = ({
  onExit,
  onContinue,
  title,
  subtitle,
  isOpened,
  info
}: TModalNonType) => {
  return (
    <Modal isOpened={isOpened} type={TypeModal.Exit}>
      <div className={style['exit']}>
        <Typography marginBottom="8px" fontSize="22px" color="white">
          {title}
        </Typography>
        <Typography marginBottom="40px" fontSize="22px" color="#BAB8BB">
          {subtitle}
        </Typography>
        <Typography marginBottom="50px" fontSize="22px" color="white">
          {info}
        </Typography>
      </div>
      <div className={style['actions']}>
        <div className={style['approve-wrapper']}>
          <Button
            size="large"
            color="inherit"
            className={style['approve']}
            onClick={onContinue}>
            <span>Да</span>
          </Button>
        </div>
        <div className={style['approve-dark-wrapper']}>
          <Button
            size="large"
            color="inherit"
            className={style['approve-dark']}
            onClick={onExit}>
            <span>Нет</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
