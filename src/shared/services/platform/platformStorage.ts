import { createDefaultGameProgress } from './defaults'
import { GameProgress } from './types'

const STORAGE_KEY = 'orion7:game-progress:v1'

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export const readLocalGameProgress = (): GameProgress => {
  if (!canUseStorage()) {
    return createDefaultGameProgress()
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    const defaultProgress = createDefaultGameProgress()
    writeLocalGameProgress(defaultProgress)
    return defaultProgress
  }

  try {
    return {
      ...createDefaultGameProgress(),
      ...JSON.parse(rawValue),
    }
  } catch {
    const defaultProgress = createDefaultGameProgress()
    writeLocalGameProgress(defaultProgress)
    return defaultProgress
  }
}

export const writeLocalGameProgress = (progress: GameProgress): void => {
  if (!canUseStorage()) return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}
