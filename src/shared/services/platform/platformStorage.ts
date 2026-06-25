import { createDefaultGameProgress } from './defaults'
import { GameProgress } from './types'

const STORAGE_KEY = 'orion7:game-progress:v1'
const LOCAL_PLAYER_NAME_KEY = 'orion7:local-player-name:v1'

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

export const readLocalPlayerName = (): string | null => {
  if (!canUseStorage()) return null

  const name = window.localStorage.getItem(LOCAL_PLAYER_NAME_KEY)?.trim()

  return name || null
}

export const writeLocalPlayerName = (name: string): void => {
  if (!canUseStorage()) return

  window.localStorage.setItem(LOCAL_PLAYER_NAME_KEY, name.trim())
}
