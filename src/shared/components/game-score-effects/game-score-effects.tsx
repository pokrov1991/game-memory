import React, { useState, useEffect } from 'react'
import { CARD_SCORE } from '@/shared/services/game/constants'
import styles from './styles.module.css'

type GameScoreProps = {
  score: number
}

export const GameScoreEffects: React.FC<GameScoreProps> = ({ score }) => {
  const [factor, setFactor] = useState<number>(1);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isShowAnimate, setIsShowAnimate] = useState<boolean>(false);

  useEffect(() => {
    const stepScore = score - currentScore
    const factor = stepScore / CARD_SCORE

    setCurrentScore(score)
    setFactor(factor)
    
    if (score > 0) {
      setIsShowAnimate(true)
      setTimeout(() => {
        setIsShowAnimate(false)
      }, 1000)
    } else {
      setCurrentScore(0)
    }
  }, [score])

  const styleScore = {
    display: isShowAnimate ? 'flex' : 'none'
  }

  return (
    <div className={styles['game-score-effects']} style={styleScore}>
      {factor}<small>x</small>{CARD_SCORE}
    </div>
  )
}
