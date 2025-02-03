import React, { useState, useEffect } from 'react'
import { STUN_ANIMATION_DELAY, PARRY_ANIMATION_DELAY } from '@/shared/services/game/constants'

type GameTimerAttackProps = {
  isPause: boolean
  isStun: boolean
  restartKey: number
  colorCard: string
  initialSeconds: number[] // Время атаки в секундах
  initialAttacks: number[] // Количество урона в %
  initialColors: string[]  // Цвета атаки
  onAttack: (attack: number) => void
  onSeconds: (seconds: number, color: string) => void
}

export const GameTimerAttack: React.FC<GameTimerAttackProps> = ({
  isPause,
  isStun,
  restartKey,
  colorCard,
  initialSeconds,
  initialAttacks,
  initialColors,
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
      // Учитываем парирование
      let parryDelay = 0
      if (initialColors[index] === colorCard) {
        console.log('parry')
        parryDelay = PARRY_ANIMATION_DELAY
        setSeconds(0)
      }
      
      // Задаем оглушение
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

      onSeconds(seconds, initialColors[index])

      return () => clearInterval(timerId)
    } else {
      if (initialColors[index] !== colorCard) {
        onAttack(initialAttacks[index])
      }

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
