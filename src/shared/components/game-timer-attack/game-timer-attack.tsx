import React, { useState, useEffect } from 'react'

type GameTimerAttackProps = {
  isPause: boolean
  restartKey: number
  initialSeconds: number[]
  initialAttacks: number[]
  onAttack: (attack: number) => void
  onSeconds: (seconds: number) => void
}

export const GameTimerAttack: React.FC<GameTimerAttackProps> = ({
  isPause,
  restartKey,
  initialSeconds,
  initialAttacks,
  onAttack,
  onSeconds,
}) => {
  const [index, setIndex] = useState(0)
  const [seconds, setSeconds] = useState(initialSeconds[index])

  useEffect(() => {
    setIndex(0)
    setSeconds(initialSeconds[0])
  }, [restartKey])

  useEffect(() => {
    if (seconds > 0) {
      if (isPause) {
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
  }, [isPause, seconds])

  return ('')
}
