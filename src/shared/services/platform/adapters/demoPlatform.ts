import { LocalPlatformApi } from './localPlatform'
import { createDefaultGameProgress } from '../defaults'
import { GameProgress } from '../types'

const DEMO_PROGRESS_KEY = 'orion7:demo:game-progress:v1'

const readDemoProgress = (): GameProgress => {
  if (typeof window === 'undefined') return createDefaultGameProgress()

  const savedProgress = window.localStorage.getItem(DEMO_PROGRESS_KEY)

  if (!savedProgress) return createDefaultGameProgress()

  try {
    return JSON.parse(savedProgress) as GameProgress
  } catch {
    return createDefaultGameProgress()
  }
}

export class DemoPlatformApi extends LocalPlatformApi {
  kind = 'demo' as const

  async init(): Promise<void> {
    readDemoProgress()
  }

  async getGameData(): Promise<GameProgress> {
    return readDemoProgress()
  }

  async setGameData(data: GameProgress): Promise<void> {
    window.localStorage.setItem(DEMO_PROGRESS_KEY, JSON.stringify(data))
  }

  async saveProgress(progress: GameProgress): Promise<void> {
    await this.setGameData(progress)
  }

  async loadProgress(): Promise<GameProgress> {
    return this.getGameData()
  }

  async hasCampaignAccess(): Promise<boolean> {
    return true
  }

  async purchaseCampaignAccess(): Promise<boolean> {
    return false
  }
}

export const createPlatformApiAdapter = () => {
  return new DemoPlatformApi()
}
