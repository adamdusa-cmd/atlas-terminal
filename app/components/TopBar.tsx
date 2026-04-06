'use client'
import type { StatusState } from '@/app/types/atlas'

interface Props { status: StatusState | null; connected: boolean; lastUpdate: string }

export default function TopBar({ status, connected, lastUpdate }: Props) {
  const time = lastUpdate ? new Date(lastUpdate).toLocaleTimeString('en-GB', { hour12: false }) : '--:--:--'
  return (
    <div style={{ background:'var(--atlas-surface)', borderBottom:'1px solid var(--atlas-border)',
                  padding:'8px 16px', display:'flex', alignItems:'center',
                  justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <span style={{ color:'var(--atlas-accent)', fontWeight:700, fontSize:14, letterSpacing:'.1em' }}>ATLAS</span>
        <span className="atlas-label">{status?.mode || 'PAPER'} MODE</span>
        <span className={`atlas-label risk-${status?.risk_level || 'LOW'}`}>RISK: {status?.risk_level || 'LOW'}</span>
        {status?.circuit_breaker && <span style={{ color:'var(--atlas-red)', animation:'pulse 1s infinite', fontSize:11 }}>⚡ CIRCUIT BREAKER</span>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span className="atlas-label">{time}</span>
        <span style={{ width:8, height:8, borderRadius:'50%', background: connected ? 'var(--atlas-green)' : 'var(--atlas-red)', display:'inline-block' }}/>
        <span className="atlas-label">{connected ? 'LIVE' : 'OFFLINE'}</span>
      </div>
    </div>
  )
}
