'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import ParticleBackground from '@/app/components/ParticleBackground'

interface Message { role: 'user' | 'assistant'; content: string }

export default function VoicePage() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const animRef      = useRef<number>(0)
  const speakingRef  = useRef(false)
  const listeningRef = useRef(false)
  const ampRef       = useRef(0)

  const [status,    setStatus]    = useState('INITIALISING')
  const [speaking,  setSpeaking]  = useState(false)
  const [listening, setListening] = useState(false)
  const [assembled, setAssembled] = useState(false)
  const [started,   setStarted]   = useState(false)
  const [history,   setHistory]   = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [lastMsg,   setLastMsg]   = useState('')

  // ── Ring Animation ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const RING_PARTICLES = 80
    const angles = Array.from({length: RING_PARTICLES}, (_, i) => ({
      angle:  (i / RING_PARTICLES) * Math.PI * 2,
      offset: Math.random() * 0.3,
      speed:  0.008 + Math.random() * 0.006,
      size:   1.2 + Math.random() * 1.8,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx  = canvas.width / 2
      const cy  = canvas.height / 2
      const t   = Date.now() / 1000
      const spk = speakingRef.current
      const lst = listeningRef.current
      const amp = ampRef.current

      // Base ring radius — reacts to voice
      const baseR = spk
        ? 70 + Math.sin(t * 8) * amp * 30
        : lst
        ? 62 + Math.sin(t * 5) * 8
        : 58 + Math.sin(t * 1.2) * 4

      angles.forEach(p => {
        // Rotate
        p.angle += p.speed * (spk ? 2.5 : lst ? 1.8 : 1.0)

        // Individual radius variation
        const r = baseR + Math.sin(t * 3 + p.offset * 10) * (spk ? amp * 20 : 5)

        const x = cx + Math.cos(p.angle) * r
        const y = cy + Math.sin(p.angle) * r

        // Color — blue idle, cyan listening, bright white speaking
        const color = spk
          ? `rgba(200, 220, 255, ${0.6 + amp * 0.4})`
          : lst
          ? `rgba(77, 171, 247, 0.9)`
          : `rgba(77, 171, 247, 0.6)`

        ctx.beginPath()
        ctx.arc(x, y, p.size * (spk ? 1.5 : 1), 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })

      // Inner glow
      const glowR = spk ? 28 + amp * 15 : lst ? 22 : 18
      const grd   = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR)
      grd.addColorStop(0, spk ? `rgba(180, 210, 255, ${0.7 + amp*0.3})` : 'rgba(77, 171, 247, 0.5)')
      grd.addColorStop(1, 'rgba(77, 171, 247, 0)')
      ctx.beginPath()
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()

      // Connection lines between nearby ring particles
      for (let i = 0; i < angles.length; i++) {
        const a1 = angles[i]
        const a2 = angles[(i + 1) % angles.length]
        const r1 = baseR + Math.sin(t * 3 + a1.offset * 10) * 5
        const r2 = baseR + Math.sin(t * 3 + a2.offset * 10) * 5
        const x1 = cx + Math.cos(a1.angle) * r1
        const y1 = cy + Math.sin(a1.angle) * r1
        const x2 = cx + Math.cos(a2.angle) * r2
        const y2 = cy + Math.sin(a2.angle) * r2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = spk
          ? `rgba(200, 220, 255, ${0.15 + amp * 0.2})`
          : `rgba(77, 171, 247, 0.08)`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    setTimeout(() => { setAssembled(true); setStatus('ATLAS ONLINE') }, 500)
    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // ── OpenAI TTS ──────────────────────────────────────────────────
  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return
    speakingRef.current = true
    setSpeaking(true)
    setStatus('ATLAS SPEAKING')

    let t = 0
    const iv = setInterval(() => {
      ampRef.current = 0.2 + Math.sin(t*4)*0.25 + Math.random()*0.35
      t += 0.15
    }, 40)

    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('speak failed')
      const blob  = await res.blob()
      const url   = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = audio.onerror = () => {
        clearInterval(iv)
        ampRef.current = 0; speakingRef.current = false
        setSpeaking(false); setStatus('ATLAS ONLINE')
        URL.revokeObjectURL(url)
      }
      await audio.play()
    } catch {
      clearInterval(iv)
      ampRef.current = 0; speakingRef.current = false
      setSpeaking(false); setStatus('ATLAS ONLINE')
    }
  }, [])

  // ── Send to ATLAS ────────────────────────────────────────────────
  const sendToATLAS = useCallback(async (text: string) => {
    if (!text.trim() || speaking) return
    setStatus('ATLAS THINKING')
    const newHistory: Message[] = [...history, { role: 'user', content: text }]
    setHistory(newHistory)
    setLastMsg(text)
    try {
      const res  = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: newHistory.slice(-6).map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      const raw  = data.response || 'Processing complete.'
      const resp = raw.replace(/\*\*/g,'').replace(/\*/g,'').replace(/#{1,6}\s/g,'').replace(/`/g,'')
      setHistory(prev => [...prev, { role: 'assistant', content: resp }])
      setLastMsg(resp)
      speak(resp)
    } catch {
      setStatus('CONNECTION ERROR')
      setTimeout(() => setStatus('ATLAS ONLINE'), 2000)
    }
  }, [history, speaking, speak])

  // ── Speech Recognition ───────────────────────────────────────────
  const startListening = useCallback(() => {
    if (speaking) return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setStatus('USE TEXT INPUT'); return }
    const r = new SR()
    r.lang = 'en-US'; r.continuous = false; r.interimResults = false
    r.onstart = () => { listeningRef.current = true; setListening(true); setStatus('LISTENING...') }
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      listeningRef.current = false; setListening(false); sendToATLAS(t)
    }
    r.onerror = r.onend = () => {
      listeningRef.current = false; setListening(false)
      if (!speaking) setStatus('ATLAS ONLINE')
    }
    r.start()
  }, [speaking, sendToATLAS])

  // ── Greeting ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!started) return
    const t = setTimeout(() => {
      const g = "I am ATLAS. Adaptive Trading and Learning Autonomous System. My nodes are active across equities, macro, and commodities. How can I assist you?"
      setHistory([{ role: 'assistant', content: g }])
      setLastMsg(g)
      speak(g)
    }, 600)
    return () => clearTimeout(t)
  }, [started])

  return (
    <div style={{ position:'relative', height:'calc(100vh - 64px)', background:'#050b14', overflow:'hidden', fontFamily:'Inter, sans-serif' }}>

      {/* Same particle background as other pages */}
      <ParticleBackground />

      {/* Ring canvas — centered */}
      <canvas ref={canvasRef} style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -55%)',
        width: 200, height: 200,
        zIndex: 2,
        opacity: assembled ? 1 : 0,
        transition: 'opacity 0.6s',
      }} />

      {/* Status */}
      <div style={{
        position: 'absolute',
        top: 'calc(50% - 160px)', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3, textAlign: 'center',
        opacity: assembled ? 1 : 0,
        transition: 'opacity 0.6s',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: speaking ? '#c8dcff' : listening ? '#4dabf7' : '#adb5bd',
          transition: 'color 0.3s',
        }}>{status}</div>
      </div>

      {/* Last message */}
      <div style={{
        position: 'absolute',
        top: 'calc(50% + 65px)', left: '50%',
        transform: 'translateX(-50%)',
        width: '65%', maxWidth: 460,
        zIndex: 3, textAlign: 'center',
        opacity: assembled ? 1 : 0,
        transition: 'opacity 0.6s',
      }}>
        {lastMsg && (
          <div style={{
            fontSize: 12, lineHeight: 1.7,
            color: speaking ? '#f8f9fa' : '#adb5bd',
            transition: 'color 0.3s',
          }}>
            {lastMsg.length > 180 ? lastMsg.slice(0, 180) + '...' : lastMsg}
          </div>
        )}
      </div>

      {/* Mic button */}
      <div style={{
        position: 'absolute', bottom: 90, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3, textAlign: 'center',
        opacity: assembled ? 1 : 0,
        transition: 'opacity 0.6s',
      }}>
        <button onClick={startListening} disabled={listening || speaking} style={{
          width: 64, height: 64, borderRadius: '50%',
          background: listening ? 'rgba(239,68,68,0.2)' : 'rgba(34,139,230,0.15)',
          border: `2px solid ${listening ? '#ef4444' : '#228be6'}`,
          cursor: listening || speaking ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: listening ? '0 0 20px rgba(239,68,68,0.4)' : 'none',
          transition: 'all 0.3s',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={listening ? '#ef4444' : '#4dabf7'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="11" rx="3"/>
            <path d="M5 10a7 7 0 0 0 14 0"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
            <line x1="8" y1="22" x2="16" y2="22"/>
          </svg>
        </button>
        <div style={{ marginTop: 6, fontSize: 9, color: '#adb5bd', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {listening ? 'Listening...' : 'Tap to speak'}
        </div>
      </div>

      {/* Stop button */}
      {speaking && (
        <button onClick={() => {
          speakingRef.current = false; ampRef.current = 0
          setSpeaking(false); setStatus('ATLAS ONLINE')
        }} style={{
          position: 'absolute', bottom: 103, left: 'calc(50% + 48px)',
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(245,158,11,0.2)', border: '2px solid #f59e0b',
          cursor: 'pointer', fontSize: 14, zIndex: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>⏸</button>
      )}

      {/* Text input */}
      <div style={{
        position: 'absolute', bottom: 18, left: '50%',
        transform: 'translateX(-50%)',
        width: '68%', maxWidth: 480,
        display: 'flex', gap: 8, zIndex: 3,
        opacity: assembled ? 1 : 0,
        transition: 'opacity 0.6s',
      }}>
        <input value={inputText} onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && inputText.trim() && !speaking) { sendToATLAS(inputText); setInputText('') } }}
          placeholder="Type to ATLAS..."
          style={{
            flex: 1, padding: '9px 16px', fontSize: 12,
            background: 'rgba(10,19,36,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, color: '#f8f9fa',
            fontFamily: 'Inter, sans-serif', outline: 'none',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#228be6')}
          onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
        <button onClick={() => { if (inputText.trim() && !speaking) { sendToATLAS(inputText); setInputText('') } }}
          style={{
            padding: '9px 18px', fontSize: 11, fontWeight: 600,
            background: '#228be6', color: '#fff',
            border: 'none', borderRadius: 24, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>Send</button>
      </div>

      {/* Start overlay */}
      {!started && assembled && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5,11,20,0.7)',
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#adb5bd', textTransform: 'uppercase', marginBottom: 24 }}>
            ATLAS VOICE INTERFACE
          </div>
          <button onClick={() => setStarted(true)} style={{
            padding: '14px 36px', fontSize: 13, fontWeight: 600,
            background: 'rgba(34,139,230,0.15)',
            border: '2px solid #228be6',
            borderRadius: 40, color: '#f8f9fa',
            cursor: 'pointer', letterSpacing: '0.08em',
            fontFamily: 'Inter, sans-serif',
          }}>Initialise ATLAS</button>
        </div>
      )}
    </div>
  )
}
