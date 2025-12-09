import {
  computCardRow,
  computCardWidth,
  computCardHeight,
  computCanvasWidth,
  computCanvasHeight,
  createCardValues,
} from './utils'
import { GameLevelStateType, GameLevelStateSimpleType, GameLevelStoreType, GameLevelStoreSimpleType } from './types'
import { LEVELS_STATE_CONFIG, LEVELS_STORE_CONFIG } from '@/shared/constants'

export const MAP_CARD_COLORS = {
  'card-1.png': 'blue',
  'card-2.png': 'black',
  'card-3.png': 'yellow',
  'card-4.png': 'green',
  'card-5.png': 'red',
  'card-6.png': 'blue',
  'card-7.png': 'black',
  'card-8.png': 'yellow',
  'card-9.png': 'green',
  'card-10.png': 'red',
}

export const PATH_SPRITE = '/game'
export const PATH_SPRITE_CARD = '/game/card.png'
export const PATH_SPRITE_CARD_HOVER = '/game/card-hover.png'
export const PATH_SPRITE_CARD_LIGHT = '/game/card-light.png'

export const FRAME_TIMOUT = 500
export const CARD_MARGIN = 10
export const CARD_SCORE = 2 // Очки за отгаданную пару карт (или процент атаки)
export const ATTACK_FACTOR = 2 // Множитель урона от атаки
export const STUN_ANIMATION_DELAY = 4000 // Задержка анимации оглушения

export const LEVELS_STATE: GameLevelStateType[] = LEVELS_STATE_CONFIG.map(
  (level: GameLevelStateSimpleType) => {
    const cardRow = computCardRow(level.cardCount, level.cardCol) // количество строк
    const cardValues = createCardValues(level.cardCount) // массив карточек для запоминания
    const cardWidth = computCardWidth(level.cardCol, cardRow, CARD_MARGIN)
    const cardHeight = computCardHeight(cardWidth)
    const canvasWidth = computCanvasWidth(cardWidth, level.cardCol, CARD_MARGIN)
    const canvasHeight = computCanvasHeight(cardHeight, cardRow, CARD_MARGIN)
    return {
      ...level,
      cardRow,
      cardValues,
      cardWidth,
      cardHeight,
      canvasWidth,
      canvasHeight,
    }
  }
)

export const LEVELS_STORE: GameLevelStoreType[] = LEVELS_STORE_CONFIG.map(
  (level: GameLevelStoreSimpleType) => {
    const cardRow = computCardRow(level.cardCount, level.cardCol)
    const cardValues = createCardValues(level.cardCount)
    const cardWidth = computCardWidth(level.cardCol, cardRow, CARD_MARGIN)
    const cardHeight = computCardHeight(cardWidth)
    const canvasWidth = computCanvasWidth(cardWidth, level.cardCol, CARD_MARGIN)
    const canvasHeight = computCanvasHeight(cardHeight, cardRow, CARD_MARGIN)
    return {
      ...level,
      cardRow,
      cardValues,
      cardWidth,
      cardHeight,
      canvasWidth,
      canvasHeight,
    }
  }
)
