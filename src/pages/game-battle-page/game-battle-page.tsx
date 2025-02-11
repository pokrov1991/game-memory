import classNames from 'classnames'
import { useState, useEffect } from 'react'
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
import { useUser } from '@/shared/contexts/UserContext'
import { TypeModal } from '@/shared/components/modal-comps/types'
import { GameLevelStateType } from '@/shared/services/game/types'
import { ATTACK_FACTOR } from '@/shared/services/game/constants'
import { LEVELS_USER_CONFIG } from '@/shared'
import YandexSDK from '@/shared/services/sdk/yandexSdk'
import styles from './styles.module.css'

// Вычисляем размер UI эдементов относительно высоты экрана
let scalePercent = window.innerHeight < 1040 ? window.innerHeight / 1040 : 1

const scaleStyle = {
  transform: `scale(${scalePercent})`
}

// Задержка что бы показать все анимации
const delayGameEffects = 1000

export const GameBattlePage = () => {
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
  const [level, setLevel] = useLevel<GameLevelStateType>(selectedLevel, 'battle')
  const [restartKey, setRestartKey] = useState(0)
  const [score, setScore] = useState(game.userScore)
  const [scoreSession, setScoreSession] = useState(0)
  const [colorPlayerAttack, setColorPlayerAttack] = useState('')
  const [colorPlayerPreAttack, setColorPlayerPreAttack] = useState('')
  const [colorEnemyAttack, setColorEnemyAttack] = useState('')
  const [hp, setHP] = useState(100)
  const [hpEnemy, setHPEnemy] = useState(100)
  const [resultText, setResultText] = useState('')
  const [setLeader] = useSetLeaderboardMutation()

  // TODO: cScore и сохранение очков когда выходишь

  useMusic({ src: '/music/success.mp3', conditional: isOpenModalWin })
  useMusic({ src: '/music/timeout.mp3', conditional: isOpenModalLose })

  useEffect(() => {
    if (hp <= 0) {
      handleGameOver()
    }
    if (hpEnemy <= 0) {
      handleGameWin()
    }
  }, [hp, hpEnemy])

  const onRestart = (): void => {
    setRestartKey(prevKey => prevKey + 1)
    setScoreSession(0)
    setHP(100)
    setHPEnemy(100)
    setColorPlayerAttack('')
    setColorPlayerPreAttack('')
    togglePause(true)
  }

  const onContinue = async () => {
    const nextLevel = level.id + 1

    completeLevel(nextLevel)
    selectLevel(nextLevel)
    
    await YandexSDK.setGameData({
      ...game,
      completedLevels: Array.from(new Set([ ...game.completedLevels, nextLevel ])),
      selectedLevel: nextLevel,
      userLevel: userLevel,
      userScore: userScore,
    })

    handleSetLeader(userLevel, userScore)

    setOpenModalWin(false)
    navigate('/levels')
  }

  const onGameOver = (): void => {
    setOpenModalLose(false)
    onRestart()
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
      setResultText(`Поздравляем! Вы прошли уровень «${level.title}» и получили опыт: ${score} exp`)
      setOpenModalWin(true)
    }, delayGameEffects)
  }

  const handleGameOver = (): void => {
    handlePause()
    setResultText(`Не унывай! Попробуй еще раз пройти уровень. У тебя получится )`)
    setOpenModalLose(true)
  }

  const handleScore = (newScore: number): void => {
    // Прибавляем очки
    const currentScore = newScore - scoreSession > 0 ? newScore - scoreSession : 0
    const totalScore = currentScore + score
    console.log('attack player', currentScore, `(${newScore} ${totalScore})`)
    setScoreSession(newScore)
    setScore(totalScore)
    scoreUp(totalScore)

    // Проверяем уровень
    LEVELS_USER_CONFIG.forEach((lvl, _index) => {
      if (lvl.score <= totalScore && lvl.id > userLevel) {
        levelUp(level.id)
      }
    })

    // Ставим удар по врагу
    if (newScore > 0) {
      const attack = Math.floor(currentScore * ATTACK_FACTOR)
      const newHpEnemy = hpEnemy > attack ? hpEnemy - attack : 0
      setHPEnemy(newHpEnemy)

      setStun(true)
      setTimeout(() => {
        setStun(false)
      }, 0)
    }
  }

  const handleColor = (color: string, countFlipped: number): void => {
    if (countFlipped === 1) {
      setColorPlayerPreAttack(color)
    }
    if (countFlipped === 2) {
      setColorPlayerPreAttack('')
      setColorPlayerAttack(color)
    }
  }

  const handleTimerEnemyAttack = (second: number, color: string): void => {
    console.log('timer', second)
    setColorEnemyAttack(color)
  }

  const handleEnemyAttack = (attack: number): void => {
    const newHp = hp > attack ? hp - attack : 0
    console.log('attack enemy', attack, newHp)
    setHP(newHp)
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
        </div>
        <div className={styles['game-page__info']}>
          <GameScore score={score} level={level} />
        </div>
      </div>


      <div className={styles['game-page__persons']}>
        <div className={
          classNames(
            styles['game-page__person'],
            { [styles['game-page__person_player']]: true },
          )
        }>
          <div className={styles['game-page__person-img']}>
            <div 
              className={styles['game-page__person-img-attack']} 
              style={{ background: `${colorPlayerPreAttack}` }}></div>
          </div>
          <div className={styles['game-page__person-info']}>
            <div className={styles['game-page__person-name']}>Игрок</div>
            <div className={styles['game-page__person-hp']}>
              <div
                className={styles['game-page__person-hp-bar']}
                style={{ width: `${hp}%` }}></div>
            </div>
          </div>
        </div>
        <div className={
          classNames(
            styles['game-page__person'],
            { [styles['game-page__person_enemy']]: true },
          )
        }>
          <div className={styles['game-page__person-img']}>
            <div 
              className={styles['game-page__person-img-attack']} 
              style={{ background: `${colorEnemyAttack}` }}></div>
          </div>
          <div className={styles['game-page__person-info']}>
            <div className={styles['game-page__person-name']}>Враг</div>
            <div className={styles['game-page__person-hp']}>
              <div
                className={styles['game-page__person-hp-bar']}
                style={{ width: `${hpEnemy}%` }}></div>
            </div>
          </div>
        </div>
      </div>


      <div className={styles['game-page__canvas']}>
        <GameScoreEffects score={scoreSession} />
        <GameCanvas
          isPause={isPause}
          restartKey={restartKey}
          level={level}
          onScore={handleScore}
          onColor={handleColor}
          onPlay={handlePause}
          onVictory={handleChangeCards}
        />
        <GameTimerAttack
          isPause={isPause}
          isStun={isStun}
          restartKey={restartKey}
          colorParry={colorPlayerAttack}
          initialSeconds={level.initialSeconds}
          initialAttacks={[20,40,10,10,12]}
          initialColors={['red','blue','green','black','yellow']}
          onEnemyAttack={handleEnemyAttack}
          onTimer={handleTimerEnemyAttack}
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
