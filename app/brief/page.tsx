'use client'
import { useATLAS } from '@/app/hooks/useATLAS'
import TopBar from '@/app/components/TopBar'
import Link from 'next/link'

export default function BriefPage() {
  const { data, connected, lastUpdate } = useATLAS()
  const { brief, status } = data

  const lines = brief?.brief?.split('\n') || []

  const getLineColor = (line: string) => {
    if (line.startsWith('ATLAS')) return 'var(--atlas-accent)'
    if (line.startsWith('Global Risk:')) return 'var(--atlas-amber)'
    if (line.includes('CRITICAL') || line.includes('[ALERT]'))
      return 'var(--atlas-red)'
    if (line.includes('WARNING')) return 'var(--atlas-amber)'
    if (line.includes('BULLISH') || line.includes('BUY'))
      return 'var(--atlas-green)'
    if (line.includes('BEARISH') || line.includes('REDUCE'))
      return 'var(--atlas-red)'
    if (line.match(/^[A-Z\s]+:$/)) return 'var(--atlas-accent)'
    return 'var(--atlas-text)'
  }

  return (
    <div style={{ minHeight:'100vh' }}>
      <TopBar status={status} connected={connected} lastUpdate={lastUpdate} />
      <div style={{ padding:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
          <Link href="/" style={{ color:'var(--atlas-muted)', fontSize:11, textDecoration:'none' }}>
            ← Dashboard
          </Link>
          <span style={{ color:'var(--atlas-text)', fontSize:13, fontWeight:600 }}>
            Morning Brief
          </span>
          {brief?.timestamp && (
            <span className="atlas-label">
              {new Date(brief.timestamp).toLocaleString()}
            </span>
          )}
        </div>

        <div className="atlas-card" style={{ fontFamily:'monospace' }}>
          {lines.length > 0 ? (
            lines.map((line: string, i: number) => (
              <div key={i} style={{
                color: getLineColor(line),
                fontSize: line.startsWith('ATLAS') ? 14 : 12,
                fontWeight: line.match(/^[A-Z\s]+:?$/) ? 600 : 400,
                padding: line === '' ? '4px 0' : '1px 0',
                borderBottom: line.match(/^[A-Z\s]+:?$/) && line !== ''
                  ? '1px solid var(--atlas-border)' : 'none',
                marginTop: line.match(/^[A-Z\s]+:?$/) && line !== '' ? 8 : 0,
              }}>
                {line || '\u00A0'}
              </div>
            ))
          ) : (
            <div style={{ color:'var(--atlas-muted)', textAlign:'center',
                          padding:40, fontSize:12 }}>
              No morning brief yet — Chief of Staff runs at 7am
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
