import styles from './styles.module.css'
import React, { useState, useCallback, useEffect } from 'react'
import { ICONS } from '@/shared/constants/icons'
import classNames from 'classnames'

export const Fullscreen: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const handleFullscreenToggle = useCallback(
    () => setIsFullscreen(prevIsFullscreen => !prevIsFullscreen),
    []
  )

  const handleFullscreenChange = useCallback(
    () => setIsFullscreen(!!document.fullscreenElement),
    []
  )

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [handleFullscreenChange])

  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen()
    } else {
      if (document.fullscreenElement !== null) {
        document.exitFullscreen()
      }
    }
  }, [isFullscreen])

  return (
    <div className={styles.fullscreen} onClick={handleFullscreenToggle}>
      <img
        className={classNames(styles.fullscreen__icon, {
          [styles.fullscreen__icon_active]: isFullscreen,
        })}
        src={isFullscreen ? ICONS.FullscreenIn : ICONS.FullscreenOut}
        alt="Fullscreen"
      />
    </div>
  )
}
