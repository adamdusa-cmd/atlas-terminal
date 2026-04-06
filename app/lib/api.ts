const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://atlas-scheduler-production-a62e.up.railway.app'

async function fetchJSON<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${endpoint}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export const api = {
  risk:       () => fetchJSON('/api/risk'),
  parliament: () => fetchJSON('/api/parliament'),
  portfolio:  () => fetchJSON('/api/portfolio'),
  signals:    () => fetchJSON('/api/signals'),
  surfaces:   () => fetchJSON('/api/surfaces'),
  brief:      () => fetchJSON('/api/brief'),
  macro:      () => fetchJSON('/api/macro'),
  universe:   () => fetchJSON('/api/universe'),
  status:     () => fetchJSON('/api/status'),
}

export const WS_URL = 'wss://atlas-scheduler-production-a62e.up.railway.app/ws/live'
