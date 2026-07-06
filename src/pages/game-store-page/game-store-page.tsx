import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  GameCanvas,
  GameCountdown,
  GameScore,
  ModalResult,
  ModalDefault,
} from '@/shared/components'
import { useLevel, useToggle, useProgress, useMusic } from '@/shared/hooks'
import { useUser } from '@/shared/contexts/UserContext'
import { TypeModal } from '@/shared/components/modal-comps/types'
import { GameLevelStoreType } from '@/shared/services/game/types'
import { platformApi } from '@/shared/services/platform'
import { STATS } from '@/shared/services/platform/config'
import { ACHIEVEMENTS } from '@/shared/services/platform/config'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'


// Вычисляем размер UI эдементов относительно высоты экрана
let scalePercent = window.innerHeight < 1040 ? window.innerHeight / 1040 : 1

const scaleStyle = {
  transform: `scale(${scalePercent})`
}

// Задержка что бы показать все анимации
const delayGameEffects = 1000

export const GameStorePage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpenModalWin, setOpenModalWin] = useState(false)
  const [isOpenModalLose, setOpenModalLose] = useState(false)
  const [isOpenModalDefault, setOpenModalDefault] = useState(false)
  const [isPause, togglePause] = useToggle(true)
  const {
    userCoins,
    coinsUp,
  } = useProgress()
  const { game } = useUser()
  const { levelId } = location.state || {}
  const [restartKey, _setRestartKey] = useState(0)
  const [gameLevel, _setGameLevel] = useLevel<GameLevelStoreType>(levelId, 'store')
  const [score, _setScore] = useState(game.userScore)
  const [coins, _setCoins] = useState(game.userCoins)
  const [_seconds, setSeconds] = useState(gameLevel.gameTimer)
  const [resultText, setResultText] = useState('')

  const cCoins = userCoins > 0 ? userCoins : coins

  const soundCardSwap = useMusic({ src: './music/game/card-swap.wav', type: 'effect' })
  const soundCardSuccess = useMusic({ src: './music/game/card-success.wav', type: 'effect' })
  const soundWin = useMusic({ src: './music/game/win.wav', type: 'effect' })
  const soundLose = useMusic({ src: './music/game/lose.wav', type: 'effect' })

  const setGameDataWin = async () => {
    const currentCoins = cCoins + gameLevel.coins
    coinsUp(currentCoins)
    await platformApi.setGameData({
      ...game,
      userCoins: currentCoins
    })
  }

  const setGameDataLose = async () => {
    const currentCoins = cCoins > gameLevel.coins ? cCoins - gameLevel.coins : 5
    coinsUp(currentCoins)
    await platformApi.setGameData({
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
    setOpenModalDefault(false)
    navigate('/tavern')
  }

  const handleMenu = (): void => {
    togglePause(true)
    setOpenModalDefault(true)
  }

  const handlePause = (): void => {
    togglePause()
  }

  const handleGameWin = (): void => {
    handlePause()
    setTimeout(() => {
      setResultText(`${t('game.results.coinsWinStart')} «${t(`levels.store.${gameLevel.id}.title`)}» ${t('game.results.coinsWinValue')} ${gameLevel.coins} ${t('common.coins')}.`)
      setOpenModalWin(true)
      soundWin.play()
    }, delayGameEffects)

    platformApi.incrementStat(STATS.GAMES_PLAYED)
    platformApi.incrementStat(STATS.WINS)
    platformApi.incrementStat(STATS.COINS, gameLevel.coins)
    unlockAchievementFirstWinStore()
    if (gameLevel.id === 11) {
      unlockAchievementCompleteStore()
    }
  }

  const handleGameOver = (): void => {
    setResultText(`${t('game.results.coinsLoseStart')} «${t(`levels.store.${gameLevel.id}.title`)}» ${t('game.results.coinsLoseValue')} ${gameLevel.coins} ${t('game.results.coinsLoseEnd')}`)
    setOpenModalLose(true)
    soundLose.play()

    platformApi.incrementStat(STATS.GAMES_PLAYED)
  }

  const handleSeconds = (reSeconds: number): void => {
    setSeconds(reSeconds)
  }

  const unlockAchievementFirstWinStore = async (): Promise<void> => {
    const isUnlocked = await platformApi.getAchievement(ACHIEVEMENTS.FIRST_WIN_STORE)
    if (!isUnlocked) {
      await platformApi.unlockAchievement(ACHIEVEMENTS.FIRST_WIN_STORE)
    }
  }

  const unlockAchievementCompleteStore = async (): Promise<void> => {
    const isUnlocked = await platformApi.getAchievement(ACHIEVEMENTS.COMPLETE_STORE)
    if (!isUnlocked) {
      await platformApi.unlockAchievement(ACHIEVEMENTS.COMPLETE_STORE)
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
          <GameScore score={score} />
        </div>
      </div>
      <div className={styles['game-page__canvas']}>
        <GameCanvas
          isPause={isPause}
          restartKey={restartKey}
          level={gameLevel}
          onScore={soundCardSuccess.play}
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
        title={t(`levels.store.${gameLevel.id}.title`)}
        subtitle={`${t('game.results.coinsLoseValue')} ${gameLevel.coins} ${t('common.coins')}!`}
        info={t('pvp.exit.title')}
        isOpened={isOpenModalDefault}
      />
    </main>
  )
}
