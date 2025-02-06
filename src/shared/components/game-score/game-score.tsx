import React from 'react'
import { CARD_SCORE } from '@/shared/services/game/constants'
import { GameLevelStateType, GameLevelStoreType } from '@/shared/services/game/types'
import { useProgress } from '@/shared/hooks'
import styles from './styles.module.css'

type GameScoreProps = {
  score: number
  level: GameLevelStateType | GameLevelStoreType
}

export const GameScore: React.FC<GameScoreProps> = ({ score, level }) => {
  const { selectedLevel } = useProgress()
  // Скколько карт, столько и очков
  // const scoreLevel = (level.cardCount * CARD_SCORE) / 2
  // Максимальное кол-во очков, с учетом умножений
  const scoreLevel = CARD_SCORE * ((level.cardCount / 2) * ((level.cardCount/2) + 1)) / 2
  const scorePercent = (score / scoreLevel) * 100

  return (
    <div className={styles['game-score']}>
      <div className={styles['game-score__level']}>
        <div className={styles['game-score__level-wrap']}>
          <b>Ур.</b>
          <strong>{selectedLevel}</strong>
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
