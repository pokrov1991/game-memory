import React from 'react'
import { useProgress } from '@/shared/hooks'
import { LEVELS_USER_CONFIG } from '@/shared'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

type GameScoreProps = {
  score: number,
  arcadeLevel?: number
}

export const GameScore: React.FC<GameScoreProps> = ({ score, arcadeLevel }) => {
  const { t } = useI18n()
  const { userLevel } = useProgress()

  let level = userLevel
  let scoreEnd = LEVELS_USER_CONFIG[userLevel].score
  let scoreStart = userLevel > 1 ? LEVELS_USER_CONFIG[userLevel - 1].score : 0
  if (arcadeLevel) {
    level = arcadeLevel
    scoreEnd = 9999
    scoreStart = 0
  }
  const scoreLevel = scoreEnd - scoreStart
  const scoreCurrent = score - scoreStart
  const scorePercent = (scoreCurrent / scoreLevel) * 100

  return (
    <div className={styles['game-score']}>
      <div className={styles['game-score__level']}>
        <div className={styles['game-score__level-wrap']}>
          <b>{t('common.level')}</b>
          <strong>{level}</strong>
          <i>
            {score}
            <span>/{scoreEnd}</span>
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
