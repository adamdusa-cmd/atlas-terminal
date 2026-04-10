'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }
interface Particle {
  x: number; y: number; targetX: number; targetY: number
  homeX: number; homeY: number; vx: number; vy: number
  size: number; opacity: number; angle: number; speed: number
}

export default function VoicePage() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const animRef      = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const assembledRef = useRef(false)
  const speakingRef  = useRef(false)
  const listeningRef = useRef(false)
  const ampRef       = useRef(0)
  const micAmpRef    = useRef(0)

  const [status,    setStatus]    = useState('INITIALISING')
  const [speaking,  setSpeaking]  = useState(false)
  const [listening, setListening] = useState(false)
  const [assembled, setAssembled] = useState(false)
  const [history,   setHistory]   = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [lastMsg,   setLastMsg]   = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      const count = 600
      const cx = canvas.width / 2
      const cy = canvas.height / 2 - 64
      particlesRef.current = Array.from({ length: count }, (_, i) => {
        const homeX = Math.random() * canvas.width
        const homeY = Math.random() * canvas.height
        // Nebula distribution — exponential falloff from center
        const angle = Math.random() * Math.PI * 2
        const r     = Math.pow(Math.random(), 0.4) * 160  // exponential — dense core
        const tx    = cx + Math.cos(angle) * r
        const ty    = cy + Math.sin(angle) * r
        const dist  = r
        return {
          x: homeX, y: homeY, homeX, homeY,
          targetX: tx, targetY: ty,
          vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2,
          size: dist < 30
            ? 1.5 + Math.random()*3.0
            : dist < 80
            ? 0.8 + Math.random()*1.8
            : 0.3 + Math.random()*1.2,
          opacity: dist < 30
            ? 0.7 + Math.random()*0.3
            : dist < 80
            ? 0.3 + Math.random()*0.4
            : 0.08 + Math.random()*0.25,
          angle,
          speed: 0.0005 + Math.random()*0.002,
        }
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx  = canvas.width / 2
      const cy  = canvas.height / 2 - 64
      const t   = Date.now() / 1000
      const asm = assembledRef.current
      const spk = speakingRef.current
      const lst = listeningRef.current
      const amp = ampRef.current
      const mic = micAmpRef.current

      particlesRef.current.forEach((p, i) => {
        if (asm) {
          const baseAngle = p.angle + p.speed * t * 60
          const pulse = spk
            ? Math.sin(t*10 + p.angle*3) * amp * 50
            : lst ? Math.sin(t*6 + p.angle*2) * mic * 40
            : Math.sin(t*1.5 + p.angle) * 6
          // Nebula drift — particles drift slowly around their target position
          const baseR  = Math.hypot(p.targetX - cx, p.targetY - cy) || 50
          const drift  = Math.sin(t * 0.8 + p.angle * 3) * 4
          const expand = pulse * (baseR < 40 ? 0.3 : baseR < 80 ? 0.6 : 1.0)
          p.targetX = cx + Math.cos(p.angle + t*p.speed*20) * (baseR + expand + drift)
          p.targetY = cy + Math.sin(p.angle + t*p.speed*20) * (baseR + expand + drift)
          p.vx += (p.targetX - p.x) * 0.08
          p.vy += (p.targetY - p.y) * 0.08
          p.vx *= 0.75; p.vy *= 0.75
        } else {
          p.vx += (Math.random()-0.5)*0.02
          p.vy += (Math.random()-0.5)*0.02
          p.vx *= 0.98; p.vy *= 0.98
          if (p.x < 0) p.x = canvas.width
          if (p.x > canvas.width) p.x = 0
          if (p.y < 0) p.y = canvas.height
          if (p.y > canvas.height) p.y = 0
        }
        p.x += p.vx; p.y += p.vy

        const r  = spk ? 180+amp*75 : lst ? 77 : 34
        const g  = spk ? 210+amp*45 : lst ? 171 : 139
        const op = asm ? p.opacity*(spk?1.3:lst?1.1:0.85) : p.opacity*0.6

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size*(spk?1.4:1), 0, Math.PI*2)
        ctx.fillStyle = `rgba(${r},${g},247,${Math.min(op,1)})`
        ctx.fill()

        if (asm) {
          for (let j=i+1; j<Math.min(i+5,particlesRef.current.length); j++) {
            const p2 = particlesRef.current[j]
            const d  = Math.hypot(p.x-p2.x, p.y-p2.y)
            if (d < 50) {
              ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p2.x,p2.y)
              ctx.strokeStyle = `rgba(77,171,247,${0.10*(1-d/50)*(spk?2:1)})`
              ctx.lineWidth = 0.4; ctx.stroke()
            }
          }
        }
      })

      if (asm) {
        const gr = spk ? 30+amp*20 : lst ? 22 : 16
        const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,gr)
        grd.addColorStop(0, spk?`rgba(180,210,255,${0.8+amp*0.2})`:'rgba(77,171,247,0.7)')
        grd.addColorStop(1, 'rgba(77,171,247,0)')
        ctx.beginPath(); ctx.arc(cx,cy,gr,0,Math.PI*2)
        ctx.fillStyle = grd; ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    resize(); draw()
    window.addEventListener('resize', resize)
    setTimeout(() => { assembledRef.current=true; setAssembled(true); setStatus('ATLAS ONLINE') }, 700)
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [])

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return
    speakingRef.current = true
    setSpeaking(true)
    setStatus('ATLAS SPEAKING')

    // Amplitude simulation
    let t = 0
    const iv = setInterval(() => {
      ampRef.current = 0.2 + Math.sin(t*4)*0.2 + Math.random()*0.4
      t += 0.15
    }, 40)

    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('speak failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = audio.onerror = () => {
        clearInterval(iv)
        ampRef.current      = 0
        speakingRef.current = false
        setSpeaking(false)
        setStatus('ATLAS ONLINE')
        URL.revokeObjectURL(url)
      }
      await audio.play()
    } catch {
      // Fallback to Web Speech API
      clearInterval(iv)
      const utt = new SpeechSynthesisUtterance(text)
      utt.rate = 0.92; utt.pitch = 0.80
      utt.onend = utt.onerror = () => {
        ampRef.current = 0; speakingRef.current = false
        setSpeaking(false); setStatus('ATLAS ONLINE')
      }
      window.speechSynthesis.speak(utt)
    }
  }, [])

  const sendToATLAS = useCallback(async (text: string) => {
    if (!text.trim()||speaking) return
    setStatus('ATLAS THINKING')
    const newHistory: Message[] = [...history, {role:'user',content:text}]
    setHistory(newHistory); setLastMsg(text)
    try {
      const res  = await fetch('/api/intelligence', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message:text, history:newHistory.slice(-6).map(m=>({role:m.role,content:m.content})) })
      })
      const data = await res.json()
      const raw  = data.response || 'Processing complete.'
      const resp = raw.replace(/\*\*/g,'').replace(/\*/g,'').replace(/#{1,6}\s/g,'').replace(/`/g,'')
      setHistory(prev=>[...prev,{role:'assistant',content:resp}])
      setLastMsg(resp); speak(resp)
    } catch { setStatus('CONNECTION ERROR'); setTimeout(()=>setStatus('ATLAS ONLINE'),2000) }
  }, [history, speaking, speak])

  const startListening = useCallback(async () => {
    if (speaking) return
    const SR = (window as any).SpeechRecognition||(window as any).webkitSpeechRecognition
    if (!SR) { setStatus('USE TEXT INPUT'); return }
    const recognition = new SR()
    recognition.lang='en-US'; recognition.continuous=false; recognition.interimResults=false
    recognition.onstart = () => { listeningRef.current=true; setListening(true); setStatus('LISTENING...') }
    recognition.onresult = (e:any) => {
      const t = e.results[0][0].transcript
      listeningRef.current=false; micAmpRef.current=0; setListening(false); sendToATLAS(t)
    }
    recognition.onerror = recognition.onend = () => {
      listeningRef.current=false; micAmpRef.current=0; setListening(false)
      if (!speaking) setStatus('ATLAS ONLINE')
    }
    recognition.start()
  }, [speaking, sendToATLAS])

  useEffect(() => {
    const t = setTimeout(() => {
      const g = "I am ATLAS. Adaptive Trading and Learning Autonomous System. My nodes are active across equities, macro, and commodities. Speak or type — I am listening."
      setHistory([{role:'assistant',content:g}]); setLastMsg(g); speak(g)
    }, 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ position:'relative', height:'calc(100vh - 64px)', background:'#050b14', overflow:'hidden', fontFamily:'Inter, sans-serif' }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />

      {/* Status */}
      <div style={{ position:'absolute', top:'calc(50% - 200px)', left:'50%', transform:'translateX(-50%)', zIndex:10, textAlign:'center', opacity:assembled?1:0, transition:'opacity 0.6s' }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:speaking?'#c8dcff':listening?'#4dabf7':'#adb5bd', transition:'color 0.3s' }}>{status}</div>
      </div>

      {/* Last message */}
      <div style={{ position:'absolute', top:'calc(50% + 110px)', left:'50%', transform:'translateX(-50%)', width:'65%', maxWidth:460, zIndex:10, textAlign:'center', opacity:assembled?1:0, transition:'opacity 0.6s' }}>
        {lastMsg && (
          <div style={{ fontSize:12, lineHeight:1.7, color:speaking?'#f8f9fa':'#adb5bd', transition:'color 0.3s' }}>
            {lastMsg.length>180 ? lastMsg.slice(0,180)+'...' : lastMsg}
          </div>
        )}
      </div>

      {/* Mic button */}
      <div style={{ position:'absolute', bottom:90, left:'50%', transform:'translateX(-50%)', zIndex:10, textAlign:'center', opacity:assembled?1:0, transition:'opacity 0.6s' }}>
        <button onClick={startListening} disabled={listening||speaking} style={{
          width:70, height:70, borderRadius:'50%',
          background:listening?'rgba(239,68,68,0.25)':'rgba(34,139,230,0.15)',
          border:`2px solid ${listening?'#ef4444':'#228be6'}`,
          cursor:listening||speaking?'not-allowed':'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:26,
          boxShadow:listening?'0 0 24px rgba(239,68,68,0.5)':speaking?'0 0 24px rgba(34,139,230,0.3)':'none',
          transition:'all 0.3s',
        }}>{listening ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:listening?'#ef4444':'#4dabf7'}}>
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:'#4dabf7'}}>
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
          )}</button>
        <div style={{ marginTop:6, fontSize:9, color:'#adb5bd', letterSpacing:'0.1em', textTransform:'uppercase' }}>
          {listening?'Listening...':'Tap to speak'}
        </div>
      </div>

      {/* Stop */}
      {speaking && (
        <button onClick={()=>{ window.speechSynthesis.cancel(); speakingRef.current=false; ampRef.current=0; setSpeaking(false); setStatus('ATLAS ONLINE') }}
          style={{ position:'absolute', bottom:103, left:'calc(50% + 60px)', width:44, height:44, borderRadius:'50%', background:'rgba(245,158,11,0.2)', border:'2px solid #f59e0b', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>⏸</button>
      )}

      {/* Text input */}
      <div style={{ position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)', width:'68%', maxWidth:480, display:'flex', gap:8, zIndex:10, opacity:assembled?1:0, transition:'opacity 0.6s' }}>
        <input value={inputText} onChange={e=>setInputText(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'&&inputText.trim()&&!speaking){ sendToATLAS(inputText); setInputText('') } }}
          placeholder="Type to ATLAS..."
          style={{ flex:1, padding:'9px 16px', fontSize:12, background:'rgba(10,19,36,0.85)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, color:'#f8f9fa', fontFamily:'Inter, sans-serif', outline:'none' }}
          onFocus={e=>(e.currentTarget.style.borderColor='#228be6')}
          onBlur={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.08)')}
        />
        <button onClick={()=>{ if(inputText.trim()&&!speaking){ sendToATLAS(inputText); setInputText('') } }}
          style={{ padding:'9px 18px', fontSize:11, fontWeight:600, background:'#228be6', color:'#fff', border:'none', borderRadius:24, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Send</button>
      </div>
    </div>
  )
}
