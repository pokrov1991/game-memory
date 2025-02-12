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

export const GamePage = () => {
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
  const { user, game } = useUser()
  const [restartKey, setRestartKey] = useState(0)
  const [gameLevel, setGameLevel] = useLevel<GameLevelStoreType>(selectedLevel, 'store')
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(gameLevel.gameTimer)
  const [resultText, setResultText] = useState('')
  const [setLeader] = useSetLeaderboardMutation()

  useMusic({ src: '/music/success.mp3', conditional: isOpenModalWin })
  useMusic({ src: '/music/timeout.mp3', conditional: isOpenModalLose })

  const onRestart = (): void => {
    setRestartKey(prevKey => prevKey + 1)
    setScore(0)
    togglePause(true)
  }

  const onContinue = async () => {
    const scoreTotal = score + seconds
    const nextLevel = gameLevel.id + 1
    const isFinal = gameLevel.id >= 11

    completeLevel(nextLevel)
    setGameLevel(nextLevel)
    selectLevel(nextLevel)

    if (!isFinal && game.userLevel < nextLevel) {
      levelUp(nextLevel)
    }
    if (game.userLevel === gameLevel.id) {
      scoreUp(scoreTotal)
      // handleSetLeader(userLevel, userScore + scoreTotal)
    }
    
    await YandexSDK.setGameData({
      completedLevels: Array.from(new Set([ ...game.completedLevels, nextLevel ])),
      selectedLevel: nextLevel,
      userLevel: !isFinal && game.userLevel < nextLevel ? nextLevel : game.userLevel,
      userScore: game.userLevel === gameLevel.id ? game.userScore + scoreTotal : game.userScore,
    })

    if (!isFinal) {
      onRestart()
    } else {
      navigate('/levels')
    }

    setOpenModalWin(false)
  }

  const onGameOver = (): void => {
    onRestart()
    setOpenModalLose(false)
  }

  const onExit = (): void => {
    navigate('/levels')
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
        `Поздравляем! Вы прошли уровень «${gameLevel.title}» и получили опыт: ${
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
          <button onClick={onRestart} className={styles['game-page__restart']}>
            Заново
          </button>
          <GameCountdown
            isPause={isPause}
            restartKey={restartKey}
            initialSeconds={gameLevel.gameTimer}
            onComplete={handleGameOver}
            onSeconds={handleSeconds}
          />
        </div>
        <div className={styles['game-page__info']}>
          <GameScore score={score} />
        </div>
      </div>
      <div className={styles['game-page__canvas']}>
        <GameScoreEffects score={score} />
        <GameCanvas
          isPause={isPause}
          restartKey={restartKey}
          level={gameLevel}
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
        lvlNumber={gameLevel.id}
        isOpened={isOpenModalExit}
      />
    </main>
  )
}
