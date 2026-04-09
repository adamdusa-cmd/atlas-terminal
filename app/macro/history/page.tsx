'use client'
export default function MacroPlaceholder() {
  return (
    <div style={{ padding:16, fontFamily:'Inter, sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <span style={{ fontSize:13, fontWeight:600, color:'#f8f9fa' }}>ATLAS MACRO</span>
        <span className="atlas-chip">Coming Session 153</span>
      </div>
      <div className="atlas-card" style={{ textAlign:'center', padding:40 }}>
        <div style={{ fontSize:32, marginBottom:8 }}>⚡</div>
        <div style={{ color:'#f8f9fa', fontWeight:600, marginBottom:8 }}>Building ATLAS Macro Engine</div>
        <div style={{ color:'#adb5bd', fontSize:12 }}>Full data will be live in Session 153</div>
      </div>
    </div>
  )
}
