'use client'
import { useATLAS } from '@/app/hooks/useATLAS'
import TopBar from '@/app/components/TopBar'
import Link from 'next/link'

function Gauge({ label, value, min, max, unit, warnAbove, warnBelow }: {
  label: string; value: number; min: number; max: number
  unit?: string; warnAbove?: number; warnBelow?: number
}) {
  const pct = Math.min(Math.max((value - min) / (max - min) * 100, 0), 100)
  const isWarn = (warnAbove !== undefined && value > warnAbove) ||
                 (warnBelow !== undefined && value < warnBelow)
  const color = isWarn ? 'var(--atlas-red)' : 'var(--atlas-green)'

  return (
    <div className="atlas-card">
      <div className="atlas-label" style={{ marginBottom:6 }}>{label}</div>
      <div style={{ height:8, background:'var(--atlas-border)',
                    borderRadius:4, overflow:'hidden', marginBottom:6 }}>
        <div style={{ height:'100%', width:`${pct}%`,
                      background: color, borderRadius:4,
                      transition:'width .4s ease' }}/>
      </div>
      <div style={{ fontSize:22, fontWeight:700, color }}>
        {unit === '%' ? `${(value * 100).toFixed(1)}%`
         : unit === 'raw' ? value.toFixed(3)
         : value.toFixed(3)}
      </div>
      <div className="atlas-label" style={{ marginTop:2 }}>
        {min} — {max}
      </div>
    </div>
  )
}

function RiskMatrix({ G, VPIN, entropy }: {
  G: number; VPIN: number; entropy: number
}) {
  const overall = (G * 0.5 + VPIN * 0.3 + entropy * 0.2)
  const color = overall > 0.7 ? 'var(--atlas-red)'
    : overall > 0.45 ? 'var(--atlas-amber)'
    : 'var(--atlas-green)'

  return (
    <div className="atlas-card">
      <div className="atlas-label" style={{ marginBottom:8 }}>Risk Input Matrix</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
        {[
          { label:'G Value', value:G, warn:0.70 },
          { label:'VPIN', value:VPIN, warn:0.65 },
          { label:'Entropy', value:entropy, warn:0.70 },
        ].map(({ label, value, warn }) => (
          <div key={label} style={{ textAlign:'center' }}>
            <div className="atlas-label">{label}</div>
            <div style={{
              fontSize:20, fontWeight:700,
              color: value > warn ? 'var(--atlas-red)' : 'var(--atlas-green)'
            }}>
              {value.toFixed(3)}
            </div>
            <div style={{ height:4, background:'var(--atlas-border)',
                          borderRadius:2, marginTop:4, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${value * 100}%`,
                            background: value > warn ? 'var(--atlas-red)' : 'var(--atlas-green)',
                            borderRadius:2 }}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:12, textAlign:'center' }}>
        <div className="atlas-label">Composite Risk</div>
        <div style={{ fontSize:28, fontWeight:700, color }}>
          {(overall * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  )
}

export default function SurfacesPage() {
  const { data, connected, lastUpdate } = useATLAS()
  const { surfaces, risk, status } = data

  const G        = risk?.G || 0
  const VPIN     = risk?.VPIN || 0
  const entropy  = risk?.entropy || 0
  const posScale = surfaces?.position_scale || risk?.position_scale || 0.8
  const stop     = surfaces?.stop_pct || risk?.stop_pct || 0.025
  const cash     = surfaces?.cash_fraction || risk?.cash_fraction || 0.12

  return (
    <div style={{ minHeight:'100vh' }}>
      <TopBar status={status} connected={connected} lastUpdate={lastUpdate} />
      <div style={{ padding:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
          <Link href="/" style={{ color:'var(--atlas-muted)', fontSize:11, textDecoration:'none' }}>
            ← Dashboard
          </Link>
          <span style={{ color:'var(--atlas-text)', fontSize:13, fontWeight:600 }}>
            Water Philosophy Surfaces
          </span>
          <span className={`atlas-label risk-${risk?.risk_level || 'LOW'}`}>
            {risk?.risk_level || 'LOW'}
          </span>
        </div>

        <RiskMatrix G={G} VPIN={VPIN} entropy={entropy} />

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))',
                      gap:8, marginTop:8 }}>
          <Gauge label="Position Scale" value={posScale}
                 min={0} max={1} unit="%" warnBelow={0.3} />
          <Gauge label="Cash Buffer" value={cash}
                 min={0.05} max={0.60} unit="%" warnAbove={0.40} />
          <Gauge label="Stop Loss" value={stop}
                 min={0.01} max={0.12} unit="%" warnAbove={0.07} />
          <Gauge label="Equity Fraction" value={1 - cash}
                 min={0.40} max={0.95} unit="%" warnBelow={0.50} />
        </div>

        <div className="atlas-card" style={{ marginTop:8 }}>
          <div className="atlas-label" style={{ marginBottom:8 }}>Water Philosophy — Core Principle</div>
          <div style={{ color:'var(--atlas-muted)', fontSize:11, lineHeight:1.6 }}>
            No discrete thresholds. No mode switching. All four parameters
            (position scale, cash buffer, stop loss, brain weights) are continuous
            smooth functions of current market conditions. The system adapts like
            water — without cliff edges.
          </div>
        </div>
      </div>
    </div>
  )
}
