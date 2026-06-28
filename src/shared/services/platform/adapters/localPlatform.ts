import {
  readLocalGameProgress,
  readOrCreateLocalPlayer,
  writeLocalGameProgress,
} from '../platformStorage'
import {
  GameSettings,
  GameProgress,
  LeaderboardDescription,
  LeaderboardEntries,
  LeaderboardOptions,
  PlatformApi,
  PlatformAuthResult,
  PlatformUser,
} from '../types'
import { Language } from '@/shared/services/i18n'

const createLocalUser = (): PlatformUser => {
  const player = readOrCreateLocalPlayer()

  return {
    id: player.id,
    name: player.name || 'Игрок',
    avatar: '',
    mode: 'local',
    isAuthorized: true,
  }
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
    return createLocalUser()
  }

  async authUser(): Promise<PlatformAuthResult> {
    return {
      user: createLocalUser(),
      game: await this.getGameData(),
    }
  }

  async getGameData(): Promise<GameProgress> {
    return readLocalGameProgress()
  }

  async setGameData(data: GameProgress): Promise<void> {
    writeLocalGameProgress(data)
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
      const user = createLocalUser()

      await fetch(buildApiUrl('/api/leaderboard/score'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar: user.avatar,
          extraData,
          leaderboardName,
          playerId: user.id,
          playerName: user.name,
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
    const user = createLocalUser()
    const params = new URLSearchParams({
      leaderboardName,
      playerId: user.id,
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

  async getSettings(): Promise<GameSettings> {
    const gameData = await this.getGameData()

    return gameData.settings
  }

  async setSettings(settings: Partial<GameSettings>): Promise<void> {
    const gameData = await this.getGameData()

    await this.setGameData({
      ...gameData,
      settings: {
        ...gameData.settings,
        ...settings,
      },
    })
  }

  async getLanguage(): Promise<Language | null> {
    const gameData = await this.getGameData()

    return gameData.settings.language
  }

  async setLanguage(language: Language): Promise<void> {
    await this.setSettings({ language })
  }

  async isPlayerNameAvailable(playerName: string): Promise<boolean> {
    const user = createLocalUser()
    const params = new URLSearchParams({
      name: playerName,
      playerId: user.id,
    })

    try {
      const data = await getJson<{ available: boolean }>(
        buildApiUrl(`/api/leaderboard/player-name?${params.toString()}`)
      )

      return data.available
    } catch (error) {
      console.error('Ошибка проверки имени локального игрока:', error)
      return false
    }
  }
}
