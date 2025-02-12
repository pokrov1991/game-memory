import React from 'react'
import { useProgress } from '@/shared/hooks'
import { LEVELS_USER_CONFIG } from '@/shared'
import styles from './styles.module.css'

type GameScoreProps = {
  score: number
}

export const GameScore: React.FC<GameScoreProps> = ({ score }) => {
  const { userLevel } = useProgress()
  const scoreLevel = LEVELS_USER_CONFIG[userLevel-1].score
  const scorePercent = (score / scoreLevel) * 100

  return (
    <div className={styles['game-score']}>
      <div className={styles['game-score__level']}>
        <div className={styles['game-score__level-wrap']}>
          <b>Ур.</b>
          <strong>{userLevel}</strong>
          <i>
            {score}
            <span>/{scoreLevel}</span>
          </i>
        </div>
      </div>
      <div className={styles['game-score__scale']}>
        <div className={styles['game-score__ampula']}></div>
        <div className={styles['game-score__line']}>
          <div
            className={styles['game-score__line-wrap']}
            style={{ height: `${scorePercent}%` }}>
            <div className={styles['game-score__line-progress']}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
