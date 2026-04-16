const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.atlastrade.net'

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
  tradeHistory:  () => fetchJSON('/api/history/trades'),
  signalHistory: () => fetchJSON('/api/history/signals'),
  riskHistory:   () => fetchJSON('/api/history/risk'),
  alertHistory:  () => fetchJSON('/api/history/alerts'),
  briefHistory:  () => fetchJSON('/api/history/briefs'),
  chat: (message: string, history: any[]) => fetchJSON('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history }) }),
  intelligence: (message: string, history: any[]) => fetchJSON('/api/intelligence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history }) }),
}

export const WS_URL = 'wss://api.atlastrade.net/ws/live'
