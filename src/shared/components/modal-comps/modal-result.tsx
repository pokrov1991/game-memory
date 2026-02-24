import { Modal } from '.'
import { MouseEvent } from 'react'
import { Button, Typography } from '@mui/material'
import { TModalNonType, TypeModal } from './types'
import style from './modal-content.module.css'

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
  return (
    <Modal isOpened={isOpened} type={type}>
      <div className={style['result']}>
        <Typography
          marginBottom="10px"
          fontSize="60px"
          variant="h3"
          color="white">
          {type === TypeModal.Win ? 'Победа!' : 'Поражение!'}
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
            <span>Продолжить</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
