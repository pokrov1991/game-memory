import { createDefaultGameProgress } from '../defaults'
import {
  GameProgress,
  LeaderboardDescription,
  LeaderboardEntries,
  LeaderboardOptions,
  PlatformApi,
  PlatformAuthResult,
  PlatformUser,
} from '../types'
import { IPlayer, IYandexSDK } from '@/types'

declare global {
  interface Window {
    YaGames: {
      init: () => Promise<IYandexSDK>
    }
  }
}

const YANDEX_SDK_SRC = 'https://yandex.ru/games/sdk/v2'

const loadYandexSdkScript = (): Promise<void> => {
  if (typeof window === 'undefined' || window.YaGames) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${YANDEX_SDK_SRC}"]`
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Yandex SDK script load error')), { once: true })
      return
    }

    const script = document.createElement('script')

    script.src = YANDEX_SDK_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Yandex SDK script load error'))

    document.head.appendChild(script)
  })
}

export class YandexPlatformApi implements PlatformApi {
  kind = 'yandex' as const
  private ysdk: IYandexSDK | null = null
  private player: IPlayer | null = null
  private initialized = false

  async init(): Promise<void> {
    await loadYandexSdkScript()

    if (!window.YaGames) {
      throw new Error('Яндекс SDK не загружен')
    }

    try {
      this.ysdk = await window.YaGames.init()
      this.initialized = true
      console.log('Яндекс SDK успешно инициализирован')
    } catch (error) {
      throw new Error('Ошибка инициализации Яндекс SDK: ' + error)
    }
  }

  async getUserData(): Promise<PlatformUser> {
    this.ensureInitialized()

    try {
      this.player = await this.ysdk.getPlayer()

      return {
        id: this.player.getUniqueID(),
        name: this.player.getName(),
        avatar: this.player.getPhoto('medium'),
        mode: this.player.getMode(),
        isAuthorized: this.player.isAuthorized(),
      }
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error)
      throw error
    }
  }

  async authUser(): Promise<PlatformAuthResult> {
    this.ensureInitialized()
    await this.ensurePlayer()

    try {
      if (this.player.getMode() === 'lite') {
        await this.ysdk.auth.openAuthDialog()

        const user = await this.getUserData()
        const game = await this.getGameData()

        return { user, game }
      }

      throw new Error('Игрок уже авторизован или SDK не инициализирован')
    } catch (error) {
      console.error('Ошибка авторизации пользователя:', error)
      throw error
    }
  }

  async getGameData(keys?: unknown): Promise<GameProgress> {
    this.ensureInitialized()
    await this.ensurePlayer()

    try {
      let gameData = await this.player.getData(keys)

      if (Object.keys(gameData).length) {
        return gameData
      }

      gameData = createDefaultGameProgress()
      await this.setGameData(gameData)

      return gameData
    } catch (error) {
      console.error('Ошибка получения данных игры:', error)
      throw error
    }
  }

  async setGameData(data: GameProgress): Promise<void> {
    this.ensureInitialized()
    await this.ensurePlayer()

    try {
      console.log('Сохранение данных игры:', data)
      await this.player.setData(data)
    } catch (error) {
      console.error('Ошибка сохранения данных игры:', error)
      throw error
    }
  }

  async showAd(): Promise<void> {
    this.ensureInitialized()

    try {
      await this.ysdk.adv.showFullscreenAd()
      console.log('Реклама успешно показана')
    } catch (error) {
      console.error('Ошибка показа рекламы:', error)
    }
  }

  async getLeaderboard(leaderboardName: string): Promise<LeaderboardDescription | null> {
    this.ensureInitialized()

    let leaderboard

    try {
      console.log('Лидерборд инициирован')
      leaderboard = await this.ysdk.leaderboards.getDescription(leaderboardName)
    } catch (error) {
      console.error('Ошибка инициализации лидерборда:', error)
      return null
    }

    if (!leaderboard) return null

    return {
      name: leaderboard.name,
      title: leaderboard.title?.ru || leaderboard.name,
    }
  }

  async setLeaderboardScore(
    leaderboardName: string,
    score: number,
    extraData?: string
  ): Promise<void> {
    this.ensureInitialized()

    try {
      console.log('Запись в лидерборд:', leaderboardName, score, extraData)
      await this.ysdk.leaderboards.setScore(leaderboardName, score, extraData)
    } catch (error) {
      console.error('Ошибка записи в лидерборд:', error)
    }
  }

  async getLeaderboardEntries(
    leaderboardName: string,
    options: LeaderboardOptions
  ): Promise<LeaderboardEntries> {
    this.ensureInitialized()

    let data

    try {
      data = await this.ysdk.leaderboards.getEntries(leaderboardName, options)
    } catch (error) {
      console.error('Ошибка получения списка лидеров:', error)
    }

    if (!data) {
      return {
        leaderboard: null,
        ranges: [],
        userRank: 0,
        entries: [],
      }
    }

    return {
      leaderboard: {
        name: data.leaderboard.name,
        title: data.leaderboard.title?.ru || data.leaderboard.name,
      },
      ranges: data.ranges,
      userRank: data.userRank,
      entries: data.entries.map(entry => ({
        extraData: entry.extraData,
        rank: entry.rank,
        score: entry.score,
        player: {
          id: entry.player.uniqueID,
          name: entry.player.publicName,
          avatar: entry.player.getAvatarSrc('medium'),
        },
      })),
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.ysdk) {
      throw new Error('Yandex SDK не инициализирован. Вызовите init() перед использованием.')
    }
  }

  private async ensurePlayer(): Promise<void> {
    if (!this.player) {
      await this.getUserData()
    }
  }
}
