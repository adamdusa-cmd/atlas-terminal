'use client'
import { useState, useEffect } from 'react'

const MACRO_API = 'https://atlas-macro-production.up.railway.app'

export default function MacroUniverse() {
  const [instruments, setInstruments] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetch(`${MACRO_API}/api/universe`)
      .then(r => r.json())
      .then(d => setInstruments(d.instruments || []))
  }, [])

  const filtered = filter === 'ALL' ? instruments : instruments.filter(i => i.asset_class === filter)
  const assetColor = (cls: string) => cls === 'FX' ? '#4dabf7' : cls === 'INDEX' ? '#f59e0b' : '#22c55e'

  return (
    <div style={{ padding:16, fontFamily:'Inter, sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <span style={{ fontSize:13, fontWeight:600, color:'#f8f9fa' }}>Macro Universe</span>
        <span className="atlas-label">{instruments.length} instruments</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          {['ALL','FX','INDEX','ETF'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:'3px 10px', fontSize:10, cursor:'pointer',
              background: filter===f ? '#228be6' : 'var(--atlas-surface)',
              color: filter===f ? '#fff' : '#adb5bd',
              border:'1px solid var(--atlas-border)', borderRadius:3,
              fontFamily:'Inter, sans-serif',
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:8 }}>
        {filtered.map(i => (
          <div key={i.symbol} className="atlas-card" style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:600, color:'#f8f9fa' }}>{i.symbol}</span>
              <span style={{ fontSize:9, fontWeight:600, color: assetColor(i.asset_class),
                background: `${assetColor(i.asset_class)}20`, padding:'2px 6px', borderRadius:3 }}>
                {i.asset_class}
              </span>
            </div>
            <div style={{ fontSize:11, color:'#adb5bd' }}>{i.name}</div>
            <div style={{ fontSize:9, color:'#adb5bd', textTransform:'uppercase', letterSpacing:'0.06em' }}>{i.region}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
