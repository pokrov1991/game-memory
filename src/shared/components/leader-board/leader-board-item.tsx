import React from 'react'
import { LeaderboardEntry } from '@/shared/services/platform'
import styles from './styles.module.css'

export const LeaderBoardItem: React.FC<LeaderboardEntry> = ({
  extraData,
  rank,
  score,
  player
}) => {
  return (
    <div className={styles['leader-board-item']}>
      <div className={styles['leader-board-item__place']}>{rank}</div>
      <div className={styles['leader-board-item__avatar']}>
        <div className={styles['leader-board-item__avatar-wrap']}>
          <img src={player.avatar} />
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
