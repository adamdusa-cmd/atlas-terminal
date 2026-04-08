'use client'
import Link from 'next/link'
import { useATLAS } from '@/app/hooks/useATLAS'
import TopBar from '@/app/components/TopBar'
import StatusCard from '@/app/components/StatusCard'
import IBStatus from '@/app/components/IBStatus'

export default function Home() {
  const { data, connected, lastUpdate } = useATLAS()
  const { risk, parliament, portfolio, status } = data

  const fmtPct = (v?: number) => v !== undefined ? `${(v*100).toFixed(2)}%` : '--'
  const fmt3   = (v?: number) => v !== undefined ? v.toFixed(3) : '--'
  const fmt2   = (v?: number) => v !== undefined ? v.toFixed(2) : '--'

  const pnlClass   = portfolio?.daily_pnl_pct !== undefined ? portfolio.daily_pnl_pct >= 0 ? 'positive' : 'negative' : ''
  const verdictClass = parliament?.verdict?.includes('BUY') ? 'positive' : parliament?.verdict?.includes('SELL') || parliament?.verdict?.includes('REDUCE') ? 'negative' : ''

  return (
    <div style={{ minHeight:'100vh' }}>
      <TopBar status={status} connected={connected} lastUpdate={lastUpdate} />
      <div style={{ padding:16, display:'flex', flexDirection:'column', gap:12 }}>
        {/* Navigation */}
        <div style={{ display:'flex', gap:8, marginBottom:4 }}>
          <Link href="/signals" style={{ color:'var(--atlas-accent)', fontSize:11,
            textDecoration:'none', padding:'4px 10px',
            border:'1px solid var(--atlas-border)', borderRadius:3 }}>
            Signals
          </Link>
          <Link href="/parliament" style={{ color:'var(--atlas-accent)', fontSize:11,
            textDecoration:'none', padding:'4px 10px',
            border:'1px solid var(--atlas-border)', borderRadius:3 }}>
            Parliament
          </Link>
          <Link href="/surfaces" style={{ color:'var(--atlas-accent)', fontSize:11,
            textDecoration:'none', padding:'4px 10px',
            border:'1px solid var(--atlas-border)', borderRadius:3 }}>
            Surfaces
          </Link>
          <Link href="/brief" style={{ color:'var(--atlas-accent)', fontSize:11,
            textDecoration:'none', padding:'4px 10px',
            border:'1px solid var(--atlas-border)', borderRadius:3 }}>
            Brief
          </Link>
          <Link href="/universe" style={{ color:'var(--atlas-accent)', fontSize:11,
            textDecoration:'none', padding:'4px 10px',
            border:'1px solid var(--atlas-border)', borderRadius:3 }}>
            Universe
          </Link>
          <Link href="/trades" style={{ color:'var(--atlas-accent)', fontSize:11,
            textDecoration:'none', padding:'4px 10px',
            border:'1px solid var(--atlas-border)', borderRadius:3 }}>
            Trades
          </Link>
          <Link href="/history" style={{ color:'var(--atlas-accent)', fontSize:11,
            textDecoration:'none', padding:'4px 10px',
            border:'1px solid var(--atlas-border)', borderRadius:3 }}>
            History
          </Link>
          <Link href="/briefs" style={{ color:'var(--atlas-accent)', fontSize:11,
            textDecoration:'none', padding:'4px 10px',
            border:'1px solid var(--atlas-border)', borderRadius:3 }}>
            Briefs
          </Link>
          <Link href="/chat" style={{ color:'#fff', fontSize:11,
            textDecoration:'none', padding:'4px 10px',
            background:'var(--atlas-accent)',
            border:'1px solid var(--atlas-accent)', borderRadius:3, fontWeight:600 }}>
            Chief of Staff
          </Link>
        </div>


        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px,1fr))', gap:8 }}>
          <StatusCard label="Risk Level" value={risk?.risk_level||'--'} colorClass={`risk-${risk?.risk_level||'LOW'}`} size="lg"/>
          <StatusCard label="G Value" value={fmt3(risk?.G)} colorClass={risk?.G && risk.G > 0.70 ? 'warning' : ''}/>
          <StatusCard label="VPIN" value={fmt3(risk?.VPIN)} colorClass={risk?.VPIN && risk.VPIN > 0.65 ? 'warning' : ''}/>
          <StatusCard label="Entropy" value={fmt3(risk?.entropy)}/>
          <StatusCard label="Pos Scale" value={fmtPct(risk?.position_scale)}/>
          <StatusCard label="Cash Buffer" value={fmtPct(risk?.cash_fraction)}/>
          <StatusCard label="Stop %" value={fmtPct(risk?.stop_pct)}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px,1fr))', gap:8 }}>
          <StatusCard label="Parliament" value={parliament?.verdict||'--'} colorClass={verdictClass} size="lg"/>
          <StatusCard label="Score" value={fmt2(parliament?.score)}/>
          {Object.entries(parliament?.brain_weights||{}).map(([b,w]: [string, number]) => (
            <StatusCard key={b} label={b.replace('_',' ').toUpperCase()} value={`${(Number(w)*100).toFixed(0)}%`}/>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px,1fr))', gap:8 }}>
          <StatusCard label="Total Equity" value={`€${(portfolio?.total_equity||0).toLocaleString()}`} size="lg"/>
          <StatusCard label="Daily P&L" value={fmtPct(portfolio?.daily_pnl_pct)} colorClass={pnlClass}/>
          <StatusCard label="Cash" value={`€${(portfolio?.cash_balance||0).toLocaleString()}`}/>
          <StatusCard label="Drawdown" value={fmtPct(portfolio?.drawdown)} colorClass={portfolio?.drawdown && portfolio.drawdown < -0.05 ? 'negative' : ''}/>
          <StatusCard label="Positions" value={portfolio?.positions?.length||0}/>
          <StatusCard label="Mode" value={portfolio?.mode||'PAPER'} colorClass={portfolio?.mode==='LIVE' ? 'positive' : 'info'}/>
        </div>

        {portfolio?.positions && portfolio.positions.length > 0 && (
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
                {portfolio.positions.map((p: any, i: number) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--atlas-border)' }}>
                    <td style={{ padding:'4px 8px', color:'var(--atlas-accent)' }}>{p.symbol}</td>
                    <td style={{ padding:'4px 8px' }} className="atlas-label">{p.region||'--'}</td>
                    <td style={{ padding:'4px 8px' }}>{p.size}</td>
                    <td style={{ padding:'4px 8px' }}>{p.entry_price?.toFixed(2)||'--'}</td>
                    <td style={{ padding:'4px 8px' }}>{p.current_price?.toFixed(2)||'--'}</td>
                    <td style={{ padding:'4px 8px' }} className={p.pnl_pct !== undefined ? p.pnl_pct >= 0 ? 'positive' : 'negative' : ''}>
                      {p.pnl_pct !== undefined ? `${(p.pnl_pct*100).toFixed(2)}%` : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ color:'var(--atlas-muted)', fontSize:10, textAlign:'center', padding:'8px 0' }}>
          ATLAS — Adaptive Trading & Learning Autonomous System
        </div>
      </div>
    </div>
  )
}
