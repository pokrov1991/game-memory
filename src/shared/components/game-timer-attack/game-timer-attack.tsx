import React, { useState, useEffect } from 'react'
import { STUN_ANIMATION_DELAY } from '@/shared/services/game/constants'

type GameTimerAttackProps = {
  isPause: boolean
  isStun: boolean
  restartKey: number
  initialSeconds: number[]
  initialAttacks: number[]
  onAttack: (attack: number) => void
  onSeconds: (seconds: number) => void
}

export const GameTimerAttack: React.FC<GameTimerAttackProps> = ({
  isPause,
  isStun,
  restartKey,
  initialSeconds,
  initialAttacks,
  onAttack,
  onSeconds,
}) => {
  const [index, setIndex] = useState(0)
  const [seconds, setSeconds] = useState(initialSeconds[index])
  const [isStunPause, setStunPause] = useState(false)

  useEffect(() => {
    setIndex(0)
    setSeconds(initialSeconds[0])
  }, [restartKey])

  useEffect(() => {
    if (isStun) {
      const stunDelay = STUN_ANIMATION_DELAY + 100 * initialAttacks[index]
      console.log('stun', stunDelay)
      setStunPause(true)
      setTimeout(() => {
        setStunPause(false)
      }, stunDelay)
    }
  }, [isStun])

  useEffect(() => {
    if (seconds > 0) {
      if (isPause || isStunPause) {
        return
      }

      const timerId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1)
      }, 1000)

      onSeconds(seconds)

      return () => clearInterval(timerId)
    } else {
      onAttack(initialAttacks[index])

      let indexNext = index + 1
      if (index === initialSeconds.length - 1) {
        indexNext = 0
      }

      setIndex(indexNext)
      setSeconds(initialSeconds[indexNext])
    }
  }, [isPause, isStunPause, seconds])

  return ('')
}
