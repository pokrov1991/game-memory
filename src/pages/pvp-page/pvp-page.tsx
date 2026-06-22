import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/shared/contexts/UserContext'
import { Layout, Navigate, InputField, Button } from '@/shared/components'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import styles from './styles.module.css'

type MatchMode = 'idle' | 'waiting' | 'private-created'

const routes = [
  {
    path: '/',
    name: 'Назад',
    sort: 20,
  },
  {
    path: '/pvp',
    name: 'PvP игра',
    sort: 10,
  },
]

const LOCATIONS = [
  { id: 1, title: 'Каньон отражений' },
  { id: 2, title: 'Белое плато' },
  { id: 3, title: 'Серый мост' },
]

export const PvpPage = () => {
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
  const normalizedPlayerName = playerName.trim() || 'Игрок'

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
        setError(msg.message || 'Ошибка подключения')
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
      setError('Введите код матча')
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
      <Layout title="PvP бой">
        <div className={styles['pvp-page__container']}>

          <div className={styles['pvp-page__navigation']}>
            <Navigate routes={routes} />
          </div>

          <section className={styles['pvp-page__section']}>
            <InputField
              type="text"
              name="playerName"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              onBlur={() => {}}
              error={''}
              icon='/ui/icons/magic.svg'
              label="Введите имя"
            />
          </section>

          <section className={styles['pvp-page__section']}>
            <h2>Выбор локации</h2>

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
                  <span>{location.title}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles['pvp-page__section']}>
            <h2>Случайный матч</h2>
            
            <Button
              type="button"
              onClick={handleFindRandomMatch}
            >
              Создать матч
            </Button>

            {mode === 'waiting' && (
              <p className={styles['pvp-page__status']}>
                Поиск соперника...
              </p>
            )}
          </section>

          <section className={styles['pvp-page__section']}>
            <h2>Игра с другом</h2>

            <Button
              type="button"
              onClick={handleCreatePrivateMatch}
            >
              Создать код
            </Button>

            {createdRoomCode && (
              <div
                className={styles['pvp-page__code']}
                onClick={handleCopy}
              >
                Код матча: <b>{createdRoomCode} <ContentCopyIcon/></b>

                {copied && (
                  <span className={styles['pvp-page__copied']}>
                    Скопировано!
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
                icon='/ui/icons/magic.svg'
                label="Введите код"
              />

              <Button
                type="button"
                onClick={handleJoinPrivateMatch}
              >
                Войти
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