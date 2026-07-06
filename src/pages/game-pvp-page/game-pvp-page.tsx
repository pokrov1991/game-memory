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
import { platformApi } from '@/shared/services/platform'
import { STATS } from '@/shared/services/platform/config'
import { ACHIEVEMENTS } from '@/shared/services/platform/config'
import { STUN_ANIMATION_DELAY } from '@/shared/services/game/constants'
import { LEVELS_USER_CONFIG } from '@/shared'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

// Задержка что бы показать все анимации
const delayGameEffects = 1000

export const GamePvpPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [isOpenModalWin, setOpenModalWin] = useState(false)
  const [isOpenModalLose, setOpenModalLose] = useState(false)
  const [isOpenModalDefault, setOpenModalDefault] = useState(false)
  const [isOpenModalLevelUp, setOpenModalLevelUp] = useState(false)
  const [isStunEnemy, setStunEnemy] = useState(false)
  const [isStunPlayer, setStunPlayer] = useState(false)
  const [isAlarmEnemy, setAlarmEnemy] = useState(false)
  const [isAlarmPlayer, setAlarmPlayer] = useState(false)
  const [isPause, togglePause] = useToggle(true)
  const [isClickCard, setIsClickCard] = useState(false)
  const [isClickCardEnemy, setIsClickCardEnemy] = useState(false)
  const {
    userLevel,
    userScore,
    userPotions,
    levelUp,
    scoreUp,
  } = useProgress()
  const { game } = useUser()
  const [restartKey, setRestartKey] = useState(0)
  const [gameLevel, _setGameLevel] = useLevel<GameLevelStateType>(1, 'battle')
  const [locationId, setLocationId] = useState(1)
  const [level, setLevel] = useState(userLevel > 0 ? userLevel : game.userLevel)
  const [score, setScore] = useState(userScore > 0 ? userScore : game.userScore)
  const [scoreSession, setScoreSession] = useState(0)
  const [colorPlayerAttack, setColorPlayerAttack] = useState('')
  const [colorPlayerPreAttack, setColorPlayerPreAttack] = useState('')
  const [colorEnemyAttack, setColorEnemyAttack] = useState('')
  const [resultText, setResultText] = useState(<></>)
  const [playerName, setPlayerName] = useState(t('game.player'))
  const [enemyName, setEnemyName] = useState(t('pvp.opponent'))
  const [playerSkinId, setPlayerSkinId] = useState(1)
  const [enemySkinId, setEnemySkinId] = useState(1)
  const [enemyHit, setEnemyHit] = useState(false)
  const [playerHit, setPlayerHit] = useState(false)
  const [potions, setPotions] = useState(userPotions)

  // Для игры PvP
  const socketRef = useRef<WebSocket | null>(null)
  const countdownIntervalRef = useRef<number | null>(null)
  const battleStartedRef = useRef(false)
  const [isCountdownOpen, setCountdownOpen] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [battleId, setBattleId] = useState('')
  const [playerSide, setPlayerSide] = useState<'p1' | 'p2' | null>(null)
  const playerSideRef = useRef<'p1' | 'p2' | null>(null)
  const [battleStatus, setBattleStatus] = useState<'waiting' | 'preparing' | 'countdown' | 'playing'>('waiting')

  const hpInitial = 100
  const hpEnemyInitial = 100
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

  // Вычисляем размер UI элементов относительно высоты экрана
  const scalePercent = window.innerHeight < 1040 ? window.innerHeight / 1040 : 1
  const scaleStyle = { transform: `scale(${scalePercent})` }

  const setPlayerSpriteClass = (color: string) => {
    return color ? styles[`game-page__person-img-player-tablet_${color}`] : ''
  }

  const clearCountdown = () => {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    setCountdownOpen(false)
    setCountdown(null)
  }

  const startCountdown = (seconds: number, endsAt: number, serverNow: number) => {
    if (battleStartedRef.current) return

    clearCountdown()

    const remainingMs = Math.max(0, endsAt - serverNow)
    const localEndsAt = Date.now() + remainingMs

    const updateCountdown = () => {
      const nextCountdown = Math.ceil((localEndsAt - Date.now()) / 1000)

      setCountdown(Math.max(1, Math.min(seconds, nextCountdown)))

      if (nextCountdown <= 1 && countdownIntervalRef.current !== null) {
        window.clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }

    setBattleStatus('countdown')
    setCountdownOpen(true)
    updateCountdown()
    countdownIntervalRef.current = window.setInterval(updateCountdown, 250)
  }

  const startBattle = () => {
    if (battleStartedRef.current) return

    battleStartedRef.current = true
    clearCountdown()
    setBattleStatus('playing')
    togglePause(false)
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

      setPlayerName(state[savedPlayerSide].playerName)
      setEnemyName(state[enemySide].playerName)
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
        clearCountdown()
        battleStartedRef.current = false
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
        setPlayerName(msg.state[mySide].playerName)
        setEnemyName(msg.state[enemySide].playerName)
        setPlayerSkinId(msg.state[mySide].skinId)
        setEnemySkinId(msg.state[enemySide].skinId)

        ws.send(JSON.stringify({
          type: 'player_ready',
          battleId: msg.battleId,
        }))
      }

      if (msg.type === 'match_countdown_started') {
        const seconds = Number(msg.seconds || 10)
        const startsAt = Number(msg.startsAt || Date.now())

        startCountdown(
          seconds,
          Number(msg.endsAt || startsAt + seconds * 1000),
          Number(msg.serverNow || startsAt)
        )
      }

      if (msg.type === 'match_started' || msg.type === 'battle_started') {
        startBattle()
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
        setPlayerName(msg.state[mySide].playerName)
        setEnemyName(msg.state[enemySide].playerName)
        setPlayerSkinId(msg.state[mySide].skinId)
        setEnemySkinId(msg.state[enemySide].skinId)
        setHP(msg.state[mySide].hp)
        setHPEnemy(msg.state[enemySide].hp)
        setPotions(msg.state[mySide].potions)

        if (msg.type === 'state' && msg.state.status === 'countdown') {
          const seconds = Number(msg.state.countdownSeconds || 10)
          const startsAt = Number(msg.state.countdownStartedAt || Date.now())

          startCountdown(
            seconds,
            Number(msg.state.countdownEndsAt || startsAt + seconds * 1000),
            Number(msg.serverNow || startsAt)
          )
        }

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
          setTimeout(() => setStunEnemy(false), STUN_ANIMATION_DELAY)
          soundEnemyStun.play()
          platformApi.incrementStat(STATS.PARRY_PVP)
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
        clearCountdown()

        if (!battleStartedRef.current) {
          battleStartedRef.current = false
          setBattleStatus('waiting')
          togglePause(true)
          return
        }

        handleGameWin(t('game.results.opponentLeft'))
        soundWin.play()
      }
    }

    return () => {
      clearCountdown()
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
    hp >= hpAlarm ? setAlarmPlayer(false) : setAlarmPlayer(true)
    hpEnemy >= hpAlarm ? setAlarmEnemy(false) : setAlarmEnemy(true)
  }, [hp, hpEnemy, hpAlarm])

  const onRestart = (): void => {
    setRestartKey(prevKey => prevKey + 1)
    setScoreSession(0)
    setHP(hpInitial)
    setHPEnemy(hpEnemyInitial)
    setPotions(userPotions)
    setStunEnemy(false)
    setStunPlayer(false)
    setAlarmEnemy(false)
    setAlarmPlayer(false)
    setColorPlayerAttack('')
    setColorPlayerPreAttack('')
    togglePause(true)
  }

  const onContinue = async () => {
    setOpenModalWin(false)
    navigate('/pvp')
  }

  const onGameOver = (): void => {
    setOpenModalLose(false)
    navigate('/pvp')
  }

  const onExit = (): void => {
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

  const handleGameWin = (textWin?: string): void => {
    handlePause()
    setTimeout(() => {
      setResultText(<>{textWin || t('game.results.pvpWin')}</>)
      setOpenModalWin(true)
      soundWin.play()
    }, delayGameEffects + 300)

    platformApi.incrementStat(STATS.WINS_PVP)
    platformApi.incrementStat(STATS.GAMES_PLAYED_PVP)
    unlockAchievementFirstWinPvp()
  }

  const handleGameOver = (): void => {
    handlePause()
    setResultText(<>{t('game.results.pvpLose')}</>)
    setOpenModalLose(true)
    soundLose.play()

    platformApi.incrementStat(STATS.GAMES_PLAYED_PVP)
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
      const attack = Math.floor(currentScore)

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
        setTimeout(() => setStunEnemy(false), STUN_ANIMATION_DELAY)
        soundEnemyStun.play()
      } 
    }

    soundCardSuccess.play()

    platformApi.incrementStat(STATS.CARDS_MATCHED)
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

  const unlockAchievementFirstWinPvp = async (): Promise<void> => {
    const isUnlocked = await platformApi.getAchievement(ACHIEVEMENTS.FIRST_WIN_PVP)
    if (!isUnlocked) {
      await platformApi.unlockAchievement(ACHIEVEMENTS.FIRST_WIN_PVP)
    }
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
              )}></div>
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
            <div className={styles['game-page__person-name']}>{playerName}</div>
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
              )}></div>
              <div className={classNames(
                styles['game-page__person-img-player-arm'],
                { [styles['game-page__person-img-player-arm_active']]: isClickCardEnemy }
              )}></div>
              <div className={classNames(
                styles['game-page__person-img-player-head'],
                { 
                  [styles['game-page__person-img-player-head_stun']]: isStunEnemy,
                  [styles['game-page__person-img-player-head_alarm']]: isAlarmEnemy
                }
              )}></div>
              <div className={classNames(
                styles['game-page__person-img-player-tablet'],
                setPlayerSpriteClass(colorEnemyAttack)
              )}></div>
            </div>
          </div>
          <div className={styles['game-page__person-info']}>
            <div className={styles['game-page__person-name']}>{enemyName}</div>
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
        title={t('pvp.battleTitle')}
        subtitle={t('pvp.exit.subtitle')}
        info={t('pvp.exit.title')}
        isOpened={isOpenModalDefault}
      />
      <ModalDefault
        title={t('pvp.countdown.found')}
        info={(
          <div>
            <div>{t('pvp.countdown.startsIn')}</div>
            <div style={{ fontSize: '72px', lineHeight: 1.1, marginTop: '18px' }}>
              {countdown}
            </div>
          </div>
        )}
        buttonSuccess={t('pvp.countdown.wait')}
        isButtonSuccessDisabled={true}
        isButtonCancel={false}
        onContinue={() => {}}
        isOpened={isCountdownOpen}
      />
    </main>
  )
}
