import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GameCanvas,
  GameCountdown,
  GameScore,
  GameScoreEffects,
  ModalResult,
  ModalExit,
} from '@/shared/components'
import { useLevel, useToggle, useProgress, useMusic } from '@/shared/hooks'
import { useSetLeaderboardMutation } from '@/shared'
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

export const GameStorePage = () => {
  const navigate = useNavigate()
  const [isOpenModalWin, setOpenModalWin] = useState(false)
  const [isOpenModalLose, setOpenModalLose] = useState(false)
  const [isOpenModalExit, setOpenModalExit] = useState(false)
  const [isPause, togglePause] = useToggle(true)
  const {
    completeLevel,
    selectedLevel,
    selectLevel,
    userLevel,
    userScore,
    levelUp,
    scoreUp,
  } = useProgress()
  const { user, game } = useUser();
  const [level, setLevel] = useLevel<GameLevelStoreType>(selectedLevel, 'store')
  const [restartKey, setRestartKey] = useState(0)
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(level.gameTimer)
  const [resultText, setResultText] = useState('')
  const [setLeader] = useSetLeaderboardMutation()

  useMusic({ src: '/music/success.mp3', conditional: isOpenModalWin })
  useMusic({ src: '/music/timeout.mp3', conditional: isOpenModalLose })

  const setGameDataWin = async () => {
    const scoreTotal = score + seconds
    await YandexSDK.setGameData({
      ...game,
      userScore: game.userScore + scoreTotal,
      userCoins: game.userCoins + level.coin
    })
  }

  const setGameDataLose = async () => {
    await YandexSDK.setGameData({
      ...game,
      userCoins: game.userCoins > level.coin ? game.userCoins - level.coin : 0
    })

  }

  const onContinue = async () => {
    const scoreTotal = score + seconds
    const nextLevel = level.id + 1

    completeLevel(nextLevel)
    setLevel(nextLevel)
    selectLevel(nextLevel)

    if (game.userLevel < nextLevel) {
      levelUp(nextLevel)
    }
    if (game.userLevel === level.id) {
      scoreUp(scoreTotal)
      handleSetLeader(userLevel, userScore + scoreTotal)
    }
    
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
      setResultText(
        `Поздравляем! Вы прошли уровень «${level.title}» и получили опыт: ${
          score + seconds
        } exp`
      )
      setOpenModalWin(true)
    }, 1000) // Задержка что бы показать все анимации
  }

  const handleGameOver = (): void => {
    setResultText(
      `Не унывай! Попробуй еще раз пройти уровень. У тебя получится )`
    )
    setOpenModalLose(true)
  }

  const handleScore = (newScore: number): void => {
    setScore(newScore)
  }

  const handleSeconds = (reSeconds: number): void => {
    setSeconds(reSeconds)
  }

  const handleSetLeader = async (level: number, score: number) => {
    try {
      const leader = {
        data: {
          avatar: user.avatar,
          nickname: user.name,
          firstname: user.name,
          level: level,
          scorePSS: score,
        },
        ratingFieldName: '',
        teamName: '',
      }
      await setLeader(leader)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Не удалось добавить лидера: ${error.message}`)
      }
    }
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
        <GameScoreEffects score={score} />
        <GameCanvas
          isPause={isPause}
          restartKey={restartKey}
          level={level}
          onScore={handleScore}
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
