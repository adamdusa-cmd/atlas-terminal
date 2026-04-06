'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { api, WS_URL } from '@/app/lib/api'
import type { ATLASSnapshot } from '@/app/types/atlas'

export function useATLAS() {
  const [data, setData] = useState<any>({
    risk: null, parliament: null, portfolio: null,
    signals: null, surfaces: null, brief: null, status: null,
    universe: null,
  })
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState('')
  const wsRef = useRef<WebSocket | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchAll = useCallback(async () => {
    const [risk, parliament, portfolio, signals, surfaces, brief, status, universe] =
      await Promise.all([
        api.risk(), api.parliament(), api.portfolio(),
        api.signals(), api.surfaces(), api.brief(), api.status(),
        api.universe(),
      ])
    setData({ risk, parliament, portfolio, signals, surfaces, brief, status, universe })
    setLastUpdate(new Date().toISOString())
  }, [])

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL)
        wsRef.current = ws
        ws.onopen = () => { setConnected(true); fetchAll() }
        ws.onmessage = () => { fetchAll() }
        ws.onclose = () => { setConnected(false); setTimeout(connect, 3000) }
        ws.onerror = () => { ws.close() }
      } catch { setConnected(false); setTimeout(connect, 3000) }
    }
    connect()
    pollRef.current = setInterval(fetchAll, 2000)
    fetchAll()
    return () => {
      wsRef.current?.close()
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchAll])

  return { data, connected, lastUpdate }
}
