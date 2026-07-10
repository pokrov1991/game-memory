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

const callMaybeAsync = async <T>(
  target: unknown,
  keys: string[],
  fallback: T,
  ...args: unknown[]
): Promise<T> => {
  for (const key of keys) {
    const member = getMember<(...methodArgs: unknown[]) => T | Promise<T>>(target, key)

    if (typeof member !== 'function') continue

    try {
      return await member(...args)
    } catch (error) {
      console.error(`Steam API method ${key} failed:`, error)
    }
  }

  return fallback
}

const callVariants = async <T>(
  target: unknown,
  variants: Array<{ keys: string[]; args: unknown[] }>,
  fallback: T
): Promise<T> => {
  for (const variant of variants) {
    const result = await callMaybeAsync<T | null>(target, variant.keys, null, ...variant.args)

    if (result !== null) {
      return result
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

const getSteamLeaderboards = (): unknown => {
  return findSection(['leaderboards', 'leaderboard', 'userStats', 'stats'])
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

type SteamLeaderboardDescription = {
  name: string
  title?: string
}

type SteamLeaderboardEntry = {
  extraData?: string
  rank: number
  score: number
  player: {
    id: string
    name: string
    avatar?: string
  }
}

type SteamLeaderboardEntries = {
  leaderboard: SteamLeaderboardDescription | null
  ranges: Array<{
    start: number
    size: number
  }>
  userRank: number
  entries: SteamLeaderboardEntry[]
}

type SteamLeaderboardOptions = {
  includeUser?: boolean
  quantityAround?: number
  quantityTop?: number
}

const toStringId = (value: unknown): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'bigint') return value.toString()

  if (typeof value === 'object') {
    const steamId64 = getMember<bigint | string | number>(value, 'steamId64')

    if (steamId64) return toStringId(steamId64)
  }

  return String(value)
}

const getRawEntries = (rawData: unknown): unknown[] => {
  if (Array.isArray(rawData)) return rawData
  if (!rawData || typeof rawData !== 'object') return []

  return (
    getMember<unknown[]>(rawData, 'entries') ||
    getMember<unknown[]>(rawData, 'leaderboardEntries') ||
    getMember<unknown[]>(rawData, 'scores') ||
    getMember<unknown[]>(rawData, 'items') ||
    []
  )
}

const getRawEntryValue = (entry: unknown, keys: string[]): unknown => {
  if (!entry || typeof entry !== 'object') return null

  for (const key of keys) {
    const value = getMember<unknown>(entry, key)

    if (value !== undefined && value !== null) {
      return value
    }
  }

  return null
}

const normalizeLeaderboardEntries = (
  leaderboardName: string,
  rawData: unknown,
  options: SteamLeaderboardOptions
): SteamLeaderboardEntries => {
  const rawEntries = getRawEntries(rawData)
  const entries = rawEntries.map((entry, index) => {
    const rank = Number(getRawEntryValue(entry, ['rank', 'globalRank', 'leaderboardRank'])) || index + 1
    const score = Number(getRawEntryValue(entry, ['score', 'value'])) || 0
    const steamId = toStringId(getRawEntryValue(entry, ['steamId', 'steamID', 'user', 'player', 'steamId64']))
    const name = String(getRawEntryValue(entry, ['name', 'personaName', 'playerName']) || steamId || 'Player')
    const details = getRawEntryValue(entry, ['details', 'extraData'])

    return {
      extraData: Array.isArray(details) ? details.join(',') : details ? String(details) : undefined,
      rank,
      score,
      player: {
        id: steamId || `${leaderboardName}:${rank}`,
        name,
      },
    }
  })

  const localSteamId = getSteamId()
  const userEntry = entries.find(entry => entry.player.id === localSteamId)

  return {
    leaderboard: {
      name: leaderboardName,
      title: leaderboardName,
    },
    ranges: [
      {
        start: 1,
        size: options.quantityTop || entries.length,
      },
    ],
    userRank: userEntry?.rank || 0,
    entries,
  }
}

const getLeaderboardHandle = async (leaderboardName: string): Promise<unknown> => {
  const leaderboards = getSteamLeaderboards()

  return callVariants<unknown>(leaderboards, [
    { keys: ['findLeaderboard', 'getLeaderboard', 'find'], args: [leaderboardName] },
    { keys: ['findOrCreateLeaderboard', 'createLeaderboard', 'create'], args: [leaderboardName] },
    { keys: ['findOrCreateLeaderboard'], args: [leaderboardName, 2, 1] },
    { keys: ['findOrCreateLeaderboard'], args: [leaderboardName, 'Descending', 'Numeric'] },
  ], null)
}

export const getLeaderboard = async (
  leaderboardName: string
): Promise<SteamLeaderboardDescription | null> => {
  if (!initSteam()) return null

  const handle = await getLeaderboardHandle(leaderboardName)

  if (!handle) return null

  return {
    name: leaderboardName,
    title: leaderboardName,
  }
}

export const setLeaderboardScore = async (
  leaderboardName: string,
  score: number,
  extraData?: string
): Promise<boolean> => {
  if (!initSteam()) return false

  const leaderboards = getSteamLeaderboards()
  const handle = await getLeaderboardHandle(leaderboardName)

  if (!handle) return false

  const parsedExtraData = Number(extraData)
  const details = Number.isFinite(parsedExtraData) ? [parsedExtraData] : []

  const result = await callVariants<unknown>(leaderboards, [
    { keys: ['uploadScore', 'setScore'], args: [handle, score, details] },
    { keys: ['uploadLeaderboardScore'], args: [handle, score, details] },
    { keys: ['uploadLeaderboardScore'], args: [handle, 1, score, details] },
    { keys: ['setLeaderboardScore'], args: [leaderboardName, score, details] },
  ], null)

  return result !== null
}

export const getLeaderboardEntries = async (
  leaderboardName: string,
  options: SteamLeaderboardOptions
): Promise<SteamLeaderboardEntries> => {
  if (!initSteam()) {
    return {
      leaderboard: null,
      ranges: [],
      userRank: 0,
      entries: [],
    }
  }

  const leaderboards = getSteamLeaderboards()
  const handle = await getLeaderboardHandle(leaderboardName)

  if (!handle) {
    return {
      leaderboard: null,
      ranges: [],
      userRank: 0,
      entries: [],
    }
  }

  const quantityTop = options.quantityTop || 10
  const quantityAround = options.quantityAround || 0
  const aroundStart = quantityAround > 0 ? -quantityAround : 1
  const aroundEnd = quantityAround > 0 ? quantityAround : quantityTop

  const rawData = await callVariants<unknown>(leaderboards, [
    { keys: ['downloadScores', 'getScores'], args: [handle, 'Global', 1, quantityTop] },
    { keys: ['downloadLeaderboardEntries', 'getLeaderboardEntries'], args: [handle, 0, 1, quantityTop] },
    { keys: ['downloadScores', 'getScores'], args: [handle, 'GlobalAroundUser', aroundStart, aroundEnd] },
    { keys: ['downloadLeaderboardEntries', 'getLeaderboardEntries'], args: [handle, 1, aroundStart, aroundEnd] },
    { keys: ['getEntries'], args: [leaderboardName, options] },
  ], null)

  return normalizeLeaderboardEntries(leaderboardName, rawData, options)
}
