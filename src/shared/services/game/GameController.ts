import Mediator from '@/shared/controllers/mediator'
import { GameLevelStateType, GameLevelStoreType } from '@/shared/services/game/types'
import { GameModel } from './GameModel'
import { GameView } from './GameView'
import { FRAME_TIMOUT, CARD_MARGIN } from './constants'

const eventBus = new Mediator()
let level: GameLevelStateType | GameLevelStoreType | any = {}

eventBus.on('game:level', payload => {
  level = payload
})

export class GameController {
  model: GameModel
  view: GameView
  index: number | null
  flipProgress: number[]
  isAnimating: boolean

  constructor(model: GameModel, view: GameView) {
    this.model = model
    this.view = view
    this.index = 0
    this.flipProgress = new Array(model.cards.length).fill(0)
    this.isAnimating = false
  }

  handleCardClick(x: number, y: number): boolean {
    const clickStartedAt = performance.now()

    if (this.isAnimating) {
      return false
    }

    this.index = this.getCardIndex(x, y)

    if (
      this.index !== null &&
      !this.model.flippedCards.includes(this.index) &&
      !this.model.matchedCards.includes(this.index)
    ) {
      this.flipCard(this.index, clickStartedAt)
      this.model.flipCard(this.index)

      if (this.model.flippedCards.length === 2) {
        this.isAnimating = true
        const [first, second] = this.model.flippedCards
        if (this.model.cards[first] === this.model.cards[second]) {
          setTimeout(() => {
            this.model.checkWin()
            this.updateView()
            this.isAnimating = false
          }, FRAME_TIMOUT)
        } else {
          setTimeout(() => {
            this.flipBackCards(first, second)
            this.model.unflipCards()
            this.updateView()
            this.isAnimating = false
          }, FRAME_TIMOUT)
        }
      }

      if (import.meta.env.DEV) {
        console.info(`[perf] card click handled in ${Math.round(performance.now() - clickStartedAt)}ms`)
      }

      return true
    }

    return false
  }

  getCardIndex(x: number, y: number): number | null {
    const col = Math.floor(x / (level.cardWidth + CARD_MARGIN))
    const row = Math.floor(y / (level.cardHeight + CARD_MARGIN))
    const index = row * level.cardCol + col
    if (index >= 0 && index < this.model.cards.length) {
      return index
    }
    return null
  }

  flipCard(index: number, clickStartedAt?: number): void {
    const duration = FRAME_TIMOUT / 2
    const startTime = performance.now()
    let frames = 0
    let isFirstFrame = true

    const animate = (time: number) => {
      frames++

      if (isFirstFrame) {
        isFirstFrame = false

        if (import.meta.env.DEV && clickStartedAt) {
          console.info(`[perf] flip animation started in ${Math.round(time - clickStartedAt)}ms`)
        }
      }

      const progress = Math.min((time - startTime) / duration, 1)
      this.flipProgress[index] = progress
      this.updateCards([index])

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else if (import.meta.env.DEV) {
        this.logAnimationFps('flip', frames, performance.now() - startTime)
      }
    }
    requestAnimationFrame(animate)
  }

  flipBackCards(first: number, second: number): void {
    const duration = FRAME_TIMOUT / 2
    const startTime = performance.now()
    let frames = 0

    const animate = (time: number) => {
      frames++
      const progress = Math.min((time - startTime) / duration, 1)
      this.flipProgress[first] = 1 - progress
      this.flipProgress[second] = 1 - progress
      this.updateCards([first, second])

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else if (import.meta.env.DEV) {
        this.logAnimationFps('flip-back', frames, performance.now() - startTime)
      }
    }
    requestAnimationFrame(animate)
  }

  updateView(): void {
    this.view.drawCards(
      this.model.cards,
      this.model.flippedCards,
      this.model.matchedCards,
      this.flipProgress
    )
  }

  updateCards(indexes: number[]): void {
    this.view.drawCardsByIndex(
      indexes,
      this.model.cards,
      this.model.flippedCards,
      this.model.matchedCards,
      this.flipProgress
    )
  }

  logAnimationFps(label: string, frames: number, duration: number): void {
    const fps = duration > 0 ? Math.round((frames / duration) * 1000) : 0
    console.info(`[perf] ${label} animation ${fps}fps over ${Math.round(duration)}ms`)
  }

  handleRestart(): void {
    this.model.reset()
    this.flipProgress.fill(0)
    this.updateView()
  }

  getScore(): number {
    return this.model.score
  }
}
