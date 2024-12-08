// import type { GameModel } from '@/shared/services/game/GameModel'
// import { PATH_SPRITE_CARD_LIGHT } from './constants'

// interface Card {
//   x: number
//   y: number
//   width: number
//   height: number
// }

// class EffectsLayer {
//   private canvas: HTMLCanvasElement
//   private context: CanvasRenderingContext2D
//   private model: GameModel
//   private animationFrames: number = 0
//   private lightningSprite: HTMLImageElement

//   constructor(canvas: HTMLCanvasElement, model: GameModel) {
//     this.canvas = canvas
//     this.context = canvas.getContext('2d')!
//     this.model = model
//     this.lightningSprite = new Image()
//     this.lightningSprite.src = PATH_SPRITE_CARD_LIGHT
//   }

//   update() {
//     this.clear()

//     // Рисуем эффекты для карт
//     this.drawHoverEffect()
//     this.drawMatchedCardsEffects()

//     this.animationFrames++
//   }

//   private clear() {
//     this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
//   }

//   private drawHoverEffect() {
//     const hoveredCard = this.model.getHoveredCard()
//     if (hoveredCard && !hoveredCard.isFlipped) {
//       this.context.save()
//       this.context.globalAlpha = 0.4
//       this.context.fillStyle = 'rgba(0, 255, 0, 0.5)'
//       this.context.fillRect(hoveredCard.x, hoveredCard.y, hoveredCard.width, hoveredCard.height)
//       this.context.restore()
//     }
//   }

//   private drawMatchedCardsEffects() {
//     const matchedCards = this.model.getMatchedCards()

//     matchedCards.forEach((card) => {
//       const spriteIndex = Math.floor(this.animationFrames / 5) % 10 // 10 кадров в спрайте
//       const spriteSize = 64 // Размер одного кадра
//       const centerX = card.x + card.width / 2
//       const centerY = card.y + card.height / 2

//       this.context.drawImage(
//         this.lightningSprite,
//         spriteIndex * spriteSize,
//         0,
//         spriteSize,
//         spriteSize,
//         centerX - spriteSize / 2,
//         centerY - spriteSize / 2,
//         spriteSize,
//         spriteSize
//       )
//     })
//   }
// }
