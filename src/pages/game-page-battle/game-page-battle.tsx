import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GameCanvas,
  GameScore,
  GameScoreEffects,
  GameTimerAttack,
  ModalResult,
  ModalExit,
} from '@/shared/components'
import { useLevel, useToggle, useProgress, useMusic } from '@/shared/hooks'
import { useSetLeaderboardMutation } from '@/shared'
import { IDENTIFIER } from '@/utils'
import { TypeModal } from '@/shared/components/modal-comps/types'
import styles from './styles.module.css'
import { useUser } from '@/shared/contexts/UserContext'
import YandexSDK from '@/shared/services/sdk/yandexSdk'

// Вычисляем размер UI эдементов относительно высоты экрана
let scalePercent = window.innerHeight < 1040 ? window.innerHeight / 1040 : 1

const scaleStyle = {
  transform: `scale(${scalePercent})`
}

// Задержка что бы показать все анимации
const delayGameEffects = 1000

export const GamePageBattle = () => {
  const navigate = useNavigate()
  const [isOpenModalWin, setOpenModalWin] = useState(false)
  const [isOpenModalLose, setOpenModalLose] = useState(false)
  const [isOpenModalExit, setOpenModalExit] = useState(false)
  const [isStun, setStun] = useState(false)
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
  const [level, setLevel] = useLevel(selectedLevel)
  const [restartKey, setRestartKey] = useState(0)
  const [score, setScore] = useState(0)
  const [hp, setHP] = useState(100)
  const [resultText, setResultText] = useState('')
  const [setLeader] = useSetLeaderboardMutation()

  console.log('GamePageBattle')

  useMusic({ src: '/music/success.mp3', conditional: isOpenModalWin })
  useMusic({ src: '/music/timeout.mp3', conditional: isOpenModalLose })

  const onRestart = (): void => {
    setRestartKey(prevKey => prevKey + 1)
    setScore(0)
    togglePause(true)
  }

  const onContinue = async () => {
    const scoreTotal = score
    const nextLevel = level.id + 1
    const isFinal = level.id >= 11

    completeLevel(nextLevel)
    setLevel(nextLevel)
    selectLevel(nextLevel)

    if (!isFinal && game.userLevel < nextLevel) {
      levelUp(nextLevel)
    }
    if (game.userLevel === level.id) {
      scoreUp(scoreTotal)
      handleSetLeader(userLevel, userScore + scoreTotal)
    }
    
    await YandexSDK.setGameData({
      completedLevels: Array.from(new Set([ ...game.completedLevels, nextLevel ])),
      selectedLevel: nextLevel,
      userLevel: !isFinal && game.userLevel < nextLevel ? nextLevel : game.userLevel,
      userScore: game.userLevel === level.id ? game.userScore + scoreTotal : game.userScore,
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

  const handleChangeCards = (): void => {
    setTimeout(() => {
      setRestartKey(prevKey => prevKey + 1)
    }, delayGameEffects)
  }

  const handlePause = (): void => {
    togglePause()
  }

  const handleGameWin = (): void => {
    handlePause()
    setTimeout(() => {
      setResultText(
        `Поздравляем! Вы прошли уровень «${level.title}» и получили опыт: ${
          score
        } exp`
      )
      setOpenModalWin(true)
    }, delayGameEffects)
  }

  const handleGameOver = (): void => {
    setResultText(
      `Не унывай! Попробуй еще раз пройти уровень. У тебя получится )`
    )
    setOpenModalLose(true)
  }

  const handleScore = (newScore: number): void => {
    // Прибавляем очки
    const scoreTotal = score + newScore
    console.log('score', scoreTotal)
    setScore(scoreTotal)

    // Ставим удар по врагу
    if (newScore > 0) {
      setStun(true)
      setTimeout(() => {
        setStun(false)
      }, 0)
    }
  }

  const handleAttackSeconds = (second: number): void => {
    console.log('action seconds', second)
  }

  const handleAttack = (attack: number): void => {
    console.log('action', attack)
    // TODO: Уменьшаем шкалу здоровья
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
        ratingFieldName: IDENTIFIER.LeaderboardRatingFieldName,
        teamName: IDENTIFIER.TeamName,
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
          onPlay={handlePause}
          onVictory={handleChangeCards}
        />
        <GameTimerAttack
          isPause={isPause}
          isStun={isStun}
          restartKey={restartKey}
          initialSeconds={[5,10,2,2,3]}
          initialAttacks={[10,20,5,5,6]} // Количество урона в % (можно ослабить если есть доспехи)
          // initialColors={['red','blue','green','black','yellow']} // TODO: Цвета атаки
          onAttack={handleAttack}
          onSeconds={handleAttackSeconds}
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
