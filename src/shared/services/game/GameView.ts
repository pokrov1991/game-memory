import Mediator from '@/shared/controllers/mediator'
import { GameLevelStateType, GameLevelStoreType, CardParams } from '@/shared/services/game/types'
import { CARD_MARGIN, PATH_SPRITE, PATH_SPRITE_CARD } from './constants'

const eventBus = new Mediator()
let level: GameLevelStateType | GameLevelStoreType | any = {}

eventBus.on('game:level', payload => {
  level = payload
})

export class GameView {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  images: Map<string, HTMLImageElement>
  imageDefault: HTMLImageElement
  cardsParams: CardParams[]
  dpr: number

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')!
    this.images = new Map()
    this.imageDefault = new Image()
    this.cardsParams = []
    this.dpr = 1
    this.setupCanvas()
  }

  setupCanvas(): void {
    this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3))
    this.canvas.style.width = `${level.canvasWidth}px`
    this.canvas.style.height = `${level.canvasHeight}px`
    this.canvas.width = Math.round(level.canvasWidth * this.dpr)
    this.canvas.height = Math.round(level.canvasHeight * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
  }

  async loadImages(cards: string[]): Promise<void> {
    const startedAt = performance.now()
    const uniqueCards = [...new Set(cards)]
    // Дефолтная карта
    this.imageDefault = await this.loadImage(PATH_SPRITE_CARD)

    // Остальные карты
    await Promise.all(
      uniqueCards.map(async src => {
        const image = await this.loadImage(`${PATH_SPRITE}/${src}`)
        this.images.set(src, image)
      })
    )

    if (import.meta.env.DEV) {
      console.info(
        `[perf] decoded ${uniqueCards.length + 1} card images in ${Math.round(performance.now() - startedAt)}ms`
      )
    }
  }

  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = async () => {
        try {
          await img.decode?.()
        } catch {}

        resolve(img)
      }

      img.onerror = () => reject(new Error(`Не удалось загрузить изображение: ${src}`))
      img.src = src
    })
  }

  drawCard(
    x: number,
    y: number,
    card: string,
    flipped: boolean,
    flipProgress: number
  ): void {
    this.ctx.clearRect(x, y, level.cardWidth, level.cardHeight)
    this.ctx.save()
    this.ctx.translate(x + level.cardWidth / 2, y + level.cardHeight / 2)
    this.ctx.scale(Math.cos(flipProgress * Math.PI), 1)
    this.ctx.translate(-level.cardWidth / 2, -level.cardHeight / 2)

    if (flipProgress > 0.5) {
      const img = this.images.get(card)
      if (img) {
        this.ctx.drawImage(img, 0, 0, level.cardWidth, level.cardHeight)
      }
    } else {
      this.ctx.drawImage(
        this.imageDefault,
        0,
        0,
        level.cardWidth,
        level.cardHeight
      )
    }

    this.ctx.restore()
  }

  drawCardByIndex(
    index: number,
    cards: string[],
    flippedCards: number[],
    matchedCards: number[],
    flipProgress: number[]
  ): void {
    const card = cards[index]
    const x = (index % level.cardCol) * (level.cardWidth + CARD_MARGIN)
    const y = Math.floor(index / level.cardCol) * (level.cardHeight + CARD_MARGIN)
    const flipped = flippedCards.includes(index) || matchedCards.includes(index)
    const progress = flipProgress[index] || 0

    this.drawCard(x, y, card, flipped, progress)
  }

  drawCards(
    cards: string[],
    flippedCards: number[],
    matchedCards: number[],
    flipProgress: number[]
  ): void {
    this.ctx.clearRect(0, 0, level.canvasWidth, level.canvasHeight)
    this.cardsParams = []

    cards.forEach((card, index) => {
      const x = (index % level.cardCol) * (level.cardWidth + CARD_MARGIN)
      const y = Math.floor(index / level.cardCol) * (level.cardHeight + CARD_MARGIN)
      const flipped = flippedCards.includes(index) || matchedCards.includes(index)
      const progress = flipProgress[index] || 0
      this.drawCard(x, y, card, flipped, progress)
      this.cardsParams.push({ x, y, width: level.cardWidth, height: level.cardHeight })
    })
  }

  drawCardsByIndex(
    indexes: number[],
    cards: string[],
    flippedCards: number[],
    matchedCards: number[],
    flipProgress: number[]
  ): void {
    indexes.forEach(index => {
      this.drawCardByIndex(index, cards, flippedCards, matchedCards, flipProgress)
    })
  }
}
