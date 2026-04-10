'use client'
import { useState, useEffect } from 'react'

const SYSTEMS = [
  {
    name:    'ATLAS EQUITIES',
    key:     'equities',
    url:     'https://atlas-scheduler-production-a62e.up.railway.app',
    color:   '#4dabf7',
    href:    '/dashboard',
  },
  {
    name:    'ATLAS MACRO',
    key:     'macro',
    url:     'https://atlas-macro-production.up.railway.app',
    color:   '#f59e0b',
    href:    '/macro/dashboard',
  },
  {
    name:    'ATLAS COMMODITIES',
    key:     'commodities',
    url:     'https://atlas-commodities-production.up.railway.app',
    color:   '#22c55e',
    href:    '/commodities/dashboard',
  },
]

const SC_URL = 'https://atlas-scheduler-production-a62e.up.railway.app'

export default function OverviewPage() {
  const [systems,   setSystems]   = useState<Record<string,any>>({})
  const [scAlloc,   setSCAlloc]   = useState<any>(null)
  const [lastUpdate,setLastUpdate]= useState<string>('')

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch Supreme Commander
      try {
        const r = await fetch(`${SC_URL}/api/supreme-commander`)
        const d = await r.json()
        setSCAlloc(d.allocation)
      } catch {}

      // Fetch each system
      const results: Record<string,any> = {}
      await Promise.all(SYSTEMS.map(async sys => {
        try {
          const [status, parliament, picks, portfolio] = await Promise.all([
            fetch(`${sys.url}/api/status`).then(r => r.json()),
            fetch(`${sys.url}/api/parliament`).then(r => r.json()),
            fetch(`${sys.url}/api/top-picks`).then(r => r.json()),
            fetch(`${sys.url}/api/portfolio`).then(r => r.json()).catch(() => null),
          ])
          results[sys.key] = { status, parliament, picks: picks.picks || [], portfolio }
        } catch {
          results[sys.key] = null
        }
      }))
      setSystems(results)
      setLastUpdate(new Date().toLocaleTimeString('en-GB', {hour12:false}))
    }

    fetchAll()
    const iv = setInterval(fetchAll, 15000)
    return () => clearInterval(iv)
  }, [])

  // Total portfolio
  const totalEquity = SYSTEMS.reduce((sum, sys) => {
    const eq = systems[sys.key]?.portfolio?.total_equity || 0
    return sum + eq
  }, 0)
  const totalPnl = SYSTEMS.reduce((sum, sys) => {
    const pnl = systems[sys.key]?.portfolio?.daily_pnl_pct || 0
    return sum + pnl
  }, 0) / 3

  const riskColor = (level: string) => {
    if (level === 'CRITICAL') return '#ef4444'
    if (level === 'HIGH')     return '#f59e0b'
    if (level === 'MODERATE') return '#eab308'
    return '#22c55e'
  }

  const verdictColor = (v: string) => {
    if (v === 'BUY')  return '#22c55e'
    if (v === 'SELL') return '#ef4444'
    return '#adb5bd'
  }

  return (
    <div style={{ padding:16, fontFamily:'Inter, sans-serif', maxWidth:1400 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#f8f9fa', letterSpacing:'0.05em' }}>
            ATLAS OVERVIEW
          </div>
          <div style={{ fontSize:10, color:'#adb5bd', marginTop:2 }}>
            Three parallel trading systems — unified view
          </div>
        </div>
        <div style={{ fontSize:10, color:'#adb5bd' }}>
          Updated {lastUpdate || '--'}
        </div>
      </div>

      {/* Total Portfolio Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
        {[
          { label:'Total AUM',    value: totalEquity > 0 ? `$${totalEquity.toLocaleString(undefined,{maximumFractionDigits:0})}` : '--' },
          { label:'Avg Daily P&L', value: totalEquity > 0 ? `${(totalPnl*100).toFixed(2)}%` : '--',
            color: totalPnl >= 0 ? '#22c55e' : '#ef4444' },
          { label:'Active Systems', value: Object.values(systems).filter(s => s?.status?.mode).length + '/3' },
          { label:'Mode', value: 'PAPER', color:'#4dabf7' },
        ].map(c => (
          <div key={c.label} className="atlas-card" style={{ textAlign:'center' }}>
            <div className="atlas-label" style={{ marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:20, fontWeight:700, color: c.color || '#f8f9fa' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Supreme Commander Allocation */}
      {scAlloc && (
        <div className="atlas-card" style={{ marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#f8f9fa', letterSpacing:'0.08em' }}>
              SUPREME COMMANDER — CAPITAL ALLOCATION
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {SYSTEMS.map(sys => (
              <div key={sys.key}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:10, color:'#adb5bd' }}>{sys.name}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:sys.color }}>
                    {((scAlloc[sys.key]||0)*100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2 }}>
                  <div style={{
                    height:4, borderRadius:2, background:sys.color,
                    width:`${(scAlloc[sys.key]||0)*100}%`,
                    transition:'width 0.5s',
                    boxShadow:`0 0 6px ${sys.color}60`,
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Three System Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {SYSTEMS.map(sys => {
          const s = systems[sys.key]
          const status     = s?.status
          const parliament = s?.parliament
          const picks      = s?.picks || []
          const portfolio  = s?.portfolio
          const online     = !!status?.mode
          const riskLevel  = status?.risk_level || '--'
          const verdict    = parliament?.verdict || '--'

          return (
            <div key={sys.key} className="atlas-card" style={{
              borderTop: `2px solid ${sys.color}`,
              padding: 12,
            }}>
              {/* System Header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{
                    width:6, height:6, borderRadius:'50%',
                    background: online ? '#22c55e' : '#ef4444',
                    boxShadow: online ? '0 0 6px #22c55e' : 'none',
                  }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:'#f8f9fa', letterSpacing:'0.06em' }}>
                    {sys.name}
                  </span>
                </div>
                <a href={sys.href} style={{ fontSize:9, color:sys.color, textDecoration:'none', letterSpacing:'0.06em' }}>
                  VIEW →
                </a>
              </div>

              {/* Risk + Verdict */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:4, padding:'6px 8px' }}>
                  <div className="atlas-label">Risk</div>
                  <div style={{ fontSize:13, fontWeight:700, color:riskColor(riskLevel) }}>{riskLevel}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:4, padding:'6px 8px' }}>
                  <div className="atlas-label">Parliament</div>
                  <div style={{ fontSize:13, fontWeight:700, color:verdictColor(verdict) }}>{verdict}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:4, padding:'6px 8px' }}>
                  <div className="atlas-label">G Value</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#f8f9fa' }}>
                    {status?.g_value?.toFixed(3) ?? '--'}
                  </div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:4, padding:'6px 8px' }}>
                  <div className="atlas-label">Equity</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#f8f9fa' }}>
                    {portfolio?.total_equity
                      ? `$${Math.round(portfolio.total_equity).toLocaleString()}`
                      : '--'}
                  </div>
                </div>
              </div>

              {/* Top Picks */}
              <div>
                <div className="atlas-label" style={{ marginBottom:6 }}>Top Picks</div>
                {picks.length === 0 ? (
                  <div style={{ fontSize:11, color:'#adb5bd', fontStyle:'italic' }}>
                    Scanning...
                  </div>
                ) : (
                  picks.slice(0,3).map((pick: any, i: number) => (
                    <div key={i} style={{
                      display:'flex', justifyContent:'space-between',
                      alignItems:'center', padding:'4px 0',
                      borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                      <div>
                        <span style={{ fontSize:11, fontWeight:600, color:'#f8f9fa' }}>
                          {pick.symbol}
                        </span>
                        <span style={{ fontSize:9, color:'#adb5bd', marginLeft:6 }}>
                          {pick.asset_class || pick.category || ''}
                        </span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontSize:9, color: pick.score > 0 ? '#22c55e' : '#ef4444' }}>
                          {pick.score > 0 ? '▲' : '▼'}
                        </span>
                        <span style={{ fontSize:11, fontWeight:600,
                          color: pick.score > 0 ? '#22c55e' : '#ef4444' }}>
                          {pick.score?.toFixed(2) ?? '--'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ textAlign:'center', padding:'20px 0 8px', fontSize:10, color:'var(--atlas-muted)' }}>
        ATLAS — Adaptive Trading & Learning Autonomous System
      </div>
    </div>
  )
}
