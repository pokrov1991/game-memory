import React from 'react'
import { LeaderboardEntry } from '@/shared/services/platform'
import styles from './styles.module.css'

export const LeaderBoardItem: React.FC<LeaderboardEntry> = ({
  extraData,
  rank,
  score,
  player
}) => {
  const stringToColor = (str: string): string => {
    let hash = 0

    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    const hue = Math.abs(hash) % 360
    const saturation = 65
    const lightness = 55

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  const avatarColor = stringToColor(player.name)
  const isAvatar = player.avatar.length > 0

  return (
    <div className={styles['leader-board-item']}>
      <div className={styles['leader-board-item__place']}>{rank}</div>
      <div className={styles['leader-board-item__avatar']}>
        <div className={styles['leader-board-item__avatar-wrap']}>
          {isAvatar ? (
            <img src={player.avatar} />
          ) : (
            <span style={{
                backgroundColor: avatarColor,
              }}>
              {player.name[0]?.toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <div className={styles['leader-board-item__name']}>
        <strong>{player.name}</strong>
        {/* <span>{player.id}</span> */}
      </div>
      <div className={styles['leader-board-item__level']}>
        <small>Lvl.</small>
        {extraData}
      </div>
      <div className={styles['leader-board-item__score']}>{score}</div>
    </div>
  )
}
