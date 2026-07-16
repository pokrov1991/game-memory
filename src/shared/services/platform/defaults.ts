import { GameProgress, GameSettings } from './types'
import { DEFAULT_LANGUAGE } from '@/shared/services/i18n'

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  language: DEFAULT_LANGUAGE,
  musicVolume: 100,
  effectsVolume: 100,
  gameFieldSize: 75,
}

export const DEFAULT_GAME_PROGRESS: GameProgress = {
  settings: DEFAULT_GAME_SETTINGS,
  completedLevels: [102],
  selectedLevelArcade: 0,
  selectedLevel: 0,
  userLevel: 1,
  userLevelParams: {
    hp: 0,
    guard: 0,
    attack: 0,
  },
  userScoreArcade: 0,
  userScore: 0,
  userCoins: 5,
  userPotions: 1,
  userParams: {
    hp: 100,
    guard: 1,
    attack: 1,
  },
  userInventory: [
    {
      id: 1,
      type: 'helmet',
      name: 'Шлем астронавта',
      desc: 'Обеспечивает базовую защиту.',
      price: 0,
      organs: [],
      hp: 0,
      isPaid: true,
      isDressed: true,
    },
    {
      id: 2,
      type: 'plastron',
      name: 'Скафандр астронавта',
      desc: 'Обеспечивает базовую защиту.',
      price: 0,
      organs: [],
      hp: 0,
      isPaid: true,
      isDressed: true,
    },
  ],
  userOrgans: {
    0: { id: 0, name: 'Болт от ПС-91', count: 0 },
    1: { id: 1, name: 'Камень щитомордника', count: 0 },
    2: { id: 2, name: 'Кость литора', count: 0 },
    3: { id: 3, name: 'Хромовая пластина', count: 0 },
    4: { id: 4, name: 'Ткань меркиля', count: 0 },
    5: { id: 5, name: 'Перья титуса', count: 0 },
    6: { id: 6, name: 'Тентакля севы', count: 0 },
  },
}

export const createDefaultGameProgress = (): GameProgress => ({
  ...DEFAULT_GAME_PROGRESS,
  settings: { ...DEFAULT_GAME_PROGRESS.settings },
  completedLevels: [...DEFAULT_GAME_PROGRESS.completedLevels],
  userLevelParams: { ...DEFAULT_GAME_PROGRESS.userLevelParams },
  userParams: { ...DEFAULT_GAME_PROGRESS.userParams },
  userInventory: DEFAULT_GAME_PROGRESS.userInventory.map(item => ({
    ...item,
    organs: item.organs.map(organ => ({ ...organ })),
  })),
  userOrgans: Object.fromEntries(
    Object.entries(DEFAULT_GAME_PROGRESS.userOrgans).map(([key, value]) => [
      key,
      { ...value },
    ])
  ),
})

export const isInitialGameProgress = (progress: GameProgress): boolean => {
  return JSON.stringify(progress) === JSON.stringify(createDefaultGameProgress())
}

export const hasStartedCampaign = (progress: GameProgress): boolean => {
  return !isInitialGameProgress(progress)
}
