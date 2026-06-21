const { WebSocketServer } = require('ws')
const crypto = require('crypto')

const PORT = 8080
const WS_PATH = '/ws'

const PLAYER_INITIAL_HP = 100
const POTION_HEAL = 25
const INITIAL_POTIONS = 3

const wss = new WebSocketServer({
  port: PORT,
  path: WS_PATH,
})

let waitingPlayer = null
const battles = new Map()
const privateRooms = new Map()

const createRoomCode = () => {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

const send = (ws, data) => {
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data))
  }
}

const broadcast = (battle, data) => {
  send(battle.sockets.p1, data)
  send(battle.sockets.p2, data)
}

const createPlayer = (playerId, skinId = 1) => ({
  playerId,
  skinId,
  hp: PLAYER_INITIAL_HP,
  hpInitial: PLAYER_INITIAL_HP,
  score: 0,
  lastScore: 0,
  potions: INITIAL_POTIONS,
  ready: false,

  colorPreAttack: '',
  colorAttack: '',
  colorParry: '',

  connected: true,
})

const createBattle = (p1Socket, p1Id, p1SkinId, p2Socket, p2Id, p2SkinId, locationId = 1) => {
  const battleId = crypto.randomUUID()

  return {
    state: {
      battleId,
      locationId,
      status: 'preparing',
      p1: createPlayer(p1Id, p1SkinId),
      p2: createPlayer(p2Id, p2SkinId),
      createdAt: Date.now(),
    },
    sockets: {
      p1: p1Socket,
      p2: p2Socket,
    },
  }
}

const getOpponentSide = (side) => {
  return side === 'p1' ? 'p2' : 'p1'
}

const getSideBySocket = (battle, ws) => {
  if (battle.sockets.p1 === ws) return 'p1'
  if (battle.sockets.p2 === ws) return 'p2'
  return null
}

const findBattleBySocket = (ws) => {
  for (const battle of battles.values()) {
    if (battle.sockets.p1 === ws || battle.sockets.p2 === ws) {
      return battle
    }
  }

  return null
}

const finishBattle = (battle, loserSide, reason = 'hp_zero') => {
  if (!battle || battle.state.status === 'finished') return

  const winnerSide = getOpponentSide(loserSide)

  battle.state.status = 'finished'
  battle.state.finishedAt = Date.now()
  battle.state.finishReason = reason
  battle.state.winner = winnerSide
  battle.state.loser = loserSide

  send(battle.sockets[winnerSide], {
    type: 'win',
    reason,
    state: battle.state,
  })

  send(battle.sockets[loserSide], {
    type: 'lose',
    reason,
    state: battle.state,
  })

  battles.delete(battle.state.battleId)
}

const safeParse = (raw) => {
  try {
    return JSON.parse(raw.toString())
  } catch {
    return null
  }
}

const sendState = (battle) => {
  broadcast(battle, {
    type: 'state',
    state: battle.state,
  })
}

wss.on('connection', (ws) => {
  console.log('Player connected')

  send(ws, {
    type: 'connected',
    message: 'Connected to Orion7 battle server',
  })

  ws.on('message', (raw) => {
    const msg = safeParse(raw)

    if (!msg || !msg.type) {
      send(ws, {
        type: 'error',
        message: 'Invalid message',
      })
      return
    }

    if (msg.type === 'find_match') {
      const playerId = String(msg.playerId || crypto.randomUUID())
      const locationId = Number(msg.locationId || 1)
      const skinId = Number(msg.skinId || 1)

      if (!waitingPlayer) {
        waitingPlayer = {
          ws,
          playerId,
          skinId,
          locationId,
          createdAt: Date.now(),
        }

        send(ws, {
          type: 'waiting',
          message: 'Waiting for opponent',
        })

        console.log('Player waiting:', playerId)
        return
      }

      if (waitingPlayer.ws === ws) {
        send(ws, {
          type: 'waiting',
          message: 'Already waiting',
        })
        return
      }

      const battle = createBattle(
        waitingPlayer.ws,
        waitingPlayer.playerId,
        waitingPlayer.skinId,
        ws,
        playerId,
        skinId,
        waitingPlayer.locationId,
      )

      battles.set(battle.state.battleId, battle)

      send(battle.sockets.p1, {
        type: 'match_found',
        battleId: battle.state.battleId,
        you: 'p1',
        state: battle.state,
      })

      send(battle.sockets.p2, {
        type: 'match_found',
        battleId: battle.state.battleId,
        you: 'p2',
        state: battle.state,
      })

      console.log('Battle created:', battle.state.battleId)

      waitingPlayer = null
      return
    }

    if (msg.type === 'create_private_match') {
      const playerId = String(msg.playerId || crypto.randomUUID())
      const locationId = Number(msg.locationId || 1)
      const skinId = Number(msg.skinId || 1)
      const roomCode = createRoomCode()

      privateRooms.set(roomCode, {
        ws,
        playerId,
        skinId,
        locationId,
        createdAt: Date.now(),
      })

      send(ws, {
        type: 'private_match_created',
        roomCode,
        message: 'Private match created',
      })

      console.log('Private room created:', roomCode)

      return
    }

    if (msg.type === 'join_private_match') {
      const playerId = String(msg.playerId || crypto.randomUUID())
      const skinId = Number(msg.skinId || 1)
      const roomCode = String(msg.roomCode || '').toUpperCase().trim()

      const room = privateRooms.get(roomCode)

      if (!room) {
        send(ws, {
          type: 'error',
          message: 'Room not found',
        })
        return
      }

      if (room.ws === ws) {
        send(ws, {
          type: 'error',
          message: 'You cannot join your own room',
        })
        return
      }

      const battle = createBattle(
        room.ws,
        room.playerId,
        room.skinId,
        ws,
        playerId,
        skinId,
        room.locationId,
      )

      battles.set(battle.state.battleId, battle)
      privateRooms.delete(roomCode)

      send(battle.sockets.p1, {
        type: 'match_found',
        battleId: battle.state.battleId,
        you: 'p1',
        roomCode,
        state: battle.state,
      })

      send(battle.sockets.p2, {
        type: 'match_found',
        battleId: battle.state.battleId,
        you: 'p2',
        roomCode,
        state: battle.state,
      })

      console.log('Private battle created:', battle.state.battleId)

      return
    }

    if (!msg.battleId) {
      send(ws, {
        type: 'error',
        message: 'battleId is required',
      })
      return
    }

    const battle = battles.get(msg.battleId)

    if (!battle) {
      send(ws, {
        type: 'error',
        message: 'Battle not found',
      })
      return
    }

    if (msg.type === 'join_battle_socket') {
      const requestedSide = msg.side

      if (requestedSide !== 'p1' && requestedSide !== 'p2') {
        send(ws, {
          type: 'error',
          message: 'Invalid side',
        })
        return
      }

      battle.sockets[requestedSide] = ws
      battle.state[requestedSide].connected = true

      send(ws, {
        type: 'joined_battle_socket',
        battleId: msg.battleId,
        you: requestedSide,
        state: battle.state,
      })

      sendState(battle)

      return
    }

    const side = getSideBySocket(battle, ws)

    if (!side) {
      send(ws, {
        type: 'error',
        message: 'You are not in this battle',
      })
      return
    }

    const opponentSide = getOpponentSide(side)
    const player = battle.state[side]
    const opponent = battle.state[opponentSide]

    if (msg.type === 'player_ready') {
      player.ready = true

      if (battle.state.p1.ready && battle.state.p2.ready) {
        battle.state.status = 'playing'

        broadcast(battle, {
          type: 'battle_started',
          state: battle.state,
        })
      } else {
        sendState(battle)
      }

      return
    }

    if (battle.state.status !== 'playing') {
      send(ws, {
        type: 'error',
        message: 'Battle is not playing',
      })
      return
    }

    if (msg.type === 'set_attack_color') {
      const color = String(msg.color || '')
      const countFlipped = Number(msg.countFlipped || 0)

      if (countFlipped === 1) {
        player.colorPreAttack = color
        player.colorAttack = ''
      }

      if (countFlipped >= 2) {
        player.colorPreAttack = ''
        player.colorAttack = color
      }

      broadcast(battle, {
        type: 'enemy_attack_color',
        from: side,
        to: opponentSide,
        colorPreAttack: player.colorPreAttack,
        colorAttack: player.colorAttack,
        state: battle.state,
      })

      return
    }

    if (msg.type === 'set_score') {
      player.score = Math.max(0, Number(msg.score || 0))
      sendState(battle)
      return
    }

    if (msg.type === 'attack') {
      const damage = Math.max(0, Number(msg.damage || 0))
      const colorParry = String(msg.colorParry || '')

      player.colorParry = colorParry

      const isStun =
        colorParry &&
        opponent.colorPreAttack &&
        colorParry === opponent.colorPreAttack

      if (isStun) {
        opponent.colorPreAttack = ''
        opponent.colorAttack = ''

        broadcast(battle, {
          type: 'stun_success',
          from: side,
          target: opponentSide,
          color: colorParry,
        })
      }

      opponent.hp = Math.max(0, opponent.hp - damage)

      broadcast(battle, {
        type: 'attack_result',
        from: side,
        target: opponentSide,
        damage,
        rawDamage: damage,
        stunned: isStun,
        state: battle.state,
      })

      if (opponent.hp <= 0) {
        finishBattle(battle, opponentSide)
      }

      return
    }

    if (msg.type === 'use_potion') {
      if (player.potions <= 0) {
        send(ws, {
          type: 'error',
          message: 'No potions left',
        })
        return
      }

      player.potions -= 1
      player.hp = Math.min(player.hpInitial, player.hp + POTION_HEAL)

      broadcast(battle, {
        type: 'potion_used',
        side,
        heal: POTION_HEAL,
        state: battle.state,
      })

      return
    }

    if (msg.type === 'leave') {
      finishBattle(battle, side, 'leave')
      return
    }

    send(ws, {
      type: 'error',
      message: `Unknown message type: ${msg.type}`,
    })
  })

  ws.on('close', () => {
    console.log('Player disconnected')

    if (waitingPlayer?.ws === ws) {
      waitingPlayer = null
      return
    }

    const battle = findBattleBySocket(ws)
    if (!battle) return

    const side = getSideBySocket(battle, ws)
    if (!side) return

    const opponentSide = getOpponentSide(side)

    battle.state[side].connected = false

    send(battle.sockets[opponentSide], {
      type: 'opponent_left',
      state: battle.state,
    })

    battles.delete(battle.state.battleId)
  })
})

console.log(`Battle WebSocket server started on port ${PORT}`)
