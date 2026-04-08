'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useATLAS } from '@/app/hooks/useATLAS'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ChatPage() {
  const { data, connected, lastUpdate } = useATLAS()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Greeting on load
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Good ${getTimeOfDay()}. I have full situational awareness of the ATLAS system. G is currently at ${data.risk?.G?.toFixed(3) ?? '--'}, Parliament verdict is ${data.parliament?.verdict ?? '--'}. What would you like to know?`,
      timestamp: new Date().toISOString()
    }])
  }, [])

  function getTimeOfDay() {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 17) return 'afternoon'
    return 'evening'
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: newMessages.slice(-10).map(m => ({
            role: m.role, content: m.content
          }))
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'No response.',
        timestamp: new Date().toISOString()
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection failed — is FastAPI running?',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const suggestions = [
    "What is the current risk level?",
    "Why did Parliament vote the way it did?",
    "What are the active positions?",
    "Is G approaching the circuit breaker?",
    "What does the morning brief say?",
    "Should I be concerned about VPIN?",
  ]

  const fmtTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString('en-GB', { hour12: false }) }
    catch { return '' }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--atlas-border)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/" style={{ color: 'var(--atlas-muted)', fontSize: 11, textDecoration: 'none' }}>← Dashboard</Link>
        <span style={{ color: 'var(--atlas-text)', fontSize: 13, fontWeight: 600 }}>Global Chief of Staff</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? 'var(--atlas-green)' : 'var(--atlas-amber)' }} />
          <span className="atlas-label">{connected ? 'Live context' : 'Disconnected'}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <span className="atlas-label">G: <span style={{ color: (data.risk?.G ?? 0) > 0.6 ? 'var(--atlas-red)' : 'var(--atlas-green)' }}>{data.risk?.G?.toFixed(3) ?? '--'}</span></span>
          <span className="atlas-label">Parliament: <span style={{ color: 'var(--atlas-accent)' }}>{data.parliament?.verdict ?? '--'}</span></span>
          <span className="atlas-label">Risk: <span style={{ color: 'var(--atlas-amber)' }}>{data.risk?.level ?? '--'}</span></span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: 8,
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--atlas-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>CS</div>
            )}
            <div style={{
              maxWidth: '72%',
              padding: '8px 12px',
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.role === 'user' ? 'var(--atlas-accent)' : 'var(--atlas-surface)',
              border: msg.role === 'assistant' ? '1px solid var(--atlas-border)' : 'none',
              color: msg.role === 'user' ? '#fff' : 'var(--atlas-text)',
            }}>
              <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              <div style={{ fontSize: 10, marginTop: 4, opacity: 0.5, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{fmtTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--atlas-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>CS</div>
            <div style={{ padding: '8px 12px', background: 'var(--atlas-surface)', border: '1px solid var(--atlas-border)', borderRadius: '12px 12px 12px 2px' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--atlas-accent)',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — only show when no conversation yet */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)} style={{
              padding: '4px 10px', fontSize: 11, cursor: 'pointer',
              background: 'var(--atlas-surface)', color: 'var(--atlas-muted)',
              border: '1px solid var(--atlas-border)', borderRadius: 20,
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: 12, borderTop: '1px solid var(--atlas-border)',
        display: 'flex', gap: 8, alignItems: 'flex-end',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask the Chief of Staff anything about ATLAS..."
          rows={2}
          style={{
            flex: 1, padding: '8px 12px', fontSize: 13,
            background: 'var(--atlas-surface)',
            border: '1px solid var(--atlas-border)',
            borderRadius: 8, color: 'var(--atlas-text)',
            resize: 'none', fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          padding: '8px 16px', fontSize: 12, fontWeight: 600,
          background: loading || !input.trim() ? 'var(--atlas-surface)' : 'var(--atlas-accent)',
          color: loading || !input.trim() ? 'var(--atlas-muted)' : '#fff',
          border: '1px solid var(--atlas-border)', borderRadius: 8,
          cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
        }}>
          {loading ? '...' : 'Send'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
