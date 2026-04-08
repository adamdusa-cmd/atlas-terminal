'use client'
import { useATLAS } from '@/app/hooks/useATLAS'
import Link from 'next/link'

export default function UniversePage() {
  const { data, connected, lastUpdate } = useATLAS()
  const { status } = data
  const raw = data as any
  const prices: Record<string,number>  = raw?.universe?.prices  || {}
  const returns: Record<string,number> = raw?.universe?.returns || {}
  const symbols = Object.keys(prices)

  return (
    <div style={{ minHeight:'100vh' }}>
      <div style={{ padding:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
          <Link href="/" style={{ color:'var(--atlas-muted)', fontSize:11, textDecoration:'none' }}>← Dashboard</Link>
          <span style={{ color:'var(--atlas-text)', fontSize:13, fontWeight:600 }}>Universe Scanner</span>
          <span className="atlas-label">{symbols.length} symbols</span>
        </div>
        <div className="atlas-card">
          {symbols.length === 0 ? (
            <div style={{ textAlign:'center', padding:40, color:'var(--atlas-muted)', fontSize:12 }}>
              No universe data yet
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--atlas-border)' }}>
                  {['Symbol','Price','1D Return','Bar'].map(h => (
                    <th key={h} className="atlas-label" style={{ textAlign:'left', padding:'4px 10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {symbols.map(sym => {
                  const ret = returns[sym] || 0
                  const color = ret > 0 ? 'var(--atlas-green)' : ret < 0 ? 'var(--atlas-red)' : 'var(--atlas-muted)'
                  return (
                    <tr key={sym} style={{ borderBottom:'1px solid var(--atlas-border)' }}>
                      <td style={{ padding:'5px 10px', color:'var(--atlas-accent)', fontWeight:600 }}>{sym}</td>
                      <td style={{ padding:'5px 10px' }}>{prices[sym]?.toFixed(2)}</td>
                      <td style={{ padding:'5px 10px', color }}>
                        {ret >= 0 ? '+' : ''}{(ret*100).toFixed(2)}%
                      </td>
                      <td style={{ padding:'5px 10px' }}>
                        <div style={{ width:80, height:6, background:'var(--atlas-border)', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${Math.min(Math.abs(ret)*1000,100)}%`, background:color, borderRadius:3 }}/>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
