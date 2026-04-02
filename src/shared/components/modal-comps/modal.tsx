import { PropsWithChildren } from 'react'
import { TModal } from './types'
import Portal from './portal'
import style from './modal.module.css'
import topbar from '/ui/modal-topbar.svg'

export const Modal = ({
  isOpened,
  type,
  children,
}: PropsWithChildren<TModal>) => {
  if (!isOpened) return null

  return (
    <Portal>
      <div className={style['modal']}>
        <div className={style['modal__overlay']}></div>
        <div className={style['modal__wrapper']}>
          <div className={`${style['modal__content']} ${style[`modal__content_${type}`]}`}>
            <div className={style['modal__topbar']}>
              <img src={topbar} alt="!" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </Portal>
  )
}
