import React, { useEffect, useState, useRef } from 'react'
import { GameModel } from '@/shared/services/game/GameModel'
import { GameView } from '@/shared/services/game/GameView'
import { GameController } from '@/shared/services/game/GameController'
import { GameLevelStateType, GameLevelStoreType, CardParams} from '@/shared/services/game/types'
import { GameEffectsCards } from './game-effects-cards'
import { MAP_CARD_COLORS } from '@/shared/services/game/constants'
import styles from './styles.module.css'

type GameCanvasProps = {
  isPause: boolean
  restartKey: number
  level: GameLevelStateType | GameLevelStoreType
  onScore: (score: number) => void
  onColor: (color: string, countFlipped: number) => void
  onPlay: () => void
  onVictory: () => void
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPause,
  restartKey,
  level,
  onScore,
  onColor,
  onPlay,
  onVictory,
}) => {
  const [isWin, setIsWin] = useState(false)
  const [score, setScore] = useState(0)
  const [cardColor, setCardColor] = useState('')
  const [cardCountFlipped, setCardCountFlipped] = useState(0)
  const [isImagesLoaded, setImagesLoaded] = useState(false)
  const [effectsCardsParams, setEffectsCardsParams] = useState<CardParams[]>([])
  const [effectsCardsMatched, setEffectsCardsMatched] = useState<number[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameModelRef = useRef<GameModel | null>(null)
  const gameViewRef = useRef<GameView | null>(null)
  const gameControllerRef = useRef<GameController | null>(null)

  useEffect(() => {
    handleRestart()
  }, [restartKey])

  useEffect(() => {
    if (isWin) {
      onVictory()
    }
  }, [isWin])

  useEffect(() => {
    onScore(score)
    onColor(cardColor, cardCountFlipped)
  }, [score])

  useEffect(() => {
    onColor(cardColor, cardCountFlipped)
  }, [cardColor])

  useEffect(() => {
    if (canvasRef.current) {
      const model = new GameModel(
        level.cardValues,
        () => {
          gameControllerRef.current?.updateView()
          setScore(gameControllerRef.current?.getScore() || 0)
        },
        handleWin
      )
      gameModelRef.current = model

      const view = new GameView(canvasRef.current)
      view.loadImages(level.cardValues, () => {
        setImagesLoaded(true)
        gameControllerRef.current?.updateView()
      })
      gameViewRef.current = view

      const controller = new GameController(model, view)
      gameControllerRef.current = controller

      // Задаем параметры по картам (координаты, рамеры) для слоя с эфектами
      setTimeout(() => {
        if (gameViewRef.current?.cardsParams) {
          setEffectsCardsParams(gameViewRef.current.cardsParams)
        }
      }, 500)
    }
  }, [level])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPause) {
      onPlay()
    }
    if (gameControllerRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      gameControllerRef.current.handleCardClick(x, y)
    }

    // Определяем цвет карты
    const cardKey = gameControllerRef.current.model.cards[gameControllerRef.current.index] as keyof typeof MAP_CARD_COLORS
    const cardColor = MAP_CARD_COLORS[cardKey]
    setCardColor(cardColor)
    // Количество перевернутых карт (0, 1, 2)
    setCardCountFlipped(gameControllerRef.current.model.flippedCards.length)

    // Задаем отгаданные карты для слоя с эфектами
    setTimeout(() => {
      if (gameModelRef.current?.matchedCards) {
        setEffectsCardsMatched([...gameModelRef.current?.matchedCards])
      }
    }, 500)
  }

  const handleRestart = () => {
    setIsWin(false)
    setScore(0)
    setEffectsCardsMatched([])
    gameControllerRef.current?.handleRestart()
  }

  const handleWin = () => {
    setTimeout(() => setIsWin(true), 0)
  }

  return (
    <div className={styles['game-canvas']}>
      <GameEffectsCards 
        levelId={level.id} 
        cardsParams={effectsCardsParams} 
        cardsMatched={effectsCardsMatched}
      />
      <canvas
        ref={canvasRef}
        width={level.canvasWidth}
        height={level.canvasHeight}
        onClick={handleCanvasClick}
        style={{ display: isImagesLoaded ? 'block' : 'none' }}
      />
      {!isImagesLoaded && (
        <div className={styles['game-canvas__loading']}>
          <span>Loading...</span>
        </div>
      )}
    </div>
  )
}
