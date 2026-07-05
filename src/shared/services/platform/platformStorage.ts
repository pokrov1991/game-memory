import { createDefaultGameProgress } from './defaults'
import { GameProgress } from './types'

const STORAGE_KEY = 'orion7:game-progress:v1'
const LOCAL_PLAYER_KEY = 'orion7:local-player:v1'
const LOCAL_ACHIEVEMENTS_KEY = 'orion7:achievements:v1'
const LOCAL_STATS_KEY = 'orion7:stats:v1'

type LocalPlayer = {
  id: string
  name: string | null
}

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
    return JSON.parse(rawValue)
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

const createLocalPlayerId = (): string => {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const readLocalPlayer = (): LocalPlayer | null => {
  if (!canUseStorage()) return null

  const rawValue = window.localStorage.getItem(LOCAL_PLAYER_KEY)

  if (!rawValue) return null

  try {
    const player = JSON.parse(rawValue) as Partial<LocalPlayer>
    const id = typeof player.id === 'string' ? player.id.trim() : ''
    const name = typeof player.name === 'string' ? player.name.trim() : null

    if (!id) return null

    return {
      id,
      name: name || null,
    }
  } catch {
    return null
  }
}

export const writeLocalPlayer = (player: LocalPlayer): void => {
  if (!canUseStorage()) return

  window.localStorage.setItem(LOCAL_PLAYER_KEY, JSON.stringify({
    id: player.id,
    name: player.name?.trim() || null,
  }))
}

export const readOrCreateLocalPlayer = (): LocalPlayer => {
  const player = readLocalPlayer()

  if (player) return player

  const nextPlayer: LocalPlayer = {
    id: createLocalPlayerId(),
    name: null,
  }

  writeLocalPlayer(nextPlayer)

  return nextPlayer
}

export const readLocalPlayerName = (): string | null => {
  return readLocalPlayer()?.name || null
}

export const writeLocalPlayerName = (name: string): void => {
  const player = readOrCreateLocalPlayer()

  writeLocalPlayer({
    ...player,
    name: name.trim(),
  })
}

export const readLocalAchievements = (): Record<string, boolean> => {
  if (!canUseStorage()) return {}

  const rawValue = window.localStorage.getItem(LOCAL_ACHIEVEMENTS_KEY)

  if (!rawValue) return {}

  try {
    return JSON.parse(rawValue)
  } catch {
    return {}
  }
}

export const writeLocalAchievement = (id: string, value: boolean): void => {
  if (!canUseStorage()) return

  window.localStorage.setItem(LOCAL_ACHIEVEMENTS_KEY, JSON.stringify({
    ...readLocalAchievements(),
    [id]: value,
  }))
}

export const readLocalStats = (): Record<string, number> => {
  if (!canUseStorage()) return {}

  const rawValue = window.localStorage.getItem(LOCAL_STATS_KEY)

  if (!rawValue) return {}

  try {
    return JSON.parse(rawValue)
  } catch {
    return {}
  }
}

export const writeLocalStat = (name: string, value: number): void => {
  if (!canUseStorage()) return

  window.localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify({
    ...readLocalStats(),
    [name]: value,
  }))
}
