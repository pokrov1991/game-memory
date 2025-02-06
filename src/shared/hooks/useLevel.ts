import Mediator from '@/shared/controllers/mediator'
import { useState } from 'react'
import { GameLevelStateType, GameLevelStoreType } from '@/shared/services/game/types'
import { LEVELS_STATE, LEVELS_STORE } from '@/shared/services/game/constants'

type UseLevelOutput<T> = [T, (value: number) => void]

const eventBus = new Mediator()

export const useLevel = <T extends GameLevelStateType | GameLevelStoreType>(
  levelId: number,
  type: 'battle' | 'store'
): UseLevelOutput<T> => {
  const levels = type === 'battle' ? (LEVELS_STATE as GameLevelStateType[]) : (LEVELS_STORE as GameLevelStoreType[])
  const levelDefault = (levels.find(level => level.id === levelId) || levels[0]) as T
  const [level, setLevel] = useState<T>(levelDefault)
  eventBus.emit('game:level', levelDefault)

  const set = (levelId: number) => {
    const level = (levels.find(level => level.id === levelId) || levels[0]) as T
    setLevel(level)
    eventBus.emit('game:level', level)
  }

  return [level, set]
}
