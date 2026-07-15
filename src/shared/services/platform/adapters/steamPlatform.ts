import { createDefaultGameProgress } from '../defaults'
import { STEAM_SAVE_FILE } from '../config'
import { LocalPlatformApi } from './localPlatform'
import {
  GameProgress,
  LeaderboardDescription,
  LeaderboardEntries,
  LeaderboardOptions,
  PlatformApi,
  PlatformAuthResult,
  PlatformUser,
} from '../types'

const getSteamApi = () => {
  return typeof window === 'undefined' ? undefined : window.steamApi
}

export class SteamPlatformApi extends LocalPlatformApi {
  kind = 'steam' as const
  private initialized = false

  async init(): Promise<void> {
    const steamApi = getSteamApi()

    if (!steamApi) {
      console.error('Steam API bridge is not available')
      await super.init()
      return
    }

    try {
      this.initialized = await steamApi.init()
      console.log(this.initialized ? 'Steam API initialized' : 'Steam API init failed')
    } catch (error) {
      this.initialized = false
      console.error('Steam API init failed:', error)
    }

    await super.init()
  }

  async isSteamInitialized(): Promise<boolean> {
    const steamApi = getSteamApi()

    if (!steamApi) return false

    try {
      this.initialized = await steamApi.isAvailable()
      return this.initialized
    } catch (error) {
      console.error('Steam API availability check failed:', error)
      return false
    }
  }

  async getPlayerId(): Promise<string> {
    const steamApi = getSteamApi()
    const steamId = steamApi ? await steamApi.getSteamId() : null

    return steamId || super.getPlayerId()
  }

  async getPlayerName(): Promise<string> {
    const steamApi = getSteamApi()
    const personaName = steamApi ? await steamApi.getPersonaName() : null

    return personaName || super.getPlayerName()
  }

  async getUserData(): Promise<PlatformUser> {
    return {
      id: await this.getPlayerId(),
      name: await this.getPlayerName(),
      avatar: '',
      mode: this.initialized ? 'steam' : 'steam-unavailable',
      isAuthorized: this.initialized,
    }
  }

  async authUser(): Promise<PlatformAuthResult> {
    return {
      user: await this.getUserData(),
      game: await this.getGameData(),
    }
  }

  async getGameData(): Promise<GameProgress> {
    return this.loadProgress()
  }

  async setGameData(data: GameProgress): Promise<void> {
    await this.saveProgress(data)
  }

  async saveProgress(progress: GameProgress): Promise<void> {
    const steamApi = getSteamApi()

    try {
      if (!steamApi || !(await steamApi.isAvailable())) {
        await super.saveProgress(progress)
        console.error('Steam Cloud save skipped: Steam API is not available')
        return
      }

      await steamApi.saveCloudFile(STEAM_SAVE_FILE, JSON.stringify(progress))
      await super.saveProgress(progress)
      console.log('Steam Cloud save success')
    } catch (error) {
      console.error('Steam Cloud save error:', error)
      await super.saveProgress(progress)
    }
  }

  async loadProgress(): Promise<GameProgress> {
    const steamApi = getSteamApi()

    try {
      if (!steamApi || !(await steamApi.isAvailable())) {
        console.error('Steam Cloud load skipped: Steam API is not available')
        return super.loadProgress()
      }

      const rawProgress = await steamApi.readCloudFile(STEAM_SAVE_FILE)

      if (!rawProgress) {
        return createDefaultGameProgress()
      }

      console.log('Steam Cloud load success')
      return JSON.parse(rawProgress)
    } catch (error) {
      console.error('Steam Cloud load error:', error)
      return createDefaultGameProgress()
    }
  }

  async showAd(): Promise<void> {}

  async isOverlayAvailable(): Promise<boolean> {
    const steamApi = getSteamApi()

    if (!steamApi) return false

    try {
      return steamApi.isOverlayAvailable()
    } catch (error) {
      console.error('Steam Overlay availability check failed:', error)
      return false
    }
  }

  async openOverlay(type = 'friends'): Promise<void> {
    const steamApi = getSteamApi()

    if (!steamApi || !(await this.isOverlayAvailable())) return

    try {
      await steamApi.openOverlay(type)
    } catch (error) {
      console.error('Steam Overlay open failed:', error)
    }
  }

  async unlockAchievement(id: string): Promise<void> {
    const steamApi = getSteamApi()

    try {
      if (!steamApi || !(await steamApi.isAvailable())) {
        await super.unlockAchievement(id)
        return
      }

      await steamApi.unlockAchievement(id)
      console.log('Steam achievement unlocked:', id)
    } catch (error) {
      console.error('Steam achievement unlock failed:', error)
      await super.unlockAchievement(id)
    }
  }

  async getAchievement(id: string): Promise<boolean> {
    const steamApi = getSteamApi()

    try {
      if (!steamApi || !(await steamApi.isAvailable())) {
        return super.getAchievement(id)
      }

      return steamApi.getAchievement(id)
    } catch (error) {
      console.error('Steam achievement read failed:', error)
      return super.getAchievement(id)
    }
  }

  async setStat(name: string, value: number): Promise<void> {
    const steamApi = getSteamApi()

    try {
      if (!steamApi || !(await steamApi.isAvailable())) {
        await super.setStat(name, value)
        return
      }

      await steamApi.setStat(name, value)
      await steamApi.storeStats()
      console.log('Steam stat updated:', name, value)
    } catch (error) {
      console.error('Steam stat update failed:', error)
      await super.setStat(name, value)
    }
  }

  async getStat(name: string): Promise<number> {
    const steamApi = getSteamApi()

    try {
      if (!steamApi || !(await steamApi.isAvailable())) {
        return super.getStat(name)
      }

      return steamApi.getStat(name)
    } catch (error) {
      console.error('Steam stat read failed:', error)
      return super.getStat(name)
    }
  }

  async incrementStat(name: string, amount = 1): Promise<void> {
    await this.setStat(name, (await this.getStat(name)) + amount)
  }

  async storeStats(): Promise<void> {
    const steamApi = getSteamApi()

    try {
      if (!steamApi || !(await steamApi.isAvailable())) return

      await steamApi.storeStats()
    } catch (error) {
      console.error('Steam stats store failed:', error)
    }
  }

  async getLeaderboard(
    leaderboardName: string
  ): Promise<LeaderboardDescription | null> {
    const steamApi = getSteamApi()

    try {
      if (!steamApi || !(await steamApi.isAvailable())) {
        return super.getLeaderboard(leaderboardName)
      }

      const leaderboard = await steamApi.getLeaderboard(leaderboardName)

      return leaderboard || super.getLeaderboard(leaderboardName)
    } catch (error) {
      console.error('Steam leaderboard read failed:', error)
      return super.getLeaderboard(leaderboardName)
    }
  }

  async setLeaderboardScore(
    leaderboardName: string,
    score: number,
    extraData?: string
  ): Promise<void> {
    const steamApi = getSteamApi()

    try {
      if (!steamApi || !(await steamApi.isAvailable())) {
        await super.setLeaderboardScore(leaderboardName, score, extraData)
        return
      }

      const isUpdated = await steamApi.setLeaderboardScore(leaderboardName, score, extraData)

      if (!isUpdated) {
        await super.setLeaderboardScore(leaderboardName, score, extraData)
        return
      }

      console.log('Steam leaderboard score updated:', leaderboardName, score)
    } catch (error) {
      console.error('Steam leaderboard score update failed:', error)
      await super.setLeaderboardScore(leaderboardName, score, extraData)
    }
  }

  async getLeaderboardEntries(
    leaderboardName: string,
    options: LeaderboardOptions
  ): Promise<LeaderboardEntries> {
    const steamApi = getSteamApi()

    try {
      if (!steamApi || !(await steamApi.isAvailable())) {
        return super.getLeaderboardEntries(leaderboardName, options)
      }

      const data = await steamApi.getLeaderboardEntries(leaderboardName, options)

      if (!data.leaderboard || !data.entries.length) {
        return super.getLeaderboardEntries(leaderboardName, options)
      }

      return data
    } catch (error) {
      console.error('Steam leaderboard entries read failed:', error)
      return super.getLeaderboardEntries(leaderboardName, options)
    }
  }
}

export const createPlatformApiAdapter = (): PlatformApi => {
  return new SteamPlatformApi()
}
