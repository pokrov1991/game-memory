import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface EventHandlers {
  [event: string]: (...args: any[]) => void
}

interface UseWebSocketReturn {
  subscribe: (handlers: EventHandlers) => void
  emit: (event: string, ...args: any[]) => void
}

export const useWebSocket = (
  serverUrl: string,
  roomHash: string,
  userName: string
): UseWebSocketReturn => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    socketRef.current = io(serverUrl)
    socketRef.current.emit("join-room", roomHash, userName)

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [serverUrl, roomHash, userName])

  const subscribe = useCallback((handlers: EventHandlers) => {
    if (!socketRef.current) return

    Object.entries(handlers).forEach(([event, callback]) => {
      socketRef.current!.on(event, callback)
    })
  }, [])

  const emit = useCallback((event: string, ...args: any[]) => {
    
    if (!socketRef.current) return
    socketRef.current.emit(event, ...args)
  }, [])

  return {
    subscribe,
    emit
  }
} 