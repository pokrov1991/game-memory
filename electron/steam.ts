import { shell } from 'electron'
import { createRequire } from 'module'

type SteamworksModule = {
  init?: (appId?: number) => unknown
  electronEnableSteamOverlay?: () => void
}

type SteamClient = Record<string, unknown>

const require = createRequire(import.meta.url)

let client: SteamClient | null = null
let initError: unknown = null
let overlayHookEnabled = false

const getMember = <T>(target: unknown, key: string): T | null => {
  if (!target || typeof target !== 'object') return null

  const value = (target as Record<string, unknown>)[key]

  return value as T
}

const call = <T>(
  target: unknown,
  keys: string[],
  fallback: T,
  ...args: unknown[]
): T => {
  for (const key of keys) {
    const member = getMember<(...methodArgs: unknown[]) => T>(target, key)

    if (typeof member === 'function') {
      return member(...args)
    }
  }

  return fallback
}

const findSection = (keys: string[]): unknown => {
  for (const key of keys) {
    const section = getMember<unknown>(client, key)

    if (section) return section
  }

  return client
}

const requireSteamworks = (): SteamworksModule => {
  return require('steamworks.js') as SteamworksModule
}

const getAppId = (): number | undefined => {
  const rawAppId = process.env.STEAM_APP_ID || process.env.VITE_STEAM_APP_ID
  const appId = Number(rawAppId)

  return Number.isFinite(appId) && appId > 0 ? appId : undefined
}

export const initSteam = (): boolean => {
  if (client) return true
  if (initError) return false

  try {
    const steamworks = requireSteamworks()

    if (typeof steamworks.init !== 'function') {
      throw new Error('steamworks.js init() is not available')
    }

    client = steamworks.init(getAppId()) as SteamClient
    console.log('Steam API initialized')
    return true
  } catch (error) {
    initError = error
    console.error('Steam API init failed:', error)
    return false
  }
}

export const enableSteamOverlayForElectron = (): void => {
  if (overlayHookEnabled) return

  try {
    const steamworks = requireSteamworks()

    if (typeof steamworks.electronEnableSteamOverlay === 'function') {
      steamworks.electronEnableSteamOverlay()
      overlayHookEnabled = true
    }
  } catch (error) {
    console.error('Steam Overlay Electron hook failed:', error)
  }
}

export const isSteamAvailable = (): boolean => {
  return initSteam()
}

export const getSteamId = (): string | null => {
  if (!initSteam()) return null

  const localPlayer = findSection(['localplayer', 'localPlayer', 'user'])
  const steamId = call<unknown>(localPlayer, ['getSteamId', 'getSteamID', 'steamId'], null)

  if (!steamId) return null
  if (typeof steamId === 'string') return steamId
  if (typeof steamId === 'number') return String(steamId)
  if (typeof steamId === 'object') {
    const steamId64 = getMember<bigint | string | number>(steamId, 'steamId64')

    if (typeof steamId64 === 'bigint') return steamId64.toString()
    if (typeof steamId64 === 'string') return steamId64
    if (typeof steamId64 === 'number') return String(steamId64)
  }

  return call<string>(steamId, ['toString'], '')
}

export const getPersonaName = (): string | null => {
  if (!initSteam()) return null

  const localPlayer = findSection(['localplayer', 'localPlayer', 'user'])
  const personaName = call<string | null>(
    localPlayer,
    ['getName', 'getPersonaName', 'personaName'],
    null
  )

  return personaName || null
}

export const isOverlayAvailable = (): boolean => {
  return initSteam()
}

export const openOverlay = async (type = 'friends'): Promise<void> => {
  if (!initSteam()) return

  const overlay = findSection(['overlay', 'friends'])
  const dialogByType: Record<string, number> = {
    achievements: 6,
    community: 1,
    friends: 0,
    players: 2,
    settings: 3,
    stats: 5,
  }

  const opened = type === 'store'
    ? call<boolean | null>(overlay, ['activateToStore'], null, getAppId() || 0, 0)
    : call<boolean | null>(
      overlay,
      ['activateDialog', 'activateGameOverlay', 'openOverlay', 'activateOverlay'],
      null,
      dialogByType[type] ?? type
    )

  if (opened === null && type === 'store' && process.env.STEAM_APP_ID) {
    await shell.openExternal(`steam://store/${process.env.STEAM_APP_ID}`)
  }
}

export const unlockAchievement = (id: string): void => {
  if (!initSteam()) return

  const achievements = findSection(['achievement', 'achievements', 'localplayer'])

  call<void>(achievements, ['activate', 'setAchievement', 'activateAchievement', 'unlockAchievement'], undefined, id)
  storeStats()
  console.log('Steam achievement unlocked:', id)
}

export const getAchievement = (id: string): boolean => {
  if (!initSteam()) return false

  const achievements = findSection(['achievement', 'achievements', 'localplayer'])

  return call<boolean>(achievements, ['isActivated', 'getAchievement', 'isAchievementUnlocked'], false, id)
}

export const setStat = (name: string, value: number): void => {
  if (!initSteam()) return

  const stats = findSection(['stats', 'userStats'])

  call<void>(stats, ['setInt', 'setStat', 'setIntStat'], undefined, name, value)
  console.log('Steam stat updated:', name, value)
}

export const getStat = (name: string): number => {
  if (!initSteam()) return 0

  const stats = findSection(['stats', 'userStats'])

  return call<number | null>(stats, ['getInt', 'getStat', 'getIntStat'], 0, name) || 0
}

export const storeStats = (): void => {
  if (!initSteam()) return

  const stats = findSection(['stats', 'userStats', 'achievement', 'achievements'])

  call<void>(stats, ['store', 'storeStats'], undefined)
}

export const saveCloudFile = (name: string, data: string): void => {
  if (!initSteam()) return

  const remoteStorage = findSection(['remoteStorage', 'remotestorage', 'cloud'])

  call<void>(remoteStorage, ['writeFile', 'fileWrite', 'write'], undefined, name, data)
  console.log('Steam Cloud save success:', name)
}

export const readCloudFile = (name: string): string | null => {
  if (!initSteam()) return null

  const remoteStorage = findSection(['remoteStorage', 'remotestorage', 'cloud'])
  const exists = call<boolean | null>(
    remoteStorage,
    ['fileExists', 'exists'],
    null,
    name
  )

  if (exists === false) return null

  const data = call<unknown>(remoteStorage, ['readFile', 'fileRead', 'read'], null, name)

  if (!data) return null
  if (typeof data === 'string') return data
  if (data instanceof Buffer) return data.toString('utf8')

  return String(data)
}
