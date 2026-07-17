import { createDefaultGameProgress } from '../defaults'
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
import { IPlayer, IYandexSDK } from '@/types'
import { Language } from '@/shared/services/i18n'

declare global {
  interface Window {
    YaGames: {
      init: () => Promise<IYandexSDK>
    }
  }
}

const YANDEX_SDK_SRC = 'https://yandex.ru/games/sdk/v2'
const CAMPAIGN_PRODUCT_ID = 'unlock_campaign'

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

  async getPlayerId(): Promise<string> {
    return (await this.getUserData()).id
  }

  async getPlayerName(): Promise<string> {
    return (await this.getUserData()).name || 'Player'
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

  async saveProgress(progress: GameProgress): Promise<void> {
    await this.setGameData(progress)
  }

  async loadProgress(): Promise<GameProgress> {
    return this.getGameData()
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

  async hasCampaignAccess(): Promise<boolean> {
    this.ensureInitialized()

    try {
      const purchases = await this.ysdk.payments.getPurchases()

      return purchases.some(purchase => purchase.productID === CAMPAIGN_PRODUCT_ID)
    } catch (error) {
      console.error('Ошибка проверки доступа к кампании:', error)
      return false
    }
  }

  async purchaseCampaignAccess(): Promise<boolean> {
    this.ensureInitialized()

    if (await this.hasCampaignAccess()) {
      return true
    }

    try {
      const purchase = await this.ysdk.payments.purchase({ id: CAMPAIGN_PRODUCT_ID })

      return purchase.productID === CAMPAIGN_PRODUCT_ID
    } catch (error) {
      console.error('Покупка доступа к кампании не завершена:', error)
      return false
    }
  }

  async isSteamInitialized(): Promise<boolean> {
    return false
  }

  async isOverlayAvailable(): Promise<boolean> {
    return false
  }

  async openOverlay(): Promise<void> {}

  async unlockAchievement(): Promise<void> {}

  async getAchievement(): Promise<boolean> {
    return false
  }

  async setStat(): Promise<void> {}

  async getStat(): Promise<number> {
    return 0
  }

  async incrementStat(): Promise<void> {}

  async storeStats(): Promise<void> {}

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
    const gameData = await this.getGameData()

    await this.setGameData({
      ...gameData,
      settings: {
        ...gameData.settings,
        language,
      },
    })
  }

  async isPlayerNameAvailable(): Promise<boolean> {
    return true
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

export const createPlatformApiAdapter = (): PlatformApi => {
  return new YandexPlatformApi()
}
