import classNames from 'classnames'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GameCanvas,
  GameScore,
  GameScoreEffects,
  GameTimerAttack,
  ModalResult,
  ModalDefault,
  ModalLevelUp
} from '@/shared/components'
import { useLevel, useToggle, useProgress, useMusic } from '@/shared/hooks'
import { useSetLeaderboardMutation } from '@/shared'
import { useUser } from '@/shared/contexts/UserContext'
import { TypeModal } from '@/shared/components/modal-comps/types'
import { EnemyState, GameLevelStateType } from '@/shared/services/game/types'
import { EnemyService } from '@/shared/services/game/EnemyService'
import { STUN_ANIMATION_DELAY } from '@/shared/services/game/constants'
import { LEVELS_USER_CONFIG } from '@/shared'
import YandexSDK from '@/shared/services/sdk/yandexSdk'
import styles from './styles.module.css'

// Вычисляем размер UI элементов относительно высоты экрана
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
  const [isOpenModalDefault, setOpenModalDefault] = useState(false)
  const [isOpenModalLevelUp, setOpenModalLevelUp] = useState(false)
  const [isStunEnemy, setStunEnemy] = useState(false)
  const [isStunPlayer, setStunPlayer] = useState(false)
  const [isAlarmPlayer, setAlarmPlayer] = useState(false)
  const [isPause, togglePause] = useToggle(true)
  const [isClickCard, setIsClickCard] = useState(false)
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
  const [gameLevel, _setGameLevel] = useLevel<GameLevelStateType>(selectedLevel, 'battle')
  const [level, setLevel] = useState(userLevel > 0 ? userLevel : game.userLevel)
  const [score, setScore] = useState(userScore > 0 ? userScore : game.userScore)
  const [scoreSession, setScoreSession] = useState(0)
  const [colorPlayerAttack, setColorPlayerAttack] = useState('')
  const [colorPlayerPreAttack, setColorPlayerPreAttack] = useState('')
  const [colorEnemyAttack, setColorEnemyAttack] = useState('')
  const [resultText, setResultText] = useState('')
  const [setLeader] = useSetLeaderboardMutation()
  const [enemyState, setEnemyState] = useState('default')
  const [enemyHit, setEnemyHit] = useState(false)
  const [playerHit, setPlayerHit] = useState(false)
  const enemyRef = useRef<EnemyService | null>(null)

  const hpGuard = game.userInventory
                    .filter(item => item.type === 'helmet' && item.isDressed || item.type === 'plastron' && item.isDressed)
                    .reduce((sum, item) => sum + item.hp, 0)
  const hpInitial = game.userParams.hp + hpGuard
  const hpEnemyInitial = gameLevel.enemyHp
  const [hp, setHP] = useState(hpInitial)
  const [hpEnemy, setHPEnemy] = useState(hpEnemyInitial)

  useMusic({ src: '/music/success.mp3', conditional: isOpenModalWin })
  useMusic({ src: '/music/timeout.mp3', conditional: isOpenModalLose })

  const setGameDataWin = async (nextLevel: number) => {
    await YandexSDK.setGameData({
      ...game,
      completedLevels: Array.from(new Set([ ...game.completedLevels, nextLevel ])),
      selectedLevel: nextLevel,
      userLevel: level,
      userScore: score,
    })
  }
  
  const setGameDataLose = async () => {
    await YandexSDK.setGameData({
      ...game,
      userLevel: level,
      userScore: score,
    })
  }

  const setPlayerSpriteClass = (color: string) => {
    return color ? styles[`game-page__person-img-player-tablet_${color}`] : ''
  }

  const setEnemySpriteClass = (color: string, enemyId: number) => {
    switch (enemyState) {
      case EnemyState.START:
        return styles[`game-page__person-img-enemy-${enemyId}_start-${color}`]
      case EnemyState.RUN:
        return styles[`game-page__person-img-enemy-${enemyId}_run-${color}`]
      case EnemyState.ATTACK:
        return styles[`game-page__person-img-enemy-${enemyId}_attack-${color}`]
        case EnemyState.STUN:
        return styles[`game-page__person-img-enemy-${enemyId}_stun`]
      case EnemyState.HIT:
        return styles[`game-page__person-img-enemy-${enemyId}_hit`]
      case EnemyState.DEAD:
        return styles[`game-page__person-img-enemy-${enemyId}_dead`]
      default:
        return ''
    }
  }

  useEffect(() => {
    if (!enemyRef.current) {
      enemyRef.current = new EnemyService(gameLevel.enemyStateDurations, setEnemyState)
    }
  }, [])

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
    setHP(hpInitial)
    setHPEnemy(gameLevel.enemyHp)
    setAlarmPlayer(false)
    setColorPlayerAttack('')
    setColorPlayerPreAttack('')
    togglePause(true)
    enemyRef.current.resetState()
  }

  const onContinue = async () => {
    const nextLevel = gameLevel.id + 1

    completeLevel(nextLevel)
    selectLevel(nextLevel)
    
    setGameDataWin(nextLevel)
    // handleSetLeader(level, score)

    setOpenModalWin(false)
    navigate('/levels')
  }

  const onGameOver = (): void => {
    setGameDataLose()
    setOpenModalLose(false)
    onRestart()
  }

  const onExit = (): void => {
    setGameDataLose()
    navigate('/levels')
  }

  const handleMenu = (): void => {
    togglePause(true)
    setOpenModalDefault(true)
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
    enemyRef.current.setDeadState()
    handlePause()
    setTimeout(() => {
      setResultText(`Поздравляем! Вы прошли уровень «${gameLevel.title}» и получили опыт: ${scoreSession} exp`)
      setOpenModalWin(true)
    }, delayGameEffects + gameLevel.enemyStateDurations.DEAD)
  }

  const handleGameOver = (): void => {
    handlePause()
    setResultText(`Не унывай! Попробуй еще раз пройти уровень. У тебя получится )`)
    setOpenModalLose(true)
  }

  const handleScore = (newScore: number, colorParry: string): void => {
    // Прибавляем очки
    const currentScore = newScore - scoreSession > 0 ? newScore - scoreSession : 0
    const totalScore = currentScore + score
    console.log('attack player', currentScore, `(${newScore} ${totalScore})`)
    setScoreSession(newScore)
    setScore(totalScore)
    scoreUp(totalScore)

    // Проверяем уровень
    const currentLevel = LEVELS_USER_CONFIG.findLast(lvl => totalScore >= lvl.score)?.id
    if (currentLevel > level) {
      setLevel(currentLevel)
      levelUp(currentLevel)

      togglePause(true)
      setOpenModalLevelUp(true)
    }

    // Ставим удар по врагу
    if (newScore > 0) {
      const attack = Math.floor(currentScore + currentScore * game.userParams.attack / 100)
      const newHpEnemy = hpEnemy > attack ? hpEnemy - attack : 0
      setHPEnemy(newHpEnemy)

      setEnemyHit(true)
      setTimeout(() => setEnemyHit(false), 200)

      if (colorParry === colorEnemyAttack) {
        setStunEnemy(true)
        enemyRef.current.setHitState()
        // enemyRef.current.setStunState() // можно оставить, но главное isStunEnemy
        setTimeout(() => setStunEnemy(false), STUN_ANIMATION_DELAY / 1000)
      } 
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
    // Фиксируем клик по карте для анимации нажатия
    setIsClickCard(true)
    setTimeout(() => setIsClickCard(false), 300) 
  }

  const handleTickEnemyAttack = (seconds: number, attackNumber: number): void => {    
    if (seconds === Math.floor(gameLevel.enemyStateDurations.ATTACK / 1000)) {
      enemyRef.current.setAttackState()
    } else if (isStunEnemy) {
      enemyRef.current.setStunState()
    } else if (seconds === gameLevel.initialSeconds[attackNumber]) {
      enemyRef.current.setStartState()
    } else if (enemyRef.current.state !== EnemyState.RUN) {
      enemyRef.current.setRunState()
    }

    setColorEnemyAttack(gameLevel.initialColors[attackNumber])
  }

  const handleEnemyAttack = (damage: number): void => {
    console.log('attack enemy', damage)
    const damageWithGuard = Math.floor(damage - damage * game.userParams.guard / 100)
    const newHp = hp > damageWithGuard ? hp - damageWithGuard : 0
    setHP(newHp)

    newHp < 30 ? setAlarmPlayer(true) : setAlarmPlayer(false)

    setPlayerHit(true)
    setTimeout(() => setPlayerHit(false), 200)

    if (colorPlayerPreAttack === colorEnemyAttack) {
      setStunPlayer(true)
      setTimeout(() => setStunPlayer(false), STUN_ANIMATION_DELAY)
    }
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
    <main className={classNames(
      styles['game-page'],
      { 
        [styles['game-page_player-hit']]: playerHit,
        [styles['game-page_enemy-hit']]: enemyHit,
      }
    )}>
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
          <GameScore score={score} />
        </div>
      </div>


      <div className={styles['game-page__persons']}>
        <div className={classNames(
            styles['game-page__person'],
            styles['game-page__person_player']
          )}>
          <div className={classNames(
            styles['game-page__person-img'], 
            { [styles['game-page__person-img-player_hit-flash']]: playerHit }
          )}>
            <div className={styles['game-page__person-img-player']}>
              <div className={styles['game-page__person-img-player-pack']}></div>
              <div className={styles['game-page__person-img-player-legs']}></div>
              <div className={styles['game-page__person-img-player-body']}></div>
              <div className={classNames(
                styles['game-page__person-img-player-arm'],
                { [styles['game-page__person-img-player-arm_active']]: isClickCard }
              )}></div>
              <div className={classNames(
                styles['game-page__person-img-player-head'],
                { 
                  [styles['game-page__person-img-player-head_stun']]: isStunPlayer,
                  [styles['game-page__person-img-player-head_alarm']]: isAlarmPlayer
                }
              )}></div>
              <div className={classNames(
                styles['game-page__person-img-player-tablet'],
                setPlayerSpriteClass(colorPlayerPreAttack)
              )}></div>
            </div>
          </div>
          <div className={styles['game-page__person-info']}>
            <div className={styles['game-page__person-name']}>Игрок</div>
            <div className={styles['game-page__person-hp']}>
              <div
                className={styles['game-page__person-hp-bar']}
                style={{ width: `${(hp / hpInitial * 100)}%` }}>
                  <span>{hp}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={classNames(
          styles['game-page__person'],
          styles['game-page__person_enemy']
        )}>
          <div className={styles['game-page__person-img']}>
            <div className={classNames(
              styles['game-page__person-img-enemy'],
              styles[`game-page__person-img-enemy-${gameLevel.enemyId}`],
              { [styles['game-page__person-img-enemy_hit-flash']]: enemyHit },
              setEnemySpriteClass(colorEnemyAttack, gameLevel.enemyId)
            )}></div>
          </div>
          <div className={styles['game-page__person-info']}>
            <div className={styles['game-page__person-name']}>{gameLevel.enemyName}</div>
            <div className={styles['game-page__person-hp']}>
              <div
                className={styles['game-page__person-hp-bar']}
                style={{ width: `${(hpEnemy / hpEnemyInitial * 100)}%` }}>
                  <span>{hpEnemy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className={classNames(
        styles['game-page__canvas'], 
        { [styles['game-page__canvas_stun']]: isStunPlayer }
      )}>
        <GameScoreEffects score={scoreSession} />
        <GameCanvas
          isPause={isPause}
          restartKey={restartKey}
          level={gameLevel}
          onScore={handleScore}
          onColor={handleColor}
          onPlay={handlePause}
          onVictory={handleChangeCards}
        />
        <GameTimerAttack
          isPause={isPause}
          isStun={isStunEnemy}
          restartKey={restartKey}
          colorParry={colorPlayerAttack}
          initialSeconds={gameLevel.initialSeconds}
          initialAttacks={gameLevel.initialAttacks}
          initialColors={gameLevel.initialColors}
          onEnemyAttack={handleEnemyAttack}
          onTick={handleTickEnemyAttack}
        />
      </div>
      <ModalLevelUp
        onContinue={() => setOpenModalLevelUp(false)}
        level={level}
        isOpened={isOpenModalLevelUp}
      />
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
        title={`Уровень ${gameLevel.id}`}
        subtitle={gameLevel.title}
        info="Вы желаете выйти из игры?"
        isOpened={isOpenModalDefault}
      />
    </main>
  )
}
