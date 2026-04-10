'use client'
import { useState, useEffect } from 'react'
import { useATLAS } from '@/app/hooks/useATLAS'
import Link from 'next/link'

export default function DashboardPage() {
  const { data, connected, lastUpdate } = useATLAS()
  const [scAlloc, setSCAlloc] = useState<any>(null)

  useEffect(() => {
    const fetchSC = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/supreme-commander`)
        const d   = await res.json()
        setSCAlloc(d.allocation)
      } catch {}
    }
    fetchSC()
    const iv = setInterval(fetchSC, 30000)
    return () => clearInterval(iv)
  }, [])

  const status = data?.status
  const risk = data?.risk
  const parliament = data?.parliament
  const portfolio = data?.portfolio
  const brainWeights = data?.brain_weights || {}
  const positions = data?.positions || []

  return (
    <div style={{ padding: 16 }}>
      {/* Row 1 — Risk */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px,1fr))', gap:8, marginBottom:8 }}>
        {[
          { label:'Risk Level', value: risk?.level ?? '--', color: `risk-${risk?.level}` },
          { label:'G Value', value: risk?.G?.toFixed(3) ?? '--' },
          { label:'VPIN', value: risk?.VPIN?.toFixed(3) ?? '--' },
          { label:'Entropy', value: risk?.entropy?.toFixed(3) ?? '--' },
          { label:'Pos Scale', value: risk?.position_scale ? `${(risk.position_scale*100).toFixed(0)}%` : '--' },
          { label:'Cash Buffer', value: risk?.cash_fraction ? `${(risk.cash_fraction*100).toFixed(0)}%` : '--' },
          { label:'Stop %', value: risk?.stop_loss_pct ? `${(risk.stop_loss_pct*100).toFixed(2)}%` : '--' },
        ].map(c => (
          <div key={c.label} className="atlas-card">
            <div className="atlas-label">{c.label}</div>
            <div className={`atlas-value ${c.color||''}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Row 2 — Parliament */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px,1fr))', gap:8, marginBottom:8 }}>
        <div className="atlas-card">
          <div className="atlas-label">Parliament</div>
          <div className="atlas-value positive">{parliament?.verdict ?? '--'}</div>
        </div>
        <div className="atlas-card">
          <div className="atlas-label">Score</div>
          <div className="atlas-value">{parliament?.score?.toFixed(2) ?? '--'}</div>
        </div>
        {Object.entries(brainWeights).map(([brain, weight]: [string, any]) => (
          <div key={brain} className="atlas-card">
            <div className="atlas-label">{brain}</div>
            <div className="atlas-value">{typeof weight === 'number' ? `${(weight*100).toFixed(0)}%` : '--'}</div>
          </div>
        ))}
      </div>

      {/* Row 3 — Portfolio */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px,1fr))', gap:8, marginBottom:8 }}>
        {[
          { label:'Total Equity', value: portfolio?.total_equity ? `€${portfolio.total_equity.toLocaleString()}` : '--' },
          { label:'Daily P&L', value: portfolio?.daily_pnl_pct ? `${(portfolio.daily_pnl_pct*100).toFixed(2)}%` : '--', color: (portfolio?.daily_pnl_pct ?? 0) >= 0 ? 'positive' : 'negative' },
          { label:'Cash', value: portfolio?.cash ? `€${portfolio.cash.toLocaleString()}` : '--' },
          { label:'Drawdown', value: portfolio?.drawdown ? `${(portfolio.drawdown*100).toFixed(2)}%` : '--', color:'negative' },
          { label:'Positions', value: portfolio?.open_positions ?? '--' },
          { label:'Mode', value: portfolio?.mode ?? 'PAPER', color:'info' },
        ].map(c => (
          <div key={c.label} className="atlas-card">
            <div className="atlas-label">{c.label}</div>
            <div className={`atlas-value ${c.color||''}`}>{String(c.value)}</div>
          </div>
        ))}
      </div>

      {/* Supreme Commander */}
      {scAlloc && (
        <div className="atlas-card" style={{ marginBottom:8 }}>
          <div className="atlas-label" style={{ marginBottom:8 }}>Supreme Commander — System Allocation</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[
              { label:'ATLAS Equities',    value: scAlloc.equities,    color:'var(--atlas-accent-light)' },
              { label:'ATLAS Macro',       value: scAlloc.macro,       color:'var(--atlas-amber)' },
              { label:'ATLAS Commodities', value: scAlloc.commodities, color:'var(--atlas-green)' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:700, color:s.color }}>
                  {((s.value||0)*100).toFixed(0)}%
                </div>
                <div className="atlas-label">{s.label}</div>
                <div style={{ height:3, background:'var(--atlas-bg3)', borderRadius:2, marginTop:4 }}>
                  <div style={{ height:3, borderRadius:2, background:s.color, width:`${(s.value||0)*100}%`, transition:'width 0.5s' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positions table */}
      {positions.length > 0 && (
        <div className="atlas-card">
          <div className="atlas-label" style={{ marginBottom:8 }}>Open Positions</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--atlas-border)' }}>
                {['Symbol','Region','Size','Entry','Current','P&L'].map(h => (
                  <th key={h} className="atlas-label" style={{ textAlign:'left', padding:'4px 8px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map((p: any, i: number) => (
                <tr key={i} style={{ borderBottom:'1px solid var(--atlas-border)' }}>
                  <td style={{ padding:'4px 8px', color:'var(--atlas-accent-light)', fontWeight:600 }}>{p.symbol}</td>
                  <td style={{ padding:'4px 8px', fontSize:11 }}>{p.region}</td>
                  <td style={{ padding:'4px 8px' }}>{p.size}</td>
                  <td style={{ padding:'4px 8px' }}>{p.entry_price?.toFixed(2)}</td>
                  <td style={{ padding:'4px 8px' }}>{p.current_price?.toFixed(2)}</td>
                  <td style={{ padding:'4px 8px' }} className={(p.pnl_pct ?? 0) >= 0 ? 'positive' : 'negative'}>
                    {p.pnl_pct ? `${(p.pnl_pct*100).toFixed(2)}%` : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ textAlign:'center', padding:'24px 0 8px', fontSize:10, color:'var(--atlas-muted)' }}>
        ATLAS — Adaptive Trading & Learning Autonomous System
      </div>
    </div>
  )
}
