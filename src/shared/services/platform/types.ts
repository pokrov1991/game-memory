import { Language } from '@/shared/services/i18n'

export type PlatformApiKind = 'yandex' | 'local'

export type PlatformUserMode = 'lite' | 'authorized' | 'local' | string

export type PlatformUser = {
  id: string
  name: string
  avatar: string
  mode: PlatformUserMode
  isAuthorized: boolean
}

export type GameProgressInventoryOrgan = {
  id: number
  name: string
  count: number
}

export type GameProgressInventoryItem = {
  id: number
  type: string
  name: string
  desc: string
  price: number
  organs: GameProgressInventoryOrgan[]
  hp: number
  isPaid: boolean
  isDressed: boolean
}

export type GameProgressParams = {
  hp: number
  guard: number
  attack: number
}

export type GameProgressOrgan = {
  id: number
  name: string
  count: number
}

export type GameSettings = {
  language: Language
  musicVolume: number
  effectsVolume: number
}

export type GameProgress = {
  settings: GameSettings
  completedLevels: number[]
  selectedLevelArcade: number
  selectedLevel: number
  userLevel: number
  userLevelParams: GameProgressParams
  userScoreArcade: number
  userScore: number
  userCoins: number
  userPotions: number
  userParams: GameProgressParams
  userInventory: GameProgressInventoryItem[]
  userOrgans: Record<number, GameProgressOrgan>
}

export type LeaderboardPlayer = {
  id: string
  name: string
  avatar?: string
}

export type LeaderboardEntry = {
  extraData?: string
  rank: number
  score: number
  player: LeaderboardPlayer
}

export type LeaderboardOptions = {
  includeUser?: boolean
  quantityAround?: number
  quantityTop?: number
}

export type LeaderboardDescription = {
  name: string
  title?: string
}

export type LeaderboardEntries = {
  leaderboard: LeaderboardDescription | null
  ranges: {
    start: number
    size: number
  }[]
  userRank: number
  entries: LeaderboardEntry[]
}

export type PlatformAuthResult = {
  user: PlatformUser
  game: GameProgress
}

export interface PlatformApi {
  kind: PlatformApiKind
  init(): Promise<void>
  getUserData(): Promise<PlatformUser>
  authUser(): Promise<PlatformAuthResult>
  getGameData(keys?: unknown): Promise<GameProgress>
  setGameData(data: GameProgress): Promise<void>
  showAd(): Promise<void>
  getLeaderboard(leaderboardName: string): Promise<LeaderboardDescription | null>
  setLeaderboardScore(leaderboardName: string, score: number, extraData?: string): Promise<void>
  getLeaderboardEntries(leaderboardName: string, options: LeaderboardOptions): Promise<LeaderboardEntries>
  getSettings(): Promise<GameSettings>
  setSettings(settings: Partial<GameSettings>): Promise<void>
  getLanguage(): Promise<Language | null>
  setLanguage(language: Language): Promise<void>
  isPlayerNameAvailable?(playerName: string): Promise<boolean>
}
