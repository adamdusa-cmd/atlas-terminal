'use client'
import { useState, useEffect } from 'react'
import { api } from '@/app/lib/api'
import TopBar from '@/app/components/TopBar'
import Link from 'next/link'
import { useATLAS } from '@/app/hooks/useATLAS'

function MiniChart({ data, color, label }: { data: number[], color: string, label: string }) {
  if (!data.length) return (
    <div className="atlas-card">
      <div className="atlas-label" style={{ marginBottom:4 }}>{label}</div>
      <div style={{ color:'var(--atlas-muted)', fontSize:11, padding:'20px 0' }}>No data yet</div>
    </div>
  )
  const min = Math.min(...data), max = Math.max(...data), range = max-min||1
  const w = 260, h = 50
  const pts = data.slice(0,60).reverse().map((v,i) => {
    const x = (i/Math.max(Math.min(data.length,60)-1,1))*w
    const y = h-((v-min)/range)*(h-8)-4
    return `${x},${y}`
  }).join(' ')
  return (
    <div className="atlas-card">
      <div className="atlas-label" style={{ marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:600, color, marginBottom:4 }}>{data[0]?.toFixed(3)}</div>
      <svg width={w} height={h} style={{ display:'block' }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" opacity="0.8"/>
      </svg>
    </div>
  )
}

export default function HistoryPage() {
  const { data, connected, lastUpdate } = useATLAS()
  const [riskH, setRiskH] = useState<any[]>([])
  const [sigH, setSigH] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    const fetch = async () => {
      const [rh, sh, ah] = await Promise.all([
        api.riskHistory() as any,
        api.signalHistory() as any,
        api.alertHistory() as any,
      ])
      if (rh?.risk) setRiskH(rh.risk)
      if (sh?.signals) setSigH(sh.signals)
      if (ah?.alerts) setAlerts(ah.alerts)
    }
    fetch()
    const iv = setInterval(fetch, 10000)
    return () => clearInterval(iv)
  }, [])

  const fmtTime = (ts: string) => {
    try { return new Date(ts).toLocaleString('en-GB', { hour12: false }) } catch { return ts }
  }

  return (
    <div style={{ minHeight:'100vh' }}>
      <TopBar status={data.status} connected={connected} lastUpdate={lastUpdate} />
      <div style={{ padding:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
          <Link href="/" style={{ color:'var(--atlas-muted)', fontSize:11, textDecoration:'none' }}>← Dashboard</Link>
          <span style={{ color:'var(--atlas-text)', fontSize:13, fontWeight:600 }}>Signal History</span>
          <span className="atlas-label">{riskH.length} snapshots</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:8, marginBottom:12 }}>
          <MiniChart data={riskH.map(r=>r.G)} color="var(--atlas-red)" label="G Value — rolling 24h"/>
          <MiniChart data={riskH.map(r=>r.VPIN)} color="var(--atlas-amber)" label="VPIN — rolling 24h"/>
          <MiniChart data={riskH.map(r=>r.entropy)} color="var(--atlas-accent)" label="Entropy — rolling 24h"/>
          <MiniChart data={sigH.map(s=>s.parliament_score)} color="var(--atlas-green)" label="Parliament Score — rolling 24h"/>
          <MiniChart data={riskH.map(r=>r.position_scale)} color="var(--atlas-purple)" label="Position Scale — rolling 24h"/>
        </div>
        <div className="atlas-card">
          <div className="atlas-label" style={{ marginBottom:8 }}>Risk Alert Log</div>
          {alerts.length === 0 ? (
            <div style={{ color:'var(--atlas-muted)', fontSize:12, padding:'8px 0' }}>No alerts — system nominal</div>
          ) : alerts.map((a,i) => (
            <div key={i} style={{ padding:'6px 0', borderBottom:'1px solid var(--atlas-border)', display:'flex', gap:12, alignItems:'center' }}>
              <span style={{ fontSize:10, color:'var(--atlas-muted)', minWidth:140 }}>{fmtTime(a.timestamp)}</span>
              <span style={{ fontSize:11, fontWeight:600, color: a.level==='CRITICAL'?'var(--atlas-red)':a.level==='WARNING'?'var(--atlas-amber)':'var(--atlas-text)' }}>{a.level||'INFO'}</span>
              <span style={{ fontSize:11 }}>{a.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
