import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  GameCanvas,
  GameCountdown,
  GameScore,
  GameScoreEffects,
  ModalResult,
  ModalDefault,
} from '@/shared/components'
import { useLevel, useToggle, useProgress, useMusic } from '@/shared/hooks'
import { TypeModal } from '@/shared/components/modal-comps/types'
import { GameLevelStoreType } from '@/shared/services/game/types'
import { platformApi } from '@/shared/services/platform'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'


// Вычисляем размер UI эдементов относительно высоты экрана
let scalePercent = window.innerHeight < 1040 ? window.innerHeight / 1040 : 1

const scaleStyle = {
  transform: `scale(${scalePercent})`
}

// Задержка что бы показать все анимации
const delayGameEffects = 1000

export const GamePage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
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
  const { levelId } = location.state || {}
  const [restartKey, setRestartKey] = useState(0)
  const [gameLevel, setGameLevel] = useLevel<GameLevelStoreType>(selectedLevelArcade, 'store') // Уровень игры (из 11 уровней)
  const [sessionLevel, setSessionLevel] = useState(1) // Уровень текущей игры
  const [score, setScore] = useState(0) // Очки за всю игру
  const [scoreSession, setScoreSession] = useState(0) // Очки за текущий уровень
  const [seconds, setSeconds] = useState(gameLevel.gameTimer)
  const [resultText, setResultText] = useState('')

  const soundCardSwap = useMusic({ src: './music/game/card-swap.wav', type: 'effect' })
  const soundCardSuccess = useMusic({ src: './music/game/card-success.wav', type: 'effect' })
  const soundWin = useMusic({ src: './music/game/win.wav', type: 'effect' })
  const soundLose = useMusic({ src: './music/game/lose.wav', type: 'effect' })

  const onRestart = (): void => {
    setRestartKey(prevKey => prevKey + 1)
    setScoreSession(0)
    togglePause(true)
  }

  const onContinue = async () => {
    if (levelId) navigate('/arcade')

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
    if (levelId) return

    setScore(score)
    setSessionLevel(level)

    if (score > userScoreArcade) {
      scoreArcadeUp(score)

      await platformApi.setGameData({
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
      setResultText(`${t('game.results.arcadeWinStart')} «${sessionLevel}» ${t('game.results.coinsWinValue')} ${scoreSession + seconds} ${t('game.results.arcadeWinMiddle')} ${scoreSession} ${t('game.results.cardsScore')} ${seconds} ${t('common.time')}. ${t('game.results.total')} ${totalScore} ${t('game.results.arcadeWinEnd')}`)
      setOpenModalWin(true)
      soundWin.play()
    }, delayGameEffects)
  }

  const handleGameOver = (): void => {
    onSaveResult(score, sessionLevel)

    setResultText(`${t('game.results.arcadeLose')} ${score} ${t('game.results.arcadeWinEnd')}`)
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
    await platformApi.setLeaderboardScore('orionBoard', score, `${level}`)
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
        title={t('game.exitTitle')}
        subtitle={`${t('game.results.total')}: ${t('common.level')} ${levelId ?? sessionLevel}.`}
        info={t('pvp.exit.title')}
        isOpened={isOpenModalDefault}
      />
    </main>
  )
}
