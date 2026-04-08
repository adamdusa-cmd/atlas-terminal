'use client'
import { useATLAS } from '@/app/hooks/useATLAS'
import Link from 'next/link'

function SignalBar({ name, value }: { name: string; value: number }) {
  const pct = Math.abs(value) * 100
  const color = value > 0.1 ? 'var(--atlas-green)' : value < -0.1 ? 'var(--atlas-red)' : 'var(--atlas-muted)'
  const side = value >= 0 ? 'left' : 'right'

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'3px 0',
                  borderBottom:'1px solid var(--atlas-border)' }}>
      <div style={{ width:140, color:'var(--atlas-muted)', fontSize:10,
                    textAlign:'right', flexShrink:0 }}>
        {name}
      </div>
      <div style={{ flex:1, height:16, background:'var(--atlas-border)',
                    borderRadius:2, position:'relative', overflow:'hidden' }}>
        <div style={{
          position:'absolute',
          height:'100%',
          width:`${pct}%`,
          background: color,
          borderRadius:2,
          left: side === 'left' ? '50%' : `${50 - pct}%`,
        }}/>
        <div style={{
          position:'absolute', left:'50%', top:0, bottom:0,
          width:1, background:'var(--atlas-muted)',
        }}/>
      </div>
      <div style={{
        width:52, textAlign:'right', fontSize:11, flexShrink:0,
        color,
      }}>
        {value >= 0 ? '+' : ''}{value.toFixed(3)}
      </div>
    </div>
  )
}

function SignalGroup({ title, signals, color }: {
  title: string
  signals: Record<string, number>
  color: string
}) {
  const entries = Object.entries(signals)
  if (entries.length === 0) return null

  return (
    <div className="atlas-card" style={{ marginBottom:8 }}>
      <div style={{ color, fontSize:11, fontWeight:600,
                    letterSpacing:'.08em', marginBottom:8 }}>
        {title}
      </div>
      {entries.map(([name, value]) => (
        <SignalBar key={name} name={name} value={Number(value)} />
      ))}
    </div>
  )
}

export default function SignalsPage() {
  const { data, connected, lastUpdate } = useATLAS()
  const { signals, status } = data

  const avg5a = signals?.layer_5a
    ? Object.values(signals.layer_5a).reduce((a,b) => a + Number(b), 0) /
      Math.max(Object.keys(signals.layer_5a).length, 1)
    : 0

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
                         fontWeight:600 }}>Signal Layers</span>
          <span style={{ color:'var(--atlas-muted)', fontSize:11 }}>
            5A avg: {avg5a >= 0 ? '+' : ''}{avg5a.toFixed(3)}
          </span>
        </div>

        <SignalGroup
          title="Layer 5A — Active Signal Nodes"
          signals={signals?.layer_5a || {}}
          color="var(--atlas-accent)"
        />
        <SignalGroup
          title="Layer 5B — Intelligence Nodes"
          signals={signals?.layer_5b || {}}
          color="var(--atlas-green)"
        />
        <SignalGroup
          title="Layer 5C — Market Structure Alpha"
          signals={signals?.layer_5c || {}}
          color="var(--atlas-amber)"
        />

        {!signals?.layer_5a && (
          <div style={{ color:'var(--atlas-muted)', textAlign:'center',
                        padding:40, fontSize:12 }}>
            No signal data — CerebroEngine not connected
          </div>
        )}
      </div>
    </div>
  )
}
