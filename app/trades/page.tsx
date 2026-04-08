'use client'
import { useState, useEffect } from 'react'
import { api } from '@/app/lib/api'
import Link from 'next/link'
import { useATLAS } from '@/app/hooks/useATLAS'

export default function TradesPage() {
  const { data, connected, lastUpdate } = useATLAS()
  const [trades, setTrades] = useState<any[]>([])

  useEffect(() => {
    const fetch = async () => {
      const res = await api.tradeHistory() as any
      if (res?.trades) setTrades(res.trades)
    }
    fetch()
    const interval = setInterval(fetch, 10000)
    return () => clearInterval(interval)
  }, [])

  const fmtTime = (ts: string) => {
    try { return new Date(ts).toLocaleString('en-GB', { hour12: false }) } catch { return ts }
  }
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const wins = trades.filter(t => (t.pnl || 0) > 0).length
  const winRate = trades.length > 0 ? wins / trades.length : 0

  return (
    <div style={{ minHeight:'100vh' }}>
      <div style={{ padding:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
          <Link href="/" style={{ color:'var(--atlas-muted)', fontSize:11, textDecoration:'none' }}>← Dashboard</Link>
          <span style={{ color:'var(--atlas-text)', fontSize:13, fontWeight:600 }}>Trade Log</span>
          <span className="atlas-label">{trades.length} trades</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px,1fr))', gap:8, marginBottom:12 }}>
          {[
            { label:'Total Trades', value: trades.length, color:'' },
            { label:'Win Rate', value: `${(winRate*100).toFixed(0)}%`, color: winRate>=0.5?'positive':'negative' },
            { label:'Total P&L', value: `€${totalPnl.toFixed(2)}`, color: totalPnl>=0?'positive':'negative' },
            { label:'Mode', value: data.portfolio?.mode||'PAPER', color:'info' },
          ].map(c => (
            <div key={c.label} className="atlas-card">
              <div className="atlas-label" style={{ marginBottom:4 }}>{c.label}</div>
              <div className={`atlas-value ${c.color}`} style={{ fontSize:18 }}>{String(c.value)}</div>
            </div>
          ))}
        </div>
        <div className="atlas-card">
          {trades.length === 0 ? (
            <div style={{ textAlign:'center', padding:40, color:'var(--atlas-muted)', fontSize:12 }}>
              No trades yet — paper trading begins April 13
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--atlas-border)' }}>
                  {['Time','Symbol','Dir','Size','Entry','Exit','P&L','Verdict','Reason'].map(h => (
                    <th key={h} className="atlas-label" style={{ textAlign:'left', padding:'4px 8px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--atlas-border)' }}>
                    <td style={{ padding:'4px 8px', fontSize:10, color:'var(--atlas-muted)' }}>{fmtTime(t.timestamp)}</td>
                    <td style={{ padding:'4px 8px', color:'var(--atlas-accent)', fontWeight:600 }}>{t.symbol}</td>
                    <td style={{ padding:'4px 8px', color: t.direction==='BUY'?'var(--atlas-green)':'var(--atlas-red)' }}>{t.direction}</td>
                    <td style={{ padding:'4px 8px' }}>{t.size}</td>
                    <td style={{ padding:'4px 8px' }}>{t.entry_price?.toFixed(2)||'--'}</td>
                    <td style={{ padding:'4px 8px' }}>{t.exit_price?.toFixed(2)||'--'}</td>
                    <td style={{ padding:'4px 8px' }} className={(t.pnl||0)>=0?'positive':'negative'}>
                      {t.pnl!==undefined?`€${t.pnl.toFixed(2)}`:'--'}
                    </td>
                    <td style={{ padding:'4px 8px', fontSize:10 }}>{t.parliament_verdict||'--'}</td>
                    <td style={{ padding:'4px 8px', fontSize:10, color:'var(--atlas-muted)' }}>{t.stop_reason||'--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
