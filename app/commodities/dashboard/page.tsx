'use client'
import { useState, useEffect } from 'react'

const COMMODITIES_API = 'https://atlas-commodities-production.up.railway.app'

export default function CommoditiesDashboard() {
  const [status, setStatus] = useState<any>(null)
  const [risk, setRisk] = useState<any>(null)
  const [parliament, setParliament] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any>(null)

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const [s, r, p, pf] = await Promise.all([
          fetch(`${COMMODITIES_API}/api/status`).then(r => r.json()),
          fetch(`${COMMODITIES_API}/api/risk`).then(r => r.json()),
          fetch(`${COMMODITIES_API}/api/parliament`).then(r => r.json()),
          fetch(`${COMMODITIES_API}/api/portfolio`).then(r => r.json()),
        ])
        setStatus(s); setRisk(r); setParliament(p); setPortfolio(pf)
      } catch (e) { console.error(e) }
    }
    fetch_data()
    const iv = setInterval(fetch_data, 10000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div style={{ padding:16, fontFamily:'Inter, sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background: status ? '#22c55e' : '#ef4444' }}/>
        <span style={{ fontSize:13, fontWeight:600, color:'#f8f9fa' }}>ATLAS COMMODITIES</span>
        <span className="atlas-chip">METALS · ENERGY · AGRICULTURAL</span>
      </div>

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

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px,1fr))', gap:8, marginBottom:8 }}>
        {[
          { label:'Parliament', value: parliament?.verdict ?? '--', cls: parliament?.verdict==='BUY'?'positive':parliament?.verdict==='SELL'?'negative':'' },
          { label:'Score', value: parliament?.score?.toFixed(2) ?? '--' },
          { label:'Equity', value: portfolio?.total_equity ? `€${portfolio.total_equity.toLocaleString()}` : '--' },
          { label:'Daily P&L', value: portfolio?.daily_pnl_pct ? `${(portfolio.daily_pnl_pct*100).toFixed(2)}%` : '--', cls:(portfolio?.daily_pnl_pct??0)>=0?'positive':'negative' },
          { label:'Positions', value: portfolio?.open_positions ?? '0' },
          { label:'Mode', value: portfolio?.mode ?? 'PAPER', cls:'info' },
        ].map(c => (
          <div key={c.label} className="atlas-card">
            <div className="atlas-label">{c.label}</div>
            <div className={`atlas-value ${c.cls||''}`}>{String(c.value)}</div>
          </div>
        ))}
      </div>

      <div className="atlas-card">
        <div className="atlas-label" style={{ marginBottom:8 }}>Universe Categories</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[
            { label:'Precious Metals', count:4, color:'#f59e0b' },
            { label:'Energy', count:5, color:'#ef4444' },
            { label:'Agricultural', count:7, color:'#22c55e' },
            { label:'Industrial', count:3, color:'#4dabf7' },
          ].map(item => (
            <div key={item.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:24, fontWeight:700, color:item.color }}>{item.count}</div>
              <div className="atlas-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign:'center', padding:'24px 0 8px', fontSize:10, color:'var(--atlas-muted)' }}>
        ATLAS Commodities — Metals · Energy · Agricultural · Industrial
      </div>
    </div>
  )
}
