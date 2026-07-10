/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLATFORM_API?: 'yandex' | 'local' | 'desktop' | 'steam'
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  desktopApi?: {
    platform: 'desktop'
    quit(): Promise<void>
    versions: {
      electron: string
      chrome: string
      node: string
    }
  }
  steamApi?: {
    isAvailable(): Promise<boolean>
    init(): Promise<boolean>
    getSteamId(): Promise<string | null>
    getPersonaName(): Promise<string | null>
    isOverlayAvailable(): Promise<boolean>
    openOverlay(type?: string): Promise<void>
    unlockAchievement(id: string): Promise<void>
    getAchievement(id: string): Promise<boolean>
    setStat(name: string, value: number): Promise<void>
    getStat(name: string): Promise<number>
    storeStats(): Promise<void>
    saveCloudFile(name: string, data: string): Promise<void>
    readCloudFile(name: string): Promise<string | null>
    getLeaderboard(leaderboardName: string): Promise<import('@/shared/services/platform').LeaderboardDescription | null>
    setLeaderboardScore(leaderboardName: string, score: number, extraData?: string): Promise<boolean>
    getLeaderboardEntries(leaderboardName: string, options: import('@/shared/services/platform').LeaderboardOptions): Promise<import('@/shared/services/platform').LeaderboardEntries>
  }
}
