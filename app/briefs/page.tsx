'use client'
import { useState, useEffect } from 'react'
import { api } from '@/app/lib/api'
import TopBar from '@/app/components/TopBar'
import Link from 'next/link'
import { useATLAS } from '@/app/hooks/useATLAS'

export default function BriefsPage() {
  const { data, connected, lastUpdate } = useATLAS()
  const [briefs, setBriefs] = useState<any[]>([])
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      const res = await api.briefHistory() as any
      if (res?.briefs?.length) setBriefs(res.briefs)
    }
    fetch()
    const iv = setInterval(fetch, 60000)
    return () => clearInterval(iv)
  }, [])

  const brief = briefs[selected]
  const lines: string[] = brief?.brief?.split('\n') || []

  const getColor = (line: string) => {
    if (line.startsWith('ATLAS')) return 'var(--atlas-accent)'
    if (line.includes('CRITICAL') || line.includes('[ALERT]')) return 'var(--atlas-red)'
    if (line.includes('WARNING')) return 'var(--atlas-amber)'
    if (line.includes('BULLISH') || line.includes('BUY')) return 'var(--atlas-green)'
    if (line.includes('BEARISH') || line.includes('REDUCE')) return 'var(--atlas-red)'
    if (line.match(/^[A-Z\s]+:?$/)) return 'var(--atlas-accent)'
    return 'var(--atlas-text)'
  }

  return (
    <div style={{ minHeight:'100vh' }}>
      <TopBar status={data.status} connected={connected} lastUpdate={lastUpdate} />
      <div style={{ padding:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
          <Link href="/" style={{ color:'var(--atlas-muted)', fontSize:11, textDecoration:'none' }}>← Dashboard</Link>
          <span style={{ color:'var(--atlas-text)', fontSize:13, fontWeight:600 }}>Brief Archive</span>
          <span className="atlas-label">{briefs.length} briefs</span>
        </div>
        {briefs.length === 0 ? (
          <div className="atlas-card" style={{ textAlign:'center', padding:40, color:'var(--atlas-muted)', fontSize:12 }}>
            No briefs yet — Chief of Staff runs at 7am daily
          </div>
        ) : (
          <>
            <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
              {briefs.map((b,i) => (
                <button key={i} onClick={() => setSelected(i)} style={{
                  padding:'4px 12px', fontSize:11, cursor:'pointer',
                  background: i===selected ? 'var(--atlas-accent)' : 'var(--atlas-surface)',
                  color: i===selected ? '#fff' : 'var(--atlas-muted)',
                  border:'1px solid var(--atlas-border)', borderRadius:3,
                }}>
                  {b.date || `Brief ${i+1}`}
                </button>
              ))}
            </div>
            <div className="atlas-card" style={{ fontFamily:'monospace' }}>
              {lines.map((line, i) => (
                <div key={i} style={{
                  color: getColor(line), fontSize:12,
                  fontWeight: line.match(/^[A-Z\s]+:?$/) ? 600 : 400,
                  padding: line==='' ? '4px 0' : '1px 0',
                }}>
                  {line || '\u00A0'}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
