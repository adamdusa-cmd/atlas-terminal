'use client'
import { useState, useEffect, useRef } from 'react'
import { useATLAS } from '@/app/hooks/useATLAS'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  action?: string
  action_data?: any
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const SUGGESTIONS = [
  "What are you doing right now?",
  "Run a valuation on Hermès",
  "Analyse current market conditions",
  "What is your current risk level?",
  "Show me your active positions",
  "Analyse LVMH for me",
  "What does your morning brief say?",
  "Compare your Parliament verdict with current signals",
]

export default function IntelligencePage() {
  const { data, connected } = useATLAS()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const activeSuggestions = SUGGESTIONS.filter(s => !dismissed.has(s))
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const G = data?.risk?.G ?? 0
    const verdict = data?.parliament?.verdict ?? '--'
    const risk = data?.risk?.level ?? '--'
    setMessages([{
      role: 'assistant',
      content: `I am ATLAS — Adaptive Trading & Learning Autonomous System.\n\nCurrent state: G at ${G.toFixed(3)}, Parliament verdict ${verdict}, risk level ${risk}. My 38 nodes are active across 6 global regions.\n\nAsk me anything — market analysis, valuations, system state, or trading intelligence.`,
      timestamp: new Date().toISOString(),
    }])
  }, [])

  const send = async (msg?: string) => {
    const text = (msg || input).trim()
    if (!text || loading) return
    if (msg) setDismissed(prev => new Set([...prev, msg]))

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date().toISOString() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'No response.',
        timestamp: new Date().toISOString(),
        action: data.action,
        action_data: data.action_data,
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection failed — is FastAPI running?',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const fmtTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString('en-GB', { hour12: false }) } catch { return '' }
  }

  const fmtMarketCap = (n: number) => {
    if (n > 1e12) return `€${(n/1e12).toFixed(1)}T`
    if (n > 1e9) return `€${(n/1e9).toFixed(1)}B`
    return `€${(n/1e6).toFixed(0)}M`
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,19,36,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #228be6, #4dabf7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
            boxShadow: '0 0 12px rgba(34,139,230,0.4)',
          }}>A</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f8f9fa' }}>ATLAS Intelligence</div>
            <div style={{ fontSize: 10, color: '#adb5bd' }}>Adaptive Trading & Learning Autonomous System</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: connected ? '#22c55e' : '#ef4444',
            boxShadow: connected ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
          }} />
          <span style={{ fontSize: 10, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {connected ? 'Systems Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #228be6, #4dabf7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
                boxShadow: '0 0 8px rgba(34,139,230,0.3)',
              }}>A</div>
            )}
            <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: msg.role === 'user' ? '#228be6' : 'rgba(10,19,36,0.8)',
                border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                color: '#f8f9fa',
              }}>
                <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                <div style={{ fontSize: 10, marginTop: 4, opacity: 0.4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {fmtTime(msg.timestamp)}
                </div>
              </div>

              {/* Action card — market data */}
              {msg.action === 'market_data' && msg.action_data && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'rgba(10,19,36,0.9)',
                  border: '1px solid rgba(34,139,230,0.3)',
                }}>
                  <div style={{ fontSize: 11, color: '#4dabf7', fontWeight: 600, marginBottom: 8, letterSpacing: '0.06em' }}>
                    {msg.action_data.name} ({msg.action_data.ticker})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: 'Price', value: `€${msg.action_data.price}` },
                      { label: '1M Return', value: `${msg.action_data.month_return?.toFixed(2)}%`, color: msg.action_data.month_return >= 0 ? '#22c55e' : '#ef4444' },
                      { label: 'Sector', value: msg.action_data.sector },
                      { label: 'Market Cap', value: fmtMarketCap(msg.action_data.market_cap) },
                      { label: 'P/E Ratio', value: msg.action_data.pe_ratio?.toFixed(1) || 'N/A' },
                      { label: 'Revenue', value: fmtMarketCap(msg.action_data.revenue) },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: 9, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: (item as any).color || '#f8f9fa' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={msg.action_data.research_url} target="_blank" rel="noreferrer" style={{
                      padding: '5px 12px', fontSize: 10, fontWeight: 500,
                      background: '#228be6', color: '#fff',
                      borderRadius: 4, textDecoration: 'none',
                      letterSpacing: '0.04em',
                    }}>Deep Research ↗</a>
                    <a href={msg.action_data.compare_url} target="_blank" rel="noreferrer" style={{
                      padding: '5px 12px', fontSize: 10, fontWeight: 500,
                      background: 'transparent', color: '#adb5bd',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 4, textDecoration: 'none',
                    }}>Full Valuation ↗</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #228be6, #4dabf7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff',
            }}>A</div>
            <div style={{ padding: '10px 14px', background: 'rgba(10,19,36,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px 12px 12px 2px' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#4dabf7',
                    animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {activeSuggestions.length > 0 && (
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {activeSuggestions.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{
              padding: '5px 12px', fontSize: 11, cursor: 'pointer',
              background: 'rgba(10,19,36,0.7)', color: '#adb5bd',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget.style.borderColor = '#228be6'); (e.currentTarget.style.color = '#f8f9fa') }}
              onMouseLeave={e => { (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'); (e.currentTarget.style.color = '#adb5bd') }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', gap: 10, alignItems: 'flex-end',
        background: 'rgba(10,19,36,0.5)',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask ATLAS anything..."
          rows={2}
          style={{
            flex: 1, padding: '10px 14px', fontSize: 13,
            background: 'rgba(10,19,36,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: '#f8f9fa',
            resize: 'none', fontFamily: 'Inter, sans-serif',
            outline: 'none', lineHeight: 1.5,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#228be6')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          padding: '10px 20px', fontSize: 12, fontWeight: 600,
          background: loading || !input.trim() ? 'rgba(10,19,36,0.8)' : '#228be6',
          color: loading || !input.trim() ? '#adb5bd' : '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif',
          boxShadow: !loading && input.trim() ? '0 4px 14px rgba(34,139,230,0.3)' : 'none',
          transition: 'all 0.2s',
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
