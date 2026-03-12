import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import type { WSMessage } from '../types'

export function useWebSocket(
  sessionId: string | null,
  onMessage: (msg: WSMessage) => void,
) {
  const ws = useRef<WebSocket | null>(null)
  const token = useAuthStore((s) => s.accessToken)

  const connect = useCallback(() => {
    if (!sessionId || !token) return
    const url = `ws://localhost:8000/ws/${sessionId}?token=${token}`
    ws.current = new WebSocket(url)
    ws.current.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data) as WSMessage) } catch { /* ignore */ }
    }
    ws.current.onclose = () => setTimeout(connect, 3000)
  }, [sessionId, token, onMessage])

  useEffect(() => {
    connect()
    return () => { ws.current?.close() }
  }, [connect])

  const send = useCallback((msg: WSMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg))
    }
  }, [])

  return { send }
}
