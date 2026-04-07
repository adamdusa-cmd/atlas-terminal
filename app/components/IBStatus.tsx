'use client'
import type { StatusState } from '@/app/types/atlas'

interface Props { status: StatusState | null }

export default function IBStatus({ status }: Props) {
  const isLive = status?.is_live
  const mode = status?.mode || 'PAPER'
  const daysToLive = Math.max(0, Math.ceil(
    (new Date('2026-04-13').getTime() - Date.now()) / 86400000
  ))

  return (
    <div className="atlas-card" style={{
      display:'flex', alignItems:'center', gap:16,
      background: isLive ? 'rgba(34,197,94,0.1)' : 'var(--atlas-surface)',
      border: `1px solid ${isLive ? 'var(--atlas-green)' : 'var(--atlas-border)'}`,
    }}>
      <div>
        <div className="atlas-label">IB Connection</div>
        <div style={{
          fontSize:16, fontWeight:700,
          color: isLive ? 'var(--atlas-green)' : 'var(--atlas-amber)'
        }}>
          {isLive ? '⚡ LIVE' : `PAPER MODE`}
        </div>
      </div>
      {!isLive && daysToLive > 0 && (
        <div>
          <div className="atlas-label">Live Trading</div>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--atlas-amber)' }}>
            {daysToLive}d until April 13
          </div>
        </div>
      )}
      {!isLive && daysToLive === 0 && (
        <div style={{ color:'var(--atlas-green)', fontSize:12 }}>
          April 13 — set IB_LIVE_MODE=true
        </div>
      )}
      <div style={{ marginLeft:'auto' }}>
        <div className="atlas-label">Mode</div>
        <div className={`atlas-value ${mode === 'LIVE' ? 'positive' : 'info'}`}>{mode}</div>
      </div>
    </div>
  )
}
