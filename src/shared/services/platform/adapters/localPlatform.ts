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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const buildApiUrl = (path: string): string => {
  return `${API_BASE_URL}${path}`
}

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
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

  async getLeaderboard(
    leaderboardName: string
  ): Promise<LeaderboardDescription | null> {
    try {
      return await getJson<LeaderboardDescription>(
        buildApiUrl(`/api/leaderboard/${encodeURIComponent(leaderboardName)}`)
      )
    } catch (error) {
      console.error('Ошибка получения описания лидерборда:', error)
      return null
    }
  }

  async setLeaderboardScore(
    leaderboardName: string,
    score: number,
    extraData?: string
  ): Promise<void> {
    try {
      await fetch(buildApiUrl('/api/leaderboard/score'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar: LOCAL_USER.avatar,
          extraData,
          leaderboardName,
          playerId: LOCAL_USER.id,
          playerName: LOCAL_USER.name,
          score,
        }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
      })
    } catch (error) {
      console.error('Ошибка записи в локальный лидерборд:', error)
    }
  }

  async getLeaderboardEntries(
    leaderboardName: string,
    options: LeaderboardOptions
  ): Promise<LeaderboardEntries> {
    const params = new URLSearchParams({
      leaderboardName,
      playerId: LOCAL_USER.id,
    })

    if (options.quantityTop) {
      params.set('quantityTop', String(options.quantityTop))
    }

    if (options.includeUser !== undefined) {
      params.set('includeUser', String(options.includeUser))
    }

    if (options.quantityAround) {
      params.set('quantityAround', String(options.quantityAround))
    }

    try {
      return await getJson<LeaderboardEntries>(
        buildApiUrl(`/api/leaderboard/top?${params.toString()}`)
      )
    } catch (error) {
      console.error('Ошибка получения списка локальных лидеров:', error)

      return {
        leaderboard: await this.getLeaderboard(leaderboardName),
        ranges: [],
        userRank: 0,
        entries: [],
      }
    }
  }
}
