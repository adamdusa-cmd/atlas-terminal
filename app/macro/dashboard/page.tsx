'use client'
import { useState, useEffect } from 'react'

const MACRO_API = 'https://atlas-macro-production.up.railway.app'

export default function MacroDashboard() {
  const [status, setStatus] = useState<any>(null)
  const [risk, setRisk] = useState<any>(null)
  const [parliament, setParliament] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any>(null)
  const [universe, setUniverse] = useState<any>(null)

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const [s, r, p, pf, u] = await Promise.all([
          fetch(`${MACRO_API}/api/status`).then(r => r.json()),
          fetch(`${MACRO_API}/api/risk`).then(r => r.json()),
          fetch(`${MACRO_API}/api/parliament`).then(r => r.json()),
          fetch(`${MACRO_API}/api/portfolio`).then(r => r.json()),
          fetch(`${MACRO_API}/api/universe`).then(r => r.json()),
        ])
        setStatus(s); setRisk(r); setParliament(p); setPortfolio(pf); setUniverse(u)
      } catch (e) { console.error(e) }
    }
    fetch_data()
    const iv = setInterval(fetch_data, 10000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div style={{ padding: 16, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <div style={{
          width:8, height:8, borderRadius:'50%',
          background: status ? '#22c55e' : '#ef4444',
          boxShadow: status ? '0 0 6px rgba(34,197,94,0.5)' : 'none'
        }}/>
        <span style={{ fontSize:13, fontWeight:600, color:'#f8f9fa' }}>ATLAS MACRO</span>
        <span className="atlas-chip">FX · INDICES · ETFs · CRYPTO</span>
        <span style={{ marginLeft:'auto', fontSize:10, color:'#adb5bd' }}>
          {universe?.total || 0} instruments
        </span>
      </div>

      {/* Risk row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px,1fr))', gap:8, marginBottom:8 }}>
        {[
          { label:'Risk Level', value: risk?.level ?? '--', cls: `risk-${risk?.level}` },
          { label:'G Value', value: risk?.G?.toFixed(3) ?? '--' },
          { label:'VPIN', value: risk?.VPIN?.toFixed(3) ?? '--' },
          { label:'Entropy', value: risk?.entropy?.toFixed(3) ?? '--' },
          { label:'Pos Scale', value: risk?.position_scale ? `${(risk.position_scale*100).toFixed(0)}%` : '--' },
          { label:'Cash', value: risk?.cash_fraction ? `${(risk.cash_fraction*100).toFixed(0)}%` : '--' },
        ].map(c => (
          <div key={c.label} className="atlas-card">
            <div className="atlas-label">{c.label}</div>
            <div className={`atlas-value ${c.cls||''}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Parliament row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px,1fr))', gap:8, marginBottom:8 }}>
        {[
          { label:'Parliament', value: parliament?.verdict ?? '--', cls: parliament?.verdict === 'BUY' ? 'positive' : parliament?.verdict === 'SELL' ? 'negative' : '' },
          { label:'Score', value: parliament?.score?.toFixed(2) ?? '--' },
          { label:'Equity', value: portfolio?.total_equity ? `€${portfolio.total_equity.toLocaleString()}` : '--' },
          { label:'Daily P&L', value: portfolio?.daily_pnl_pct ? `${(portfolio.daily_pnl_pct*100).toFixed(2)}%` : '--', cls: (portfolio?.daily_pnl_pct ?? 0) >= 0 ? 'positive' : 'negative' },
          { label:'Positions', value: portfolio?.open_positions ?? '0' },
          { label:'Mode', value: portfolio?.mode ?? 'PAPER', cls: 'info' },
        ].map(c => (
          <div key={c.label} className="atlas-card">
            <div className="atlas-label">{c.label}</div>
            <div className={`atlas-value ${c.cls||''}`}>{String(c.value)}</div>
          </div>
        ))}
      </div>

      {/* Universe breakdown */}
      <div className="atlas-card">
        <div className="atlas-label" style={{ marginBottom:8 }}>Active Universe</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[
            { label:'FX Pairs', count: universe?.instruments?.filter((i:any) => i.asset_class==='FX').length ?? 0, color:'#4dabf7' },
            { label:'Indices', count: universe?.instruments?.filter((i:any) => i.asset_class==='INDEX').length ?? 0, color:'#f59e0b' },
            { label:'ETFs', count: universe?.instruments?.filter((i:any) => i.asset_class==='ETF').length ?? 0, color:'#22c55e' },
            { label:'Crypto', count: universe?.instruments?.filter((i:any) => i.asset_class==='CRYPTO').length ?? 0, color:'#a78bfa' },
          ].map(item => (
            <div key={item.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:24, fontWeight:700, color:item.color }}>{item.count}</div>
              <div className="atlas-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign:'center', padding:'24px 0 8px', fontSize:10, color:'var(--atlas-muted)' }}>
        ATLAS Macro — FX · Indices · ETFs · 24/7
      </div>
    </div>
  )
}
