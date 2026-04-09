import React from 'react'
import styles from './styles.module.css'
import { useMusic } from '@/shared/hooks'

export const MusicTheme: React.FC = () => {
  const Button = useMusic({
    src: './music/theme.mp3',
    loop: true,
    ui: true,
  })

  return (<div className={styles['music-theme']}>
    {Button}
  </div>)
  
}
