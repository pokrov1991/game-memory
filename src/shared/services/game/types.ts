export type GameLevelStateType = {
  id: number
  x: number
  y: number
  title: string
  description: string
  type: string
  cardCount: number
  cardCol: number
  cardRow: number
  initialSeconds: number[],
  initialAttacks: number[],
  initialColors: string[],
  enemyStateDurations: Record<EnemyState, number>
  isPassed: boolean,
  isCurrent: boolean,
  cardValues: string[]
  cardWidth: number
  cardHeight: number
  canvasWidth: number
  canvasHeight: number
}

export type GameLevelStateSimpleType = Omit<
  GameLevelStateType,
  | 'cardRow'
  | 'cardValues'
  | 'cardWidth'
  | 'cardHeight'
  | 'canvasWidth'
  | 'canvasHeight'
>

export type GameLevelStoreType = {
  id: number
  title: string
  description: string
  type: string
  gameTimer: number
  cardCount: number
  cardCol: number
  cardRow: number
  coins: number
  cardValues: string[]
  cardWidth: number
  cardHeight: number
  canvasWidth: number
  canvasHeight: number
}

export type GameLevelStoreSimpleType = Omit<
  GameLevelStoreType,
  | 'cardRow'
  | 'cardValues'
  | 'cardWidth'
  | 'cardHeight'
  | 'canvasWidth'
  | 'canvasHeight'
>

export type CardParams = {
  x: number
  y: number
  width: number
  height: number
}

export enum EnemyState {
  DEFAULT = 'DEFAULT',
  
  START = 'START',
  RUN = 'RUN',
  ATTACK = 'ATTACK',
  STUN = 'STUN',
  
  HIT = 'HIT',
  DEAD = 'DEAD',
}
