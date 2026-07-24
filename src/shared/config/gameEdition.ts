export type GameEdition = 'full' | 'demo'

export type GameFeatures = {
  edition: GameEdition
  maxStoryMission: number
  maxArcadeLevel: number
  maxTavernLevel: number
  maxSkillTier: number
  arcadeEnabled: boolean
  pvpEnabled: boolean
  leaderboardEnabled: boolean
  shopEnabled: boolean
}

const fullFeatures: GameFeatures = {
  edition: 'full',
  maxStoryMission: Number.POSITIVE_INFINITY,
  maxArcadeLevel: Number.POSITIVE_INFINITY,
  maxTavernLevel: Number.POSITIVE_INFINITY,
  maxSkillTier: Number.POSITIVE_INFINITY,
  arcadeEnabled: true,
  pvpEnabled: true,
  leaderboardEnabled: true,
  shopEnabled: true,
}

const demoFeatures: GameFeatures = {
  edition: 'demo',
  maxStoryMission: 1,
  maxArcadeLevel: 5,
  maxTavernLevel: 3,
  maxSkillTier: 3,
  arcadeEnabled: false,
  pvpEnabled: false,
  leaderboardEnabled: true,
  shopEnabled: true,
}

export const gameFeatures = import.meta.env.VITE_PLATFORM_API === 'demo'
  ? demoFeatures
  : fullFeatures
