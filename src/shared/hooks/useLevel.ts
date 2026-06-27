import Mediator from '@/shared/controllers/mediator'
import { useEffect, useRef, useState } from 'react'
import { GameLevelStateType, GameLevelStoreType } from '@/shared/services/game/types'
import {
  createLevelsState,
  createLevelsStore,
} from '@/shared/services/game/constants'

type UseLevelOutput<T> = [T, (value: number) => void]

const eventBus = new Mediator()

const createLevels = <T extends GameLevelStateType | GameLevelStoreType>(
  type: 'battle' | 'store'
): T[] => {
  return type === 'battle'
    ? (createLevelsState() as T[])
    : (createLevelsStore() as T[])
}

const findLevel = <T extends GameLevelStateType | GameLevelStoreType>(
  levels: T[],
  levelId: number
): T => {
  return levels.find(level => level.id === levelId) || levels[0]
}

export const useLevel = <T extends GameLevelStateType | GameLevelStoreType>(
  levelId: number,
  type: 'battle' | 'store'
): UseLevelOutput<T> => {
  const selectedLevelIdRef = useRef(levelId)
  const [level, setLevel] = useState<T>(() => {
    return findLevel(createLevels<T>(type), levelId)
  })

  useEffect(() => {
    eventBus.emit('game:level', level)
  }, [level])

  useEffect(() => {
    selectedLevelIdRef.current = levelId
    const nextLevel = findLevel(createLevels<T>(type), levelId)

    setLevel(nextLevel)
  }, [levelId, type])

  useEffect(() => {
    const handleResize = () => {
      const nextLevel = findLevel(createLevels<T>(type), selectedLevelIdRef.current)

      setLevel(nextLevel)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [type])

  const set = (levelId: number) => {
    selectedLevelIdRef.current = levelId
    setLevel(findLevel(createLevels<T>(type), levelId))
  }

  return [level, set]
}
