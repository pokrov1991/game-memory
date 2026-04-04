import { Modal } from '.'
import { Button, Typography } from '@mui/material'
import { TModalNonType, TypeModal } from './types'
import style from './modal-content.module.css'

export const ModalDefault = ({
  onExit,
  onContinue,
  className,
  title,
  subtitle,
  isOpened,
  info,
  buttonSuccess = 'Да',
  buttonCancel = 'Нет',
  isButtonCancel = true
}: TModalNonType) => {
  return (
    <Modal className={className} isOpened={isOpened} type={TypeModal.Exit}>
      <div className={style['exit']}>
        <Typography marginBottom="8px" fontSize="22px" color="white">
          {title}
        </Typography>
        <Typography marginBottom="40px" fontSize="22px" color="#BAB8BB">
          {subtitle}
        </Typography>
        <Typography marginBottom="50px" fontSize="22px" color="white" component="div">
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
            <span>{buttonSuccess}</span>
          </Button>
        </div>
        <div className={style['approve-dark-wrapper']}>
          {isButtonCancel && (
            <Button
              size="large"
              color="inherit"
              className={style['approve-dark']}
              onClick={onExit}>
              <span>{buttonCancel}</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
