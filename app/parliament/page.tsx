'use client'
import { useATLAS } from '@/app/hooks/useATLAS'
import Link from 'next/link'

const BRAIN_COLORS: Record<string, string> = {
  fundamentalist:   '#3b82f6',
  technician:       '#22c55e',
  macro_economist:  '#f59e0b',
  risk_officer:     '#ef4444',
  momentum_trader:  '#a855f7',
  contrarian:       '#f97316',
}

function BrainGauge({ name, weight, vote }: {
  name: string; weight: number; vote?: string
}) {
  const color = BRAIN_COLORS[name] || 'var(--atlas-muted)'
  const pct = weight * 100
  const voteColor = vote?.includes('BUY') ? 'var(--atlas-green)'
    : vote?.includes('SELL') || vote?.includes('REDUCE') ? 'var(--atlas-red)'
    : 'var(--atlas-muted)'

  return (
    <div className="atlas-card" style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color, fontSize:10, fontWeight:600,
                       letterSpacing:'.06em', textTransform:'uppercase' }}>
          {name.replace('_', ' ')}
        </span>
        {vote && (
          <span style={{ color: voteColor, fontSize:10 }}>{vote}</span>
        )}
      </div>
      <div style={{ height:6, background:'var(--atlas-border)',
                    borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`,
                      background: color, borderRadius:3,
                      transition:'width .3s ease' }}/>
      </div>
      <div style={{ color:'var(--atlas-text)', fontSize:16,
                    fontWeight:600 }}>
        {pct.toFixed(0)}%
      </div>
    </div>
  )
}

export default function ParliamentPage() {
  const { data, connected, lastUpdate } = useATLAS()
  const { parliament, status } = data

  const verdict = parliament?.verdict || 'HOLD'
  const score   = parliament?.score || 0
  const verdictColor = verdict.includes('BUY') ? 'var(--atlas-green)'
    : verdict.includes('SELL') || verdict.includes('REDUCE') ? 'var(--atlas-red)'
    : 'var(--atlas-muted)'

  const scoreColor = score > 1.0 ? 'var(--atlas-green)'
    : score < -1.0 ? 'var(--atlas-red)'
    : score > 0 ? 'var(--atlas-green)' : 'var(--atlas-red)'

  return (
    <div style={{ minHeight:'100vh' }}>

      <div style={{ padding:16 }}>
        <div style={{ display:'flex', alignItems:'center',
                      gap:16, marginBottom:12 }}>
          <Link href="/" style={{ color:'var(--atlas-muted)',
                                   fontSize:11, textDecoration:'none' }}>
            ← Dashboard
          </Link>
          <span style={{ color:'var(--atlas-text)', fontSize:13,
                         fontWeight:600 }}>Parliament of Brains</span>
        </div>

        {/* Verdict banner */}
        <div className="atlas-card" style={{ marginBottom:12, textAlign:'center' }}>
          <div className="atlas-label" style={{ marginBottom:4 }}>Current Verdict</div>
          <div style={{ fontSize:48, fontWeight:700, color: verdictColor,
                        letterSpacing:'.1em' }}>
            {verdict}
          </div>
          <div style={{ color: scoreColor, fontSize:20,
                        fontWeight:600, marginTop:4 }}>
            Score: {score >= 0 ? '+' : ''}{score.toFixed(2)}
          </div>
          <div className="atlas-label" style={{ marginTop:4 }}>
            Supermajority threshold ±1.5
          </div>
          <div style={{
            height:4, background:'var(--atlas-border)',
            borderRadius:2, marginTop:12, position:'relative', overflow:'hidden'
          }}>
            <div style={{
              position:'absolute', height:'100%',
              width:`${Math.min(Math.abs(score) / 3 * 100, 100)}%`,
              background: verdictColor, borderRadius:2,
              left: score >= 0 ? '50%' : `${50 - Math.min(Math.abs(score) / 3 * 100, 50)}%`,
            }}/>
            <div style={{ position:'absolute', left:'50%', top:0,
                          bottom:0, width:1, background:'var(--atlas-muted)' }}/>
          </div>
        </div>

        {/* Brain weights grid */}
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))',
                      gap:8 }}>
          {Object.entries(parliament?.brain_weights || {}).map(([brain, weight]: [string, unknown]) => (
            <BrainGauge
              key={brain}
              name={brain}
              weight={Number(weight)}
              vote={parliament?.brain_votes?.[brain]}
            />
          ))}
        </div>

        {!parliament && (
          <div style={{ color:'var(--atlas-muted)', textAlign:'center',
                        padding:40, fontSize:12 }}>
            No Parliament data — CerebroEngine not connected
          </div>
        )}
      </div>
    </div>
  )
}
