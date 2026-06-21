import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/shared/contexts/UserContext'
import styles from './styles.module.css'

type MatchMode = 'idle' | 'waiting' | 'private-created'

const SKINS = [
  { id: 1, title: 'Существо 1' },
  { id: 2, title: 'Существо 2' },
  { id: 3, title: 'Существо 3' },
  { id: 4, title: 'Существо 4' },
]

export const PvpPage = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  const socketRef = useRef<WebSocket | null>(null)

  const [selectedSkinId, setSelectedSkinId] = useState(1)
  const [roomCode, setRoomCode] = useState('')
  const [createdRoomCode, setCreatedRoomCode] = useState('')
  const [mode, setMode] = useState<MatchMode>('idle')
  const [error, setError] = useState('')

  const playerId = useMemo(() => {
    return String(user.id || crypto.randomUUID())
  }, [user.id])

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

    console.log(playerId, selectedSkinId)

    sendWhenOpen({
      type: 'find_match',
      playerId,
      skinId: selectedSkinId,
    })
  }

  const handleCreatePrivateMatch = () => {
    setError('')

    sendWhenOpen({
      type: 'create_private_match',
      playerId,
      skinId: selectedSkinId,
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
      skinId: selectedSkinId,
      roomCode,
    })
  }

  return (
    <main className={styles['pvp-lobby']}>
      <div className={styles['pvp-lobby__panel']}>
        <h1 className={styles['pvp-lobby__title']}>
          PvP бой
        </h1>

        <section className={styles['pvp-lobby__section']}>
          <h2>Выбор скина</h2>

          <div className={styles['pvp-lobby__skins']}>
            {SKINS.map((skin) => (
              <button
                key={skin.id}
                type="button"
                onClick={() => setSelectedSkinId(skin.id)}
                className={
                  selectedSkinId === skin.id
                    ? styles['pvp-lobby__skin_active']
                    : styles['pvp-lobby__skin']
                }
              >
                <div
                  className={[
                    styles['pvp-lobby__skin-img'],
                    styles[`pvp-lobby__skin-img_${skin.id}`],
                  ].join(' ')}
                />
                <span>{skin.title}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles['pvp-lobby__section']}>
          <h2>Случайный матч</h2>

          <button
            type="button"
            onClick={handleFindRandomMatch}
            className={styles['pvp-lobby__button']}
          >
            Создать матч
          </button>

          {mode === 'waiting' && (
            <p className={styles['pvp-lobby__status']}>
              Поиск соперника...
            </p>
          )}
        </section>

        <section className={styles['pvp-lobby__section']}>
          <h2>Игра с другом</h2>

          <button
            type="button"
            onClick={handleCreatePrivateMatch}
            className={styles['pvp-lobby__button']}
          >
            Создать матч по коду
          </button>

          {createdRoomCode && (
            <div className={styles['pvp-lobby__code']}>
              Код матча: <b>{createdRoomCode}</b>
            </div>
          )}

          <div className={styles['pvp-lobby__join']}>
            <input
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              placeholder="Введите код"
              className={styles['pvp-lobby__input']}
            />

            <button
              type="button"
              onClick={handleJoinPrivateMatch}
              className={styles['pvp-lobby__button']}
            >
              Войти
            </button>
          </div>
        </section>

        {error && (
          <p className={styles['pvp-lobby__error']}>
            {error}
          </p>
        )}
      </div>
    </main>
  )
}