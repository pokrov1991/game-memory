import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GameCanvas,
  GameCountdown,
  GameScore,
  ModalResult,
  ModalExit,
} from '@/shared/components'
import { useLevel, useToggle, useProgress, useMusic } from '@/shared/hooks'
import { useUser } from '@/shared/contexts/UserContext'
import { TypeModal } from '@/shared/components/modal-comps/types'
import { GameLevelStoreType } from '@/shared/services/game/types'
import YandexSDK from '@/shared/services/sdk/yandexSdk'
import styles from './styles.module.css'


// Вычисляем размер UI эдементов относительно высоты экрана
let scalePercent = window.innerHeight < 1040 ? window.innerHeight / 1040 : 1

const scaleStyle = {
  transform: `scale(${scalePercent})`
}

// Задержка что бы показать все анимации
const delayGameEffects = 1000

export const GameStorePage = () => {
  const navigate = useNavigate()
  const [isOpenModalWin, setOpenModalWin] = useState(false)
  const [isOpenModalLose, setOpenModalLose] = useState(false)
  const [isOpenModalExit, setOpenModalExit] = useState(false)
  const [isPause, togglePause] = useToggle(true)
  const {
    selectedLevel,
    userCoins,
    coinsUp,
  } = useProgress()
  const { game } = useUser();
  const [level, setLevel] = useLevel<GameLevelStoreType>(selectedLevel, 'store')
  const [restartKey, setRestartKey] = useState(0)
  const [score, setScore] = useState(game.userScore)
  const [coins, setCoins] = useState(game.userCoins)
  const [seconds, setSeconds] = useState(level.gameTimer)
  const [resultText, setResultText] = useState('')

  const cCoins = userCoins > 0 ? userCoins : coins

  useMusic({ src: '/music/success.mp3', conditional: isOpenModalWin })
  useMusic({ src: '/music/timeout.mp3', conditional: isOpenModalLose })

  const setGameDataWin = async () => {
    const currentCoins = cCoins + level.coins
    coinsUp(currentCoins)
    await YandexSDK.setGameData({
      ...game,
      userCoins: currentCoins
    })
  }

  const setGameDataLose = async () => {
    const currentCoins = cCoins > level.coins ? cCoins - level.coins : 0
    coinsUp(currentCoins)
    await YandexSDK.setGameData({
      ...game,
      userCoins: currentCoins
    })
  }

  const onContinue = async () => {
    setGameDataWin()
    setOpenModalWin(false)
    navigate('/tavern')
  }

  const onGameOver = async () => {
    setGameDataLose()
    setOpenModalLose(false)
    navigate('/tavern')
  }

  const onExit = (): void => {
    setGameDataLose()
    setOpenModalExit(false)
    navigate('/tavern')
  }

  const handleMenu = (): void => {
    togglePause(true)
    setOpenModalExit(true)
  }

  const handlePause = (): void => {
    togglePause()
  }

  const handleGameWin = (): void => {
    handlePause()
    setTimeout(() => {
      setResultText(`Поздравляем! Обыграли «${level.title}» и получили: ${level.coins} монет.`)
      setOpenModalWin(true)
    }, delayGameEffects)
  }

  const handleGameOver = (): void => {
    setResultText(`Вы проиграли! Вас обыграл «${level.title}» и вы потеряли: ${level.coins} монет.`)
    setOpenModalLose(true)
  }

  const handleSeconds = (reSeconds: number): void => {
    setSeconds(reSeconds)
  }

  return (
    <main className={styles['game-page']}>
      <div className={styles['game-page__bar']} style={scaleStyle}>
        <div className={styles['game-page__control']}>
          <button
            onClick={handleMenu}
            className={styles['game-page__menu']}></button>
          <button onClick={handlePause} className={styles['game-page__pause']}>
            {isPause ? '▷' : '||'}
          </button>
          <GameCountdown
            isPause={isPause}
            restartKey={restartKey}
            initialSeconds={level.gameTimer}
            onComplete={handleGameOver}
            onSeconds={handleSeconds}
          />
        </div>
        <div className={styles['game-page__info']}>
          <GameScore score={score} level={level} />
        </div>
      </div>
      <div className={styles['game-page__canvas']}>
        <GameCanvas
          isPause={isPause}
          restartKey={restartKey}
          level={level}
          onScore={() => {}}
          onColor={() => {}}
          onPlay={handlePause}
          onVictory={handleGameWin}
        />
      </div>
      <ModalResult
        onContinue={onContinue}
        lvlName={resultText}
        isOpened={isOpenModalWin}
        type={TypeModal.Win}
      />
      <ModalResult
        onContinue={onGameOver}
        lvlName={resultText}
        isOpened={isOpenModalLose}
        type={TypeModal.Lose}
      />
      <ModalExit
        onContinue={onExit}
        onExit={() => setOpenModalExit(false)}
        lvlName=""
        lvlNumber={level.id}
        isOpened={isOpenModalExit}
      />
    </main>
  )
}
