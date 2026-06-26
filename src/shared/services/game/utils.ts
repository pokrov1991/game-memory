import { SCREEN_MOBILE_WIDTH } from '@/shared/constants/device'

export const createCardValues = (count: number): string[] => {
  if (count % 2 !== 0) {
    throw new Error('Число карт CARD_COUNT должно быть четным')
  }

  const cardImages: string[] = Array.from(
    { length: 10 },
    (_, i) => `card-${i + 1}.png`
  ).flatMap(image => [image, image])
  return cardImages.slice(0, count)
}

export const computCardRow = (count: number, col: number): number => {
  return Math.round(count / col)
}

export const computCardWidth = (col: number, row: number, margin: number) => {
  const isMobile = window.innerWidth < SCREEN_MOBILE_WIDTH
  const canvasMarginLeft = isMobile ? 20 : 300
  const canvasMarginTop = 100
  const windowWidth = window.innerWidth - canvasMarginLeft

  // максимум 80% от высоты экрана
  const maxCanvasHeight = window.innerHeight * 0.8

  // если нужен ещё отступ сверху - учитываем его
  const windowHeight = Math.min(
    window.innerHeight - canvasMarginTop,
    maxCanvasHeight
  )

  let cardWidth = windowWidth / col - margin
  let cardHeight = cardWidth * 1.5

  const canvasHeight = cardHeight * row + margin * (row - 1)

  if (canvasHeight > windowHeight) {
    cardHeight = (windowHeight - margin * (row - 1)) / row
    cardWidth = cardHeight / 1.5
  }

  return cardWidth
}

export const computCardHeight = (width: number) => {
  return width * 1.5
}

export const computCanvasWidth = (
  cardWidth: number,
  col: number,
  margin: number
) => {
  return cardWidth * col + margin * (col - 1)
}

export const computCanvasHeight = (
  cardHeight: number,
  row: number,
  margin: number
) => {
  return cardHeight * row + margin * (row - 1)
}
