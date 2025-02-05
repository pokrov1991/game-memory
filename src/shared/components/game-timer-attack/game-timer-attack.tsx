import React, { useState, useEffect } from 'react'
import { STUN_ANIMATION_DELAY, PARRY_ANIMATION_DELAY } from '@/shared/services/game/constants'

type GameTimerAttackProps = {
  isPause: boolean
  isStun: boolean
  restartKey: number
  colorParry: string
  initialSeconds: number[] // Время атаки в секундах
  initialAttacks: number[] // Количество урона в %
  initialColors: string[]  // Цвета атаки
  onEnemyAttack: (attack: number) => void
  onTimer: (seconds: number, color: string) => void
}

export const GameTimerAttack: React.FC<GameTimerAttackProps> = ({
  isPause,
  isStun,
  restartKey,
  colorParry,
  initialSeconds,
  initialAttacks,
  initialColors,
  onEnemyAttack,
  onTimer,
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
      if (initialColors[index] === colorParry) {
        console.log('parry')
        parryDelay = PARRY_ANIMATION_DELAY
        setSeconds(0)
      }
      
      // Задаем оглушение
      const stunDelay = STUN_ANIMATION_DELAY + 100 * initialAttacks[index]
      console.log('stun', stunDelay/1000)
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

      onTimer(seconds, initialColors[index])

      return () => clearInterval(timerId)
    } else {
      if (initialColors[index] !== colorParry) {
        onEnemyAttack(initialAttacks[index])
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
