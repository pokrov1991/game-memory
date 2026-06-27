import React, { useEffect, useState, useRef, useCallback } from 'react'
import { GameModel } from '@/shared/services/game/GameModel'
import { GameView } from '@/shared/services/game/GameView'
import { GameController } from '@/shared/services/game/GameController'
import { GameLevelStateType, GameLevelStoreType, CardParams} from '@/shared/services/game/types'
import { GameEffectsCards } from './game-effects-cards'
import { GameTrainingCards } from './game-training-cards'
import { MAP_CARD_COLORS } from '@/shared/services/game/constants'
import Mediator from '@/shared/controllers/mediator'
import styles from './styles.module.css'

type GameCanvasProps = {
  isPause: boolean
  restartKey: number
  level: GameLevelStateType | GameLevelStoreType
  onScore: (score: number, colorParry: string) => void
  onColor: (color: string, countFlipped: number) => void
  onPlay: () => void
  onVictory: () => void
  onClick?: () => void
}

const eventBus = new Mediator()

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPause,
  restartKey,
  level,
  onScore,
  onColor,
  onPlay,
  onVictory,
  onClick
}) => {
  const canvasDpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3))
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
    onColor(cardColor, cardCountFlipped)
    onScore(score, cardColor)
  }, [score])

  useEffect(() => {
    if (canvasRef.current) {
      let cancelled = false
      eventBus.emit('game:level', level)
      setImagesLoaded(false)
      setEffectsCardsParams([])
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
      gameViewRef.current = view

      const controller = new GameController(model, view)
      gameControllerRef.current = controller

    // Задаем параметры по картам (координаты, рамеры) для слоя с эфектами
      view.loadImages(level.cardValues)
        .then(() => {
          if (cancelled) {
            return
          }

          setImagesLoaded(true)
          controller.updateView()
          setEffectsCardsParams([...view.cardsParams])
        })
        .catch(error => {
          if (import.meta.env.DEV) {
            console.error(error)
          }
        })

      return () => {
        cancelled = true
        if (gameViewRef.current === view) {
          gameViewRef.current = null
        }
        if (gameControllerRef.current === controller) {
          gameControllerRef.current = null
        }
      }
    }
  }, [level.id])

  useEffect(() => {
    const view = gameViewRef.current
    const controller = gameControllerRef.current

    eventBus.emit('game:level', level)

    if (!view || !controller || !isImagesLoaded) {
      return
    }

    view.setupCanvas()
    controller.updateView()
    setEffectsCardsParams([...view.cardsParams])
  }, [
    isImagesLoaded,
    level.cardHeight,
    level.cardWidth,
    level.canvasHeight,
    level.canvasWidth,
  ])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const startedAt = performance.now()

    if (isPause) {
      onPlay()
    }

    if (gameControllerRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const isCardClicked = gameControllerRef.current.handleCardClick(x, y)

      if (!isCardClicked || gameControllerRef.current.index === null) {
        return
      }

      onClick?.()

      // Определяем цвет карты
      const cardKey = gameControllerRef.current.model.cards[gameControllerRef.current.index] as keyof typeof MAP_CARD_COLORS
      const nextCardColor = MAP_CARD_COLORS[cardKey]
      const nextCardCountFlipped = gameControllerRef.current.model.flippedCards.length

      setCardColor(nextCardColor)
      setCardCountFlipped(nextCardCountFlipped)
      onColor(nextCardColor, nextCardCountFlipped)

      if (import.meta.env.DEV) {
        console.info(`[perf] canvas click completed in ${Math.round(performance.now() - startedAt)}ms`)
      }

      // Задаем отгаданные карты для слоя с эфектами
      window.setTimeout(() => {
        if (gameModelRef.current?.matchedCards) {
          setEffectsCardsMatched([...gameModelRef.current.matchedCards])
        }
      }, 500)
    }
  }, [isPause, onClick, onColor, onPlay])

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
      {level.id === 0 && <GameTrainingCards
        levelId={level.id}
        cardsParams={effectsCardsParams}
        cardsMatched={effectsCardsMatched}
        cardsValues={gameControllerRef.current?.model.cards || []}
        onPause={onPlay}
      />}
      <GameEffectsCards 
        levelId={level.id} 
        cardsParams={effectsCardsParams} 
        cardsMatched={effectsCardsMatched}
      />
      <canvas
        ref={canvasRef}
        width={Math.round(level.canvasWidth * canvasDpr)}
        height={Math.round(level.canvasHeight * canvasDpr)}
        onClick={handleCanvasClick}
        style={{
          display: isImagesLoaded ? 'block' : 'none',
          width: `${level.canvasWidth}px`,
          height: `${level.canvasHeight}px`
        }}
      />
      {!isImagesLoaded && (
        <div className={styles['game-canvas__loading']}>
          <span>Loading...</span>
        </div>
      )}
    </div>
  )
}
