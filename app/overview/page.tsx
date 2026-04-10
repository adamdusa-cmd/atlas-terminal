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


// ── P&L Line Chart ────────────────────────────────────────────────
function PnLChart({ systems, pnlHistory }: { systems: any[], pnlHistory: Record<string,any[]> }) {
  const W = 800, H = 200, PAD = 40

  // Merge all dates
  const allDates = Array.from(new Set(
    systems.flatMap(s => (pnlHistory[s.key] || []).map((d: any) => d.date))
  )).sort()

  if (allDates.length === 0) {
    return (
      <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:24, marginBottom:8 }}>📈</div>
          <div style={{ fontSize:12, color:'#adb5bd' }}>P&L history will appear here after April 13</div>
          <div style={{ fontSize:10, color:'#adb5bd', marginTop:4 }}>Paper trading begins when IB goes live</div>
        </div>
      </div>
    )
  }

  // Build data per system + average
  const lines = systems.map(sys => ({
    key:    sys.key,
    color:  sys.color,
    name:   sys.name,
    values: allDates.map(date => {
      const point = (pnlHistory[sys.key] || []).find((d: any) => d.date === date)
      return point ? point.pnl_pct * 100 : null
    })
  }))

  // Average line
  const avgValues = allDates.map((_, i) => {
    const vals = lines.map(l => l.values[i]).filter(v => v !== null) as number[]
    return vals.length > 0 ? vals.reduce((a,b) => a+b, 0) / vals.length : null
  })
  lines.push({ key:'avg', color:'#ffffff', name:'Average', values: avgValues })

  // Scale
  const allVals = lines.flatMap(l => l.values).filter(v => v !== null) as number[]
  const minVal  = Math.min(...allVals, -1)
  const maxVal  = Math.max(...allVals, 1)
  const range   = maxVal - minVal || 1

  const xScale = (i: number) => PAD + (i / Math.max(allDates.length - 1, 1)) * (W - PAD*2)
  const yScale = (v: number) => PAD + (1 - (v - minVal) / range) * (H - PAD*2)

  const buildPath = (values: (number|null)[]) => {
    const points = values.map((v, i) => v !== null ? `${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}` : null)
    let path = ''
    let inPath = false
    points.forEach((p, i) => {
      if (p) {
        path += inPath ? ` L${p}` : ` M${p}`
        inPath = true
      } else {
        inPath = false
      }
    })
    return path.trim()
  }

  // Zero line Y
  const zeroY = yScale(0)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto' }}>
        {/* Zero line */}
        <line x1={PAD} y1={zeroY} x2={W-PAD} y2={zeroY}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4"/>
        <text x={PAD-4} y={zeroY+4} fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="end">0%</text>

        {/* Grid lines */}
        {[minVal, (minVal+maxVal)/2, maxVal].map((v, i) => (
          <g key={i}>
            <line x1={PAD} y1={yScale(v)} x2={W-PAD} y2={yScale(v)}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            <text x={PAD-4} y={yScale(v)+4} fontSize="9" fill="rgba(255,255,255,0.25)" textAnchor="end">
              {v.toFixed(1)}%
            </text>
          </g>
        ))}

        {/* Date labels */}
        {allDates.filter((_, i) => i % Math.max(Math.floor(allDates.length/6),1) === 0).map((date, i) => (
          <text key={date} x={xScale(allDates.indexOf(date))} y={H-8}
            fontSize="8" fill="rgba(255,255,255,0.3)" textAnchor="middle">
            {date.slice(5)}
          </text>
        ))}

        {/* Lines */}
        {lines.map(line => (
          <path key={line.key}
            d={buildPath(line.values)}
            fill="none"
            stroke={line.color}
            strokeWidth={line.key === 'avg' ? 2 : 1.5}
            strokeDasharray={line.key === 'avg' ? '6,3' : 'none'}
            opacity={line.key === 'avg' ? 1 : 0.8}
          />
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginTop:8 }}>
        {lines.map(line => (
          <div key={line.key} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{
              width:16, height:2,
              background:line.color,
              borderRadius:1,
              opacity: line.key === 'avg' ? 1 : 0.8,
            }}/>
            <span style={{ fontSize:10, color:'#adb5bd' }}>{line.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OverviewPage() {
  const [systems,   setSystems]   = useState<Record<string,any>>({})
  const [scAlloc,   setSCAlloc]   = useState<any>(null)
  const [lastUpdate,setLastUpdate]= useState<string>('')
  const [perf,       setPerf]       = useState<Record<string,any>>({})
  const [pnlHistory, setPnlHistory] = useState<Record<string,any[]>>({})

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch Supreme Commander via proxy
      try {
        const r = await fetch('/api/systems?system=equities&endpoint=supreme-commander')
        const d = await r.json()
        setSCAlloc(d.allocation)
      } catch {}

      // Fetch each system via proxy
      const results: Record<string,any> = {}
      await Promise.all(SYSTEMS.map(async sys => {
        try {
          const [status, parliament, picks, portfolio, risk] = await Promise.all([
            fetch(`/api/systems?system=${sys.key}&endpoint=status`).then(r => r.json()),
            fetch(`/api/systems?system=${sys.key}&endpoint=parliament`).then(r => r.json()),
            fetch(`/api/systems?system=${sys.key}&endpoint=top-picks`).then(r => r.json()),
            fetch(`/api/systems?system=${sys.key}&endpoint=portfolio`).then(r => r.json()).catch(() => null),
            fetch(`/api/systems?system=${sys.key}&endpoint=risk`).then(r => r.json()).catch(() => null),
          ])
          results[sys.key] = { status, parliament, picks: picks.picks || [], portfolio, risk }
        } catch {
          results[sys.key] = null
        }
      }))
      setSystems(results)
      setLastUpdate(new Date().toLocaleTimeString('en-GB', {hour12:false}))

      // Fetch performance/history per system
      const perfResults: Record<string,any> = {}
      await Promise.all(SYSTEMS.map(async sys => {
        try {
          const r = await fetch(`${sys.url}/api/portfolio`)
          const d = await r.json()
          perfResults[sys.key] = d
        } catch {}
      }))
      setPerf(perfResults)

      // Fetch P&L history per system
      const histResults: Record<string,any[]> = {}
      await Promise.all(SYSTEMS.map(async sys => {
        try {
          const r = await fetch(`/api/systems?system=${sys.key}&endpoint=performance-history`)
          const d = await r.json()
          histResults[sys.key] = d.history || []
        } catch { histResults[sys.key] = [] }
      }))
      setPnlHistory(histResults)
    }

    fetchAll()
    const iv = setInterval(fetchAll, 15000)
    return () => clearInterval(iv)
  }, [])

  // Total portfolio
  const INITIAL_CAPITAL: Record<string,number> = {
    equities: 10000, macro: 50000, commodities: 30000
  }
  const totalEquity = SYSTEMS.reduce((sum, sys) => {
    const eq = systems[sys.key]?.portfolio?.total_equity || INITIAL_CAPITAL[sys.key] || 0
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
                    {s?.risk?.G?.toFixed(3) ?? s?.risk?.g_value?.toFixed(3) ?? '--'}
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

      {/* Performance */}
      <div className="atlas-card" style={{ marginTop:12 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'#f8f9fa', letterSpacing:'0.08em', marginBottom:12 }}>
          PERFORMANCE
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {/* Combined */}
          <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:6, padding:'10px 12px' }}>
            <div className="atlas-label" style={{ marginBottom:4 }}>TOTAL PORTFOLIO</div>
            <div style={{ fontSize:18, fontWeight:700, color: totalPnl >= 0 ? '#22c55e' : '#ef4444' }}>
              {totalEquity > 0 ? `${(totalPnl*100).toFixed(2)}%` : '--'}
            </div>
            <div className="atlas-label" style={{ marginTop:2 }}>Daily P&L</div>
            <div style={{ marginTop:6, fontSize:13, fontWeight:600, color:'#f8f9fa' }}>
              {totalEquity > 0 ? `$${totalEquity.toLocaleString(undefined,{maximumFractionDigits:0})}` : '--'}
            </div>
            <div className="atlas-label">Total AUM</div>
          </div>
          {/* Per system */}
          {SYSTEMS.map(sys => {
            const p = perf[sys.key]
            const pnl     = p?.daily_pnl_pct || 0
            const equity  = p?.total_equity || 0
            const ytd     = p?.ytd_pnl_pct || 0
            const trades  = p?.total_trades || 0
            const winRate = p?.win_rate || 0
            return (
              <div key={sys.key} style={{
                background:'rgba(255,255,255,0.04)', borderRadius:6, padding:'10px 12px',
                borderTop: `2px solid ${sys.color}`,
              }}>
                <div className="atlas-label" style={{ marginBottom:4 }}>{sys.name}</div>
                <div style={{ fontSize:18, fontWeight:700, color: pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                  {equity > 0 ? `${(pnl*100).toFixed(2)}%` : '--'}
                </div>
                <div className="atlas-label" style={{ marginTop:2 }}>Daily P&L</div>
                <div style={{ marginTop:6, display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:'#f8f9fa' }}>
                      {equity > 0 ? `$${Math.round(equity).toLocaleString()}` : '--'}
                    </div>
                    <div className="atlas-label">Equity</div>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color: winRate > 0.5 ? '#22c55e' : '#adb5bd' }}>
                      {winRate > 0 ? `${(winRate*100).toFixed(0)}%` : '--'}
                    </div>
                    <div className="atlas-label">Win Rate</div>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:'#f8f9fa' }}>
                      {trades || '--'}
                    </div>
                    <div className="atlas-label">Trades</div>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color: ytd >= 0 ? '#22c55e' : '#ef4444' }}>
                      {ytd !== 0 ? `${(ytd*100).toFixed(2)}%` : '--'}
                    </div>
                    <div className="atlas-label">YTD</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* P&L Chart */}
      <div className="atlas-card" style={{ marginTop:12 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'#f8f9fa', letterSpacing:'0.08em', marginBottom:12 }}>
          DAILY P&L EVOLUTION
        </div>
        <PnLChart systems={SYSTEMS} pnlHistory={pnlHistory} />
      </div>

      <div style={{ textAlign:'center', padding:'20px 0 8px', fontSize:10, color:'var(--atlas-muted)' }}>
        ATLAS — Adaptive Trading & Learning Autonomous System
      </div>
    </div>
  )
}
