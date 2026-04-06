'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/app/lib/api'

export function useATLAS() {
  const [data, setData] = useState<any>({
    risk: null, parliament: null, portfolio: null,
    signals: null, surfaces: null, brief: null, status: null,
    universe: null,
  })
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState('')

  const fetchAll = useCallback(async () => {
    try {
      const [risk, parliament, portfolio, signals, surfaces, brief, status, universe] =
        await Promise.all([
          api.risk(), api.parliament(), api.portfolio(),
          api.signals(), api.surfaces(), api.brief(), api.status(),
          api.universe(),
        ])
      if (risk) {
        setData({ risk, parliament, portfolio, signals, surfaces, brief, status, universe })
        setConnected(true)
        setLastUpdate(new Date().toISOString())
      }
    } catch {
      setConnected(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 2000)
    return () => clearInterval(interval)
  }, [fetchAll])

  return { data, connected, lastUpdate }
}
