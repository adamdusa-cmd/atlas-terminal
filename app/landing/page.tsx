'use client'
import { useEffect, useState } from 'react'
import ParticleBackground from '@/app/components/ParticleBackground'
import LandingFooter from '@/app/components/LandingFooter'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div style={{ minHeight:'100vh', background:'#050b14', fontFamily:'Inter, sans-serif', overflow:'hidden', position:'relative' }}>
      <ParticleBackground />
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:`radial-gradient(1px 1px at 15% 25%, rgba(77,171,247,0.4) 0%, transparent 100%),radial-gradient(1px 1px at 75% 15%, rgba(77,171,247,0.3) 0%, transparent 100%),radial-gradient(1px 1px at 45% 55%, rgba(77,171,247,0.25) 0%, transparent 100%),radial-gradient(1px 1px at 85% 45%, rgba(77,171,247,0.3) 0%, transparent 100%),radial-gradient(1px 1px at 25% 75%, rgba(77,171,247,0.2) 0%, transparent 100%)` }} />
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'center', minHeight:'100vh', padding:'0 10%', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(20px)', transition:'all 0.8s ease-out' }}>
        <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.15em', color:'#4dabf7', textTransform:'uppercase', display:'block', marginBottom:16 }}>Adaptive Trading & Learning Autonomous System</span>
        <h1 style={{ fontSize:'clamp(48px, 6vw, 72px)', fontWeight:700, letterSpacing:'0.1em', color:'#f8f9fa', lineHeight:1.1, marginBottom:24 }}>ATLAS<span style={{ color:'#228be6' }}>.</span></h1>
        <p style={{ fontSize:'clamp(16px, 2vw, 20px)', color:'#f8f9fa', maxWidth:520, lineHeight:1.5, marginBottom:12 }}>The trading system that knows everything,<br/>understands everything, acts upon everything.</p>
        <p style={{ fontSize:14, color:'#adb5bd', maxWidth:480, lineHeight:1.6, marginBottom:48 }}>A bleeding-edge proprietary systematic trading research project combining multi-node autonomous learning with dynamic reflexivity detection. Built on a Parliament of specialist brains.</p>
        <div style={{ display:'flex', gap:48 }}>
          {[{value:'38',label:'Nodes'},{value:'6',label:'Brains'},{value:'21',label:'AI Agents'},{value:'318',label:'Tests'}].map(s => (
            <div key={s.label}>
              <div style={{ fontSize:32, fontWeight:700, color:'#4dabf7', lineHeight:1, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:9, fontWeight:600, letterSpacing:'0.12em', color:'#adb5bd', textTransform:'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <LandingFooter />
    </div>
  )
}
