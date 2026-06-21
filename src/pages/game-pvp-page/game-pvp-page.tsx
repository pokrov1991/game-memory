import classNames from 'classnames'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GameCanvas,
  GameScore,
  GameScoreEffects,
  ModalResult,
  ModalDefault,
  ModalLevelUp
} from '@/shared/components'
import { useLevel, useToggle, useProgress, useMusic } from '@/shared/hooks'
import { useUser } from '@/shared/contexts/UserContext'
import { TypeModal } from '@/shared/components/modal-comps/types'
import { GameLevelStateType } from '@/shared/services/game/types'
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

export const GamePvpPage = () => {
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
  const [isClickCardEnemy, setIsClickCardEnemy] = useState(false)
  const {
    progress,
    completedLevels,
    completeLevel,
    selectedLevel,
    selectLevel,
    userLevel,
    userScore,
    userInventory,
    userParams,
    userOrgans,
    userPotions,
    updateOrgan,
    levelUp,
    scoreUp,
  } = useProgress()
  const { game } = useUser()
  const [restartKey, setRestartKey] = useState(0)
  const [gameLevel, _setGameLevel] = useLevel<GameLevelStateType>(selectedLevel, 'battle')
  const [locationId, setLocationId] = useState(1)
  const [level, setLevel] = useState(userLevel > 0 ? userLevel : game.userLevel)
  const [score, setScore] = useState(userScore > 0 ? userScore : game.userScore)
  const [scoreSession, setScoreSession] = useState(0)
  const [colorPlayerAttack, setColorPlayerAttack] = useState('')
  const [colorPlayerPreAttack, setColorPlayerPreAttack] = useState('')
  const [colorEnemyAttack, setColorEnemyAttack] = useState('')
  const [resultText, setResultText] = useState(<></>)
  const [playerSkinId, setPlayerSkinId] = useState(gameLevel.enemyId)
  const [enemySkinId, setEnemySkinId] = useState(gameLevel.enemyId)
  const [enemyHit, setEnemyHit] = useState(false)
  const [playerHit, setPlayerHit] = useState(false)
  const [potions, setPotions] = useState(userPotions)
  const enemyRef = useRef<EnemyService | null>(null)
  const enemyOrgan = userOrgans[gameLevel.id]
  const userHelmetId = userInventory.find((item) => item.type === 'helmet' && item.isDressed).id
  const userPlastronId = userInventory.find((item) => item.type === 'plastron' && item.isDressed).id

  // Для игры PvP
  const socketRef = useRef<WebSocket | null>(null)
  const [battleId, setBattleId] = useState('')
  const [playerSide, setPlayerSide] = useState<'p1' | 'p2' | null>(null)
  const playerSideRef = useRef<'p1' | 'p2' | null>(null)
  const [battleStatus, setBattleStatus] = useState<'waiting' | 'preparing' | 'playing'>('waiting')

  const hpGuard = userInventory
                    .filter(item => item.type === 'helmet' && item.isDressed || item.type === 'plastron' && item.isDressed)
                    .reduce((sum, item) => sum + item.hp, 0)
  const hpInitial = userParams.hp + hpGuard
  const hpEnemyInitial = gameLevel.enemyHp
  const hpAlarm = 30
  const [hp, setHP] = useState(hpInitial)
  const [hpEnemy, setHPEnemy] = useState(hpEnemyInitial)

  const soundCardSwap = useMusic({ src: './music/game/card-swap.wav', type: 'effect' })
  const soundCardSuccess = useMusic({ src: './music/game/card-success.wav', type: 'effect' })
  const soundPlayerHit = useMusic({ src: './music/game/player-hit.wav', type: 'effect' })
  const soundPlayerStun = useMusic({ src: './music/game/player-stun.wav', type: 'effect' })
  const soundEnemyStun = useMusic({ src: './music/game/enemy-stun.wav', type: 'effect' })
  const soundWin = useMusic({ src: './music/game/win.wav', type: 'effect' })
  const soundLose = useMusic({ src: './music/game/lose.wav', type: 'effect' })

  const setGameDataWin = async (nextLevel: number) => {
    await YandexSDK.setGameData({
      ...progress,
      completedLevels: Array.from(new Set([ ...completedLevels, nextLevel ])),
      selectedLevel: nextLevel,
      userLevel: level,
      userScore: score,
      userOrgans: userOrgans
    })
  }
  
  const setGameDataLose = async () => {
    await YandexSDK.setGameData({
      ...progress,
      userLevel: level,
      userScore: score,
    })
  }

  const setPlayerSpriteClass = (color: string) => {
    return color ? styles[`game-page__person-img-player-tablet_${color}`] : ''
  }

  useEffect(() => {
    const ws = new WebSocket('wss://orion7.skybug.ru/ws')

    socketRef.current = ws

    ws.onopen = () => {
      const savedBattleId = sessionStorage.getItem('pvpBattleId')
      const savedPlayerSide = sessionStorage.getItem('pvpPlayerSide') as 'p1' | 'p2' | null
      const savedBattleState = sessionStorage.getItem('pvpBattleState')

      if (!savedBattleId || !savedPlayerSide || !savedBattleState) {
        navigate('/pvp')
        return
      }

      const state = JSON.parse(savedBattleState)
      const enemySide = savedPlayerSide === 'p1' ? 'p2' : 'p1'

      setLocationId(state.locationId || 1)
      setBattleId(savedBattleId)
      setPlayerSide(savedPlayerSide)
      playerSideRef.current = savedPlayerSide

      setEnemySkinId(state[enemySide].skinId)
      setHP(state[savedPlayerSide].hp)
      setHPEnemy(state[enemySide].hp)
      setPotions(state[savedPlayerSide].potions)

      ws.send(JSON.stringify({
        type: 'join_battle_socket',
        battleId: savedBattleId,
        side: savedPlayerSide,
      }))
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      if (msg.type === 'joined_battle_socket') {
        ws.send(JSON.stringify({
          type: 'player_ready',
          battleId: msg.battleId,
        }))
        return
      }

      if (msg.type === 'waiting') {
        setBattleStatus('waiting')
        togglePause(true)
      }

      if (msg.type === 'match_found') {
        setBattleId(msg.battleId)
        setPlayerSide(msg.you)
        playerSideRef.current = msg.you
        setBattleStatus('preparing')

        const mySide = msg.you
        const enemySide = mySide === 'p1' ? 'p2' : 'p1'

        setLocationId(msg.state.locationId || 1)
        setPlayerSkinId(msg.state[mySide].skinId)
        setEnemySkinId(msg.state[enemySide].skinId)

        ws.send(JSON.stringify({
          type: 'player_ready',
          battleId: msg.battleId,
        }))
      }

      if (msg.type === 'battle_started') {
        setBattleStatus('playing')
        togglePause(false)
      }

      if (
        msg.type === 'state' ||
        msg.type === 'attack_result' ||
        msg.type === 'potion_used' ||
        msg.type === 'enemy_attack_color'
      ) {
        const mySide = playerSideRef.current
        if (!mySide) return

        const enemySide = mySide === 'p1' ? 'p2' : 'p1'

        setLocationId(msg.state.locationId || 1)
        setPlayerSkinId(msg.state[mySide].skinId)
        setEnemySkinId(msg.state[enemySide].skinId)
        setHP(msg.state[mySide].hp)
        setHPEnemy(msg.state[enemySide].hp)
        setPotions(msg.state[mySide].potions)

        setColorEnemyAttack(msg.state[enemySide].colorPreAttack)
        setColorPlayerPreAttack(msg.state[mySide].colorPreAttack)
        setColorPlayerAttack(msg.state[mySide].colorAttack)

        if (msg.type === 'attack_result') {
          if (msg.target === mySide && msg.damage > 0) {
            setPlayerHit(true)
            setTimeout(() => setPlayerHit(false), 200)
            soundPlayerHit.play()
          }

          if (msg.target === enemySide && msg.damage > 0) {
            setEnemyHit(true)
            setTimeout(() => setEnemyHit(false), 200)
          }
        }

        if (msg.type === 'enemy_attack_color') {
          if (msg.from !== mySide) {
            setIsClickCardEnemy(true)
            setTimeout(() => setIsClickCardEnemy(false), 300)
          }
        }
      }

      if (msg.type === 'stun_success') {
        const mySide = playerSideRef.current

        if (msg.from === mySide) {
          setStunEnemy(true)
          enemyRef.current?.setHitState()
          setTimeout(() => setStunEnemy(false), STUN_ANIMATION_DELAY)
          soundEnemyStun.play()
        } else {
          setStunPlayer(true)
          setTimeout(() => setStunPlayer(false), STUN_ANIMATION_DELAY)
          soundPlayerStun.play()
        }
      }

      if (msg.type === 'win') {
        handleGameWin()
      }

      if (msg.type === 'lose') {
        handleGameOver()
      }

      if (msg.type === 'opponent_left') {
        setResultText(<>Соперник вышел из боя.</>)
        setOpenModalWin(true)
        soundWin.play()
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    if (hp <= 0) {
      handleGameOver()
    }
    if (hpEnemy <= 0) {
      handleGameWin()
    }
    if (hp >= hpAlarm) {
      setAlarmPlayer(false)
    } else {
      setAlarmPlayer(true)
    }
  }, [hp, hpEnemy, hpAlarm])

  const onRestart = (): void => {
    setRestartKey(prevKey => prevKey + 1)
    setScoreSession(0)
    setHP(hpInitial)
    setHPEnemy(gameLevel.enemyHp)
    setPotions(userPotions)
    setStunPlayer(false)
    setAlarmPlayer(false)
    setColorPlayerAttack('')
    setColorPlayerPreAttack('')
    togglePause(true)
    enemyRef.current.resetState()
  }

  const onContinue = async () => {
    const nextLevel = gameLevel.id + 1

    if (!completedLevels.find((item) => item === 101)) {
      completeLevel(101)
    }
    completeLevel(nextLevel)
    selectLevel(nextLevel)
    
    setGameDataWin(nextLevel)

    setOpenModalWin(false)
    navigate('/pvp')
  }

  const onGameOver = (): void => {
    setGameDataLose()
    setOpenModalLose(false)
    onRestart()
  }

  const onExit = (): void => {
    setGameDataLose()
    navigate('/pvp')
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
      updateOrgan({ organId: gameLevel.enemyId, count: enemyOrgan.count + 1 })
      setResultText(<>Поздравляем! Вы прошли уровень «{gameLevel.title}» и получили: Энергию - {scoreSession} ед. и {enemyOrgan.name} <i data-icon={`organ-${enemyOrgan.id}`}></i> - 1 шт.</>)
      setOpenModalWin(true)
      soundWin.play()
    }, delayGameEffects + gameLevel.enemyStateDurations.DEAD)
  }

  const handleGameOver = (): void => {
    handlePause()
    setResultText(<>Не унывай! Попробуй еще раз пройти уровень. У тебя получится!</>)
    setOpenModalLose(true)
    soundLose.play()
  }

  const handleScore = (newScore: number, colorParry: string): void => {
    // Прибавляем очки
    const currentScore = newScore - scoreSession > 0 ? newScore - scoreSession : 0
    const totalScore = currentScore + score

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
      const attack = Math.floor(currentScore + userParams.attack)

      socketRef.current?.send(JSON.stringify({
        type: 'attack',
        battleId,
        damage: attack,
        colorParry,
      }))
      
      setEnemyHit(true)
      setTimeout(() => setEnemyHit(false), 200)

      if (colorParry === colorEnemyAttack) {
        setStunEnemy(true)
        enemyRef.current.setHitState()
        setTimeout(() => setStunEnemy(false), STUN_ANIMATION_DELAY / 1000)
        soundEnemyStun.play()
      } 
    }

    soundCardSuccess.play()
  }

  const handleColor = (color: string, countFlipped: number): void => {
    if (countFlipped === 1) {
      setColorPlayerPreAttack(color)
    }
    if (countFlipped === 2) {
      setColorPlayerPreAttack('')
      setColorPlayerAttack(color)
    }

    socketRef.current?.send(JSON.stringify({
      type: 'set_attack_color',
      battleId,
      color,
      countFlipped,
    }))

    // Фиксируем клик по карте для анимации нажатия
    setIsClickCard(true)
    setTimeout(() => setIsClickCard(false), 300)
  }

  const handleUsePotions = (): void => {
    socketRef.current?.send(JSON.stringify({
      type: 'use_potion',
      battleId,
    }))
  }

  return (
    <main className={classNames(
      styles['game-page'],
      styles[`game-page_${locationId}`],
      styles['game-page_pvp'],
      { 
        [styles['game-page_player-hit']]: playerHit,
        [styles['game-page_enemy-hit']]: enemyHit,
      },
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
        <div className={classNames(
            styles['game-page__potions'],
            { [styles['game-page__potions_disabled']]: potions <= 0 }
          )}
          onClick={handleUsePotions}>
          <span>{potions}</span>
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
              <div className={classNames(
                styles['game-page__person-img-player-body'],
                styles[`game-page__person-img-player-body_${userPlastronId}`],
              )}></div>
              <div className={classNames(
                styles['game-page__person-img-player-arm'],
                { [styles['game-page__person-img-player-arm_active']]: isClickCard }
              )}></div>
              <div className={classNames(
                styles['game-page__person-img-player-head'],
                styles[`game-page__person-img-player-head_${userHelmetId}`],
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
          <div className={classNames(
            styles['game-page__person-img'], 
            { [styles['game-page__person-img-player_hit-flash']]: enemyHit }
          )}>
            <div className={styles['game-page__person-img-player']}>
              <div className={styles['game-page__person-img-player-pack']}></div>
              <div className={styles['game-page__person-img-player-legs']}></div>
              <div className={classNames(
                styles['game-page__person-img-player-body'],
                styles[`game-page__person-img-player-body_${userPlastronId}`],
              )}></div>
              <div className={classNames(
                styles['game-page__person-img-player-arm'],
                { [styles['game-page__person-img-player-arm_active']]: isClickCardEnemy }
              )}></div>
              <div className={classNames(
                styles['game-page__person-img-player-head'],
                styles[`game-page__person-img-player-head_${userHelmetId}`],
                { 
                  [styles['game-page__person-img-player-head_stun']]: isStunEnemy,
                  [styles['game-page__person-img-player-head_alarm']]: isAlarmPlayer
                }
              )}></div>
              <div className={classNames(
                styles['game-page__person-img-player-tablet'],
                setPlayerSpriteClass(colorEnemyAttack)
              )}></div>
            </div>
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
          onClick={soundCardSwap.play}
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
        levelName={<>{resultText}</>}
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
