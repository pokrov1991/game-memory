import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/shared/contexts/UserContext'
import { Layout, Navigate, InputField, Button } from '@/shared/components'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

type MatchMode = 'idle' | 'waiting' | 'private-created'

const LOCATIONS = [
  { id: 1, titleKey: 'levels.battle.1.title' },
  { id: 2, titleKey: 'levels.battle.2.title' },
  { id: 3, titleKey: 'levels.battle.3.title' },
]

export const PvpPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useUser()

  const socketRef = useRef<WebSocket | null>(null)

  const [playerName, setPlayerName] = useState(user.name)
  const [selectedSkinId, setSelectedSkinId] = useState(1)
  const [selectedLocationId, setSelectedLocationId] = useState(1)
  const [roomCode, setRoomCode] = useState('')
  const [createdRoomCode, setCreatedRoomCode] = useState('')
  const [mode, setMode] = useState<MatchMode>('idle')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const playerId = useMemo(() => {
    return String(user.id || crypto.randomUUID())
  }, [user.id])
  const normalizedPlayerName = playerName.trim() || t('game.player')
  const routes = [
    {
      path: '/',
      name: t('common.back'),
      sort: 20,
    },
    {
      path: '/pvp',
      name: t('mainMenu.pvpGame'),
      sort: 10,
    },
  ]

  const connect = () => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      return socketRef.current
    }

    const ws = new WebSocket('wss://orion7.skybug.ru/ws')
    socketRef.current = ws

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      if (msg.type === 'waiting') {
        setMode('waiting')
      }

      if (msg.type === 'private_match_created') {
        setCreatedRoomCode(msg.roomCode)
        setMode('private-created')
      }

      if (msg.type === 'match_found') {
        sessionStorage.setItem('pvpBattleId', msg.battleId)
        sessionStorage.setItem('pvpPlayerSide', msg.you)
        sessionStorage.setItem('pvpSelectedSkinId', String(selectedSkinId))
        sessionStorage.setItem('pvpLocationId', String(msg.state.locationId))
        sessionStorage.setItem('pvpBattleState', JSON.stringify(msg.state))

        navigate('/game-pvp')
      }

      if (msg.type === 'error') {
        setError(msg.message || t('pvp.statusError'))
      }
    }

    ws.onclose = () => {
      socketRef.current = null
    }

    return ws
  }

  const sendWhenOpen = (data: unknown) => {
    const ws = connect()

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
      return
    }

    ws.onopen = () => {
      ws.send(JSON.stringify(data))
    }
  }

  const handleFindRandomMatch = () => {
    setError('')

    sendWhenOpen({
      type: 'find_match',
      playerId,
      playerName: normalizedPlayerName,
      skinId: selectedSkinId,
      locationId: selectedLocationId,
    })
  }

  const handleCreatePrivateMatch = () => {
    setError('')

    sendWhenOpen({
      type: 'create_private_match',
      playerId,
      playerName: normalizedPlayerName,
      skinId: selectedSkinId,
      locationId: selectedLocationId,
    })
  }

  const handleJoinPrivateMatch = () => {
    setError('')

    if (!roomCode.trim()) {
      setError(t('pvp.roomCodeRequired'))
      return
    }

    sendWhenOpen({
      type: 'join_private_match',
      playerId,
      playerName: normalizedPlayerName,
      skinId: selectedSkinId,
      locationId: selectedLocationId,
      roomCode,
    })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(createdRoomCode)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)

      return true
    } catch {
      try {
        const textarea = document.createElement('textarea')

        textarea.value = createdRoomCode
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'

        document.body.appendChild(textarea)

        textarea.focus()
        textarea.select()

        const success = document.execCommand('copy')

        document.body.removeChild(textarea)

        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)

        return success
      } catch {
        return false
      }
    }
  }

  return (
    <main className={styles['pvp-page']}>
      <Layout title={t('pvp.battleTitle')}>
        <div className={styles['pvp-page__container']}>

          <div className={styles['pvp-page__navigation']}>
            <Navigate routes={routes} />
          </div>

          {/* <section className={styles['pvp-page__section']}>
            <InputField
              type="text"
              name="playerName"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              onBlur={() => {}}
              error={''}
              icon='ui/icons/magic.svg'
              label="Введите имя"
            />
          </section> */}

          <section className={styles['pvp-page__section']}>
            <h2>{t('pvp.locationSelect')}</h2>

            <div className={styles['pvp-page__locations']}>
              {LOCATIONS.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => setSelectedLocationId(location.id)}
                  className={
                    selectedLocationId === location.id
                      ? styles['pvp-page__location_active']
                      : styles['pvp-page__location']
                  }
                >
                  <div
                    className={[
                      styles['pvp-page__location-img'],
                      styles[`pvp-page__location-img_${location.id}`],
                    ].join(' ')}
                  />
                  <span>{t(location.titleKey)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles['pvp-page__section']}>
            <h2>{t('pvp.random')}</h2>
            
            <Button
              type="button"
              onClick={handleFindRandomMatch}
            >
              {t('pvp.startMatch')}
            </Button>

            {mode === 'waiting' && (
              <p className={styles['pvp-page__status']}>
                {t('pvp.statusWaiting')}
              </p>
            )}
          </section>

          <section className={styles['pvp-page__section']}>
            <h2>{t('pvp.friend')}</h2>

            <Button
              type="button"
              onClick={handleCreatePrivateMatch}
            >
              {t('pvp.privateCode')}
            </Button>

            {createdRoomCode && (
              <div
                className={styles['pvp-page__code']}
                onClick={handleCopy}
              >
                {t('pvp.matchCode')}: <b>{createdRoomCode} <ContentCopyIcon/></b>

                {copied && (
                  <span className={styles['pvp-page__copied']}>
                    {t('pvp.statusCopied')}
                  </span>
                )}
              </div>
            )}

            <div className={styles['pvp-page__join']}>

              <InputField
                type="text"
                name="roomCode"
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                onBlur={() => {}}
                error={''}
                icon='ui/icons/spirit.svg'
                label={t('pvp.roomCode')}
              />

              <Button
                type="button"
                onClick={handleJoinPrivateMatch}
              >
                {t('pvp.join')}
              </Button>
            </div>
          </section>

          {error && (
            <p className={styles['pvp-page__error']}>
              {error}
            </p>
          )}
        </div>
      </Layout>
    </main>
  )
}
