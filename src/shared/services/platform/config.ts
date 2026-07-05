export const ACHIEVEMENTS = {
  FIRST_WIN: 'FIRST_WIN',
  FIRST_PVP_WIN: 'FIRST_PVP_WIN',
  COMPLETE_TUTORIAL: 'COMPLETE_TUTORIAL',
} as const

export type AchievementId = typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS]

export const STATS = {
  GAMES_PLAYED: 'GAMES_PLAYED',
  WINS: 'WINS',
  PVP_WINS: 'PVP_WINS',
  CARDS_MATCHED: 'CARDS_MATCHED',
} as const

export type StatName = typeof STATS[keyof typeof STATS]

export const STEAM_SAVE_FILE = 'orion7-save.json'
