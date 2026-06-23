import { createDefaultGameProgress } from '../defaults'
import { readLocalGameProgress, writeLocalGameProgress } from '../platformStorage'
import {
  GameProgress,
  LeaderboardDescription,
  LeaderboardEntries,
  LeaderboardOptions,
  PlatformApi,
  PlatformAuthResult,
  PlatformUser,
} from '../types'

const LOCAL_USER: PlatformUser = {
  id: 'local-player',
  name: 'Игрок',
  avatar: '',
  mode: 'local',
  isAuthorized: true,
}

export class LocalPlatformApi implements PlatformApi {
  kind = 'local' as const

  async init(): Promise<void> {
    readLocalGameProgress()
  }

  async getUserData(): Promise<PlatformUser> {
    return LOCAL_USER
  }

  async authUser(): Promise<PlatformAuthResult> {
    return {
      user: LOCAL_USER,
      game: await this.getGameData(),
    }
  }

  async getGameData(): Promise<GameProgress> {
    return readLocalGameProgress()
  }

  async setGameData(data: GameProgress): Promise<void> {
    writeLocalGameProgress({
      ...createDefaultGameProgress(),
      ...data,
    })
  }

  async showAd(): Promise<void> {}

  async getLeaderboard(leaderboardName: string): Promise<LeaderboardDescription | null> {
    return {
      name: leaderboardName,
      title: leaderboardName,
    }
  }

  async setLeaderboardScore(
    _leaderboardName: string,
    _score: number,
    _extraData?: string
  ): Promise<void> {}

  async getLeaderboardEntries(
    leaderboardName: string,
    _options: LeaderboardOptions
  ): Promise<LeaderboardEntries> {
    return {
      leaderboard: await this.getLeaderboard(leaderboardName),
      ranges: [],
      userRank: 0,
      entries: [],
    }
  }
}
