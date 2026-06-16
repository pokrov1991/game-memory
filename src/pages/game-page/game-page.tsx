import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GameCanvas,
  GameCountdown,
  GameScore,
  GameScoreEffects,
  ModalResult,
  ModalDefault,
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

// Задержка что бы показать все анимации
const delayGameEffects = 1000

export const GamePage = () => {
  const navigate = useNavigate()
  const [isOpenModalWin, setOpenModalWin] = useState(false)
  const [isOpenModalLose, setOpenModalLose] = useState(false)
  const [isOpenModalDefault, setOpenModalDefault] = useState(false)
  const [isPause, togglePause] = useToggle(true)
  const {
    progress,
    selectedLevelArcade,
    selectLevelArcade,
    userScoreArcade,
    scoreArcadeUp,
  } = useProgress()
  const { user } = useUser()
  const [restartKey, setRestartKey] = useState(0)
  const [gameLevel, setGameLevel] = useLevel<GameLevelStoreType>(selectedLevelArcade, 'store') // Уровень игры (из 11 уровней)
  const [sessionLevel, setSessionLevel] = useState(1) // Уровень текущей игры
  const [score, setScore] = useState(0) // Очки за всю игру
  const [scoreSession, setScoreSession] = useState(0) // Очки за текущий уровень
  const [seconds, setSeconds] = useState(gameLevel.gameTimer)
  const [resultText, setResultText] = useState('')
  const [setLeader] = useSetLeaderboardMutation()

  const soundCardSwap = useMusic({ src: './music/game/card-swap.wav', type: 'effect' })
  const soundCardSuccess = useMusic({ src: './music/game/card-success.wav', type: 'effect' })
  const soundWin = useMusic({ src: './music/game/win.mp3', type: 'effect' })
  const soundLose = useMusic({ src: './music/game/lose.mp3', type: 'effect' })

  const onRestart = (): void => {
    setRestartKey(prevKey => prevKey + 1)
    setScoreSession(0)
    togglePause(true)
  }

  const onContinue = async () => {
    const isFinal = sessionLevel >= 11

    if (isFinal) {
      // Запускаем уровни заного начиная с уровня, например 4
      selectLevelArcade(4)
      setGameLevel(4)
    } else {
      selectLevelArcade(sessionLevel)
      setGameLevel(sessionLevel)
    }

    onRestart()
    setOpenModalWin(false)
  }

  const onGameOver = (): void => {
    setOpenModalLose(false)
    navigate('/arcade')
  }

  const onExit = (): void => {
    navigate('/arcade')
  }

  const onSaveResult = async (score: number, level: number) => {
    setScore(score)
    setSessionLevel(level)

    if (score > userScoreArcade) {
      scoreArcadeUp(score)

      await YandexSDK.setGameData({
        ...progress,
        userScoreArcade: score,
      })

      handleSetLeader(level, score)
    }
  }

  const handleMenu = (): void => {
    togglePause(true)
    setOpenModalDefault(true)
  }

  const handlePause = (): void => {
    togglePause()
  }

  const handleGameWin = async () => {
    const totalScore = score + seconds
    const nextLevel = sessionLevel + 1

    onSaveResult(totalScore, nextLevel)

    handlePause()
    setTimeout(() => {
      setResultText(`Вы прошли уровень «${sessionLevel}» и получили ${scoreSession + seconds} очков: ${scoreSession} за карты и за ${seconds} время. Всего ${totalScore} очков.`)
      setOpenModalWin(true)
      soundWin.play()
    }, delayGameEffects)
  }

  const handleGameOver = (): void => {
    onSaveResult(score, sessionLevel)

    setResultText(`Поздравляем! Вы набрали ${score} очков.`)
    setOpenModalLose(true)
    soundLose.play()
  }

  const handleScore = (newScore: number): void => {
    const currentScore = newScore - scoreSession > 0 ? newScore - scoreSession : 0
    const totalScore = currentScore + score

    setScoreSession(newScore)
    setScore(totalScore)

    soundCardSuccess.play()
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
          level: sessionLevel,
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
            initialSeconds={gameLevel.gameTimer}
            onComplete={handleGameOver}
            onSeconds={handleSeconds}
          />
        </div>
        <div className={styles['game-page__info']}>
          <GameScore score={score} arcadeLevel={sessionLevel} />
        </div>
      </div>
      <div className={styles['game-page__canvas']}>
        <GameScoreEffects score={scoreSession} />
        <GameCanvas
          isPause={isPause}
          restartKey={restartKey}
          level={gameLevel}
          onScore={handleScore}
          onColor={() => {}}
          onPlay={handlePause}
          onVictory={handleGameWin}
          onClick={soundCardSwap.play}
        />
      </div>
      <ModalResult
        onContinue={onContinue}
        levelName={resultText}
        isOpened={isOpenModalWin}
        type={TypeModal.Win}
      />
      <ModalResult
        onContinue={onGameOver}
        levelName={resultText}
        isOpened={isOpenModalLose}
        type={TypeModal.Lose}
      />
      <ModalDefault
        onContinue={onExit}
        onExit={() => setOpenModalDefault(false)}
        title="Выход"
        subtitle={`Вы остановились в на уровне ${sessionLevel}.`}
        info="Вы желаете выйти из игры?"
        isOpened={isOpenModalDefault}
      />
    </main>
  )
}
