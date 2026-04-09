'use client'
import { useState, useEffect, useRef } from 'react'

const COMMODITIES_API = 'https://atlas-commodities-production.up.railway.app'

interface Message { role: 'user' | 'assistant'; content: string; timestamp: string }

export default function CommoditiesChat() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'ATLAS Commodities Chief of Staff online. I specialise in precious metals, energy, agricultural commodities, and industrial metals. Ask me about gold, oil, wheat, copper, or any commodity market.',
    timestamp: new Date().toISOString()
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role:'user', content:input.trim(), timestamp:new Date().toISOString() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${COMMODITIES_API}/api/chat`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message: userMsg.content, history: newMessages.slice(-10).map(m => ({role:m.role,content:m.content})) })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role:'assistant', content:data.response||'No response.', timestamp:new Date().toISOString() }])
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'Connection failed.', timestamp:new Date().toISOString() }])
    } finally { setLoading(false) }
  }

  const fmtTime = (ts: string) => { try { return new Date(ts).toLocaleTimeString('en-GB',{hour12:false}) } catch { return '' } }

  return (
    <div style={{ height:'calc(100vh - 64px)', display:'flex', flexDirection:'column', fontFamily:'Inter, sans-serif' }}>
      <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg, #f59e0b, #fcd34d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#000' }}>C</div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:'#f8f9fa' }}>Commodities Chief of Staff</div>
          <div style={{ fontSize:10, color:'#adb5bd' }}>Metals · Energy · Agricultural · Industrial</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12 }}>
        {messages.map((msg,i) => (
          <div key={i} style={{ display:'flex', justifyContent:msg.role==='user'?'flex-end':'flex-start', gap:8 }}>
            {msg.role==='assistant' && (
              <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg, #f59e0b, #fcd34d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#000' }}>C</div>
            )}
            <div style={{ maxWidth:'72%', padding:'10px 14px', borderRadius:msg.role==='user'?'12px 12px 2px 12px':'12px 12px 12px 2px', background:msg.role==='user'?'#228be6':'rgba(10,19,36,0.8)', border:msg.role==='assistant'?'1px solid rgba(255,255,255,0.1)':'none', color:'#f8f9fa' }}>
              <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:'pre-wrap' }}>{msg.content}</div>
              <div style={{ fontSize:10, marginTop:4, opacity:0.4, textAlign:msg.role==='user'?'right':'left' }}>{fmtTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg, #f59e0b, #fcd34d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#000' }}>C</div>
            <div style={{ padding:'10px 14px', background:'rgba(10,19,36,0.8)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px 12px 12px 2px' }}>
              <div style={{ display:'flex', gap:4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#f59e0b', animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', gap:10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter'){send()} }}
          placeholder="Ask about gold, oil, wheat, copper..."
          style={{ flex:1, padding:'10px 14px', fontSize:13, background:'rgba(10,19,36,0.8)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#f8f9fa', fontFamily:'Inter, sans-serif', outline:'none' }}
          onFocus={e => (e.currentTarget.style.borderColor='#f59e0b')}
          onBlur={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.1)')}
        />
        <button onClick={send} disabled={loading||!input.trim()} style={{ padding:'10px 20px', fontSize:12, fontWeight:600, background:loading||!input.trim()?'rgba(10,19,36,0.8)':'#f59e0b', color:loading||!input.trim()?'#adb5bd':'#000', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, cursor:loading||!input.trim()?'not-allowed':'pointer', fontFamily:'Inter, sans-serif' }}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
    </div>
  )
}
