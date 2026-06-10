import React from 'react'
import styles from './styles.module.css'
import { useAudio } from '@/shared/hooks'

const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 'auto',
  width: '100%',
  height: '100%',
  backgroundColor: 'transparent',
  outline: 'none',
  border: 'none',
  cursor: 'pointer',
}

export const MusicTheme: React.FC = () => {
  const { isMuted, toggleMute, audioUnlocked } = useAudio()

  return (<div className={styles['music-theme']}>
    <button style={buttonStyle} onClick={toggleMute}>
      <img src={isMuted || !audioUnlocked ? '/ui/icons/sound-on.svg' : '/ui/icons/sound-off.svg'} />
    </button>
  </div>)
}
