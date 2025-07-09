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
  onEnemyAttack: (damage: number) => void
  onTick: (seconds: number, attackNumber: number) => void
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
  onTick,
}) => {
  const [attackNumber, setAttackNumber] = useState(0)
  const [seconds, setSeconds] = useState(initialSeconds[attackNumber])
  const [isStunPause, setStunPause] = useState(false)

  useEffect(() => {
    setAttackNumber(0)
    setSeconds(initialSeconds[0])
  }, [restartKey])

  useEffect(() => {
    if (isStun) {
      // Учитываем парирование
      let parryDelay = 0
      if (initialColors[attackNumber] === colorParry) {
        console.log('parry')
        parryDelay = PARRY_ANIMATION_DELAY
        setSeconds(0)
      }
      
      // Задаем оглушение
      const stunDelay = STUN_ANIMATION_DELAY + 100 * initialAttacks[attackNumber]
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

      console.log('tick', seconds)
      onTick(seconds, attackNumber)

      return () => clearInterval(timerId)
    } else {
      if (initialColors[attackNumber] !== colorParry) {
        onEnemyAttack(initialAttacks[attackNumber])
      }

      let nextAttackNumber = attackNumber + 1
      if (attackNumber === initialSeconds.length - 1) {
        nextAttackNumber = 0
      }

      setAttackNumber(nextAttackNumber)
      setSeconds(initialSeconds[nextAttackNumber])
    }
  }, [isPause, isStunPause, seconds])

  return <></>
}
