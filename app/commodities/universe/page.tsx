'use client'
import { useState, useEffect } from 'react'

const COMMODITIES_API = 'https://atlas-commodities-production.up.railway.app'

export default function CommoditiesUniverse() {
  const [instruments, setInstruments] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetch(`${COMMODITIES_API}/api/universe`)
      .then(r => r.json())
      .then(d => setInstruments(d.instruments || []))
  }, [])

  const filtered = filter === 'ALL' ? instruments : instruments.filter(i => i.category === filter)
  const catColor = (cat: string) => cat === 'METALS' ? '#f59e0b' : cat === 'ENERGY' ? '#ef4444' : cat === 'AGRICULTURAL' ? '#22c55e' : '#4dabf7'

  return (
    <div style={{ padding:16, fontFamily:'Inter, sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <span style={{ fontSize:13, fontWeight:600, color:'#f8f9fa' }}>Commodities Universe</span>
        <span className="atlas-label">{instruments.length} instruments</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          {['ALL','METALS','ENERGY','AGRICULTURAL','INDUSTRIAL'].map(f => (
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
              <span style={{ fontSize:9, fontWeight:600, color: catColor(i.category),
                background: `${catColor(i.category)}20`, padding:'2px 6px', borderRadius:3 }}>
                {i.category}
              </span>
            </div>
            <div style={{ fontSize:11, color:'#adb5bd' }}>{i.name}</div>
            <div style={{ fontSize:9, color:'#adb5bd', textTransform:'uppercase', letterSpacing:'0.06em' }}>{i.subcategory}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
