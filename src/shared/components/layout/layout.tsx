import React from 'react'
import styles from './styles.module.css'
import { Clock, Score } from '@/shared'
import { useUser } from '@/shared/contexts/UserContext'
import { TUser } from '@/types'

const LayoutPng = './ui/layout/layout-backgound-min.png'
const OutlinePng = './ui/layout/outer-frame-border-min.png'
const UserBackgroundPng = './ui/layout/user-background-min.png'
const BadgeWebp = './ui/layout/user-badge.webp'
const BadgePng = './ui/layout/user-badge-min.png'

interface ILayoutProps {
  children: React.ReactNode
  title?: string
}

const Fullname = (user: TUser) => {
  return (
    <>
      <div className={styles.userName}>{user?.name}</div>
    </>
  )
}

export const Layout = ({ children, title }: ILayoutProps) => {
  const { user } = useUser();

  return (
    <div className={styles.root}>
      <div
        className={styles.layout}
        style={{ backgroundImage: `url(${OutlinePng})` }}>
        <div
          className={styles.container}
          style={{ backgroundImage: `url(${LayoutPng})` }}>
          <div className={styles.titleLayout}>
            <h1 className={styles.title}>{title}</h1>
          </div>
          {children}
          <div className={styles.userLayout}>
            <div
              className={styles.user}
              style={{ backgroundImage: `url(${UserBackgroundPng})` }}>
              {user !== undefined ? Fullname(user) : null}
            </div>
            <picture>
              <source src={BadgeWebp} type="image/webp" />
              <img className={styles.badge} src={BadgePng} alt="Badge" />
            </picture>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <Clock />
        <Score />
      </div>
    </div>
  )
}
