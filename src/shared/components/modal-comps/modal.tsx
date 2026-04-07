import { PropsWithChildren } from 'react'
import { TModal } from './types'
import classNames from 'classnames'
import Portal from './portal'
import style from './modal.module.css'

const topbar = '/ui/modal-topbar.svg'

export const Modal = ({
  isOpened,
  type,
  children,
  className
}: PropsWithChildren<TModal>) => {
  if (!isOpened) return null

  return (
    <Portal>
      <div className={classNames(style['modal'], { [className]: className })}>
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
