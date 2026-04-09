'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useATLAS } from '@/app/hooks/useATLAS'
import ParticleBackground from '@/app/components/ParticleBackground'

const NAV = [
  {
    section: 'ATLAS TERMINAL',
    key: 'terminal',
    items: [
      { label: 'Dashboard',      href: '/dashboard'  },
      { label: 'Signals',        href: '/signals'    },
      { label: 'Parliament',     href: '/parliament' },
      { label: 'Surfaces',       href: '/surfaces'   },
      { label: 'Universe',       href: '/universe'   },
      { label: 'Trades',         href: '/trades'     },
      { label: 'History',        href: '/history'    },
      { label: 'Brief',          href: '/brief'      },
      { label: 'Briefs',         href: '/briefs'     },
      { label: 'Chief of Staff', href: '/chat'       },
    ]
  },
  {
    section: 'ANALYTICS',
    key: 'analytics',
    items: [
      { label: 'Compare',  href: '/compare',  external: true },
      { label: 'Research', href: '/research', external: true },
      { label: 'Market',   href: '/market',   external: true },
    ]
  },
]

const LANDING_PATHS = ['/landing', '/']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string,boolean>>({ terminal: false, analytics: false })
  const pathname = usePathname()
  const { data, connected } = useATLAS()
  const drawerRef = useRef<HTMLDivElement>(null)

  const isLanding = LANDING_PATHS.includes(pathname)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => { setOpen(false) }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const toggleSection = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const G = data?.risk?.G ?? 0
  const riskColor = G > 0.85 ? '#ef4444' : G > 0.6 ? '#f59e0b' : '#22c55e'

  // Landing page still shows navbar with hamburger

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ParticleBackground />

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,19,36,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        height: 64,
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 16,
      }}>

        {/* Hamburger */}
        <button onClick={() => setOpen(o => !o)} style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer', padding: '7px 8px',
          borderRadius: 4,
          display: 'flex', flexDirection: 'column', gap: 4,
          transition: 'border-color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#228be6')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
        >
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 16, height: 1.5,
              background: open ? '#4dabf7' : '#adb5bd',
              borderRadius: 1,
              transition: 'all 0.25s ease',
              transform: open
                ? i === 0 ? 'rotate(45deg) translate(4px, 4px)'
                : i === 2 ? 'rotate(-45deg) translate(4px, -4px)'
                : 'scaleX(0)'
                : 'none',
            }} />
          ))}
        </button>

        {/* Brand */}
        <Link href="/landing" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: 18, fontWeight: 700,
            letterSpacing: '0.1em', color: '#f8f9fa',
            fontFamily: 'Inter, sans-serif',
          }}>
            ATLAS<span style={{ color: '#228be6' }}>.</span>
          </span>
        </Link>

        {/* Divider + current page */}
        <div style={{
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          paddingLeft: 12, marginLeft: 4,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 500,
            letterSpacing: '0.1em', color: '#adb5bd',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
          }}>
            {pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
          </span>
        </div>

        {/* Right metrics */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 11, color: '#adb5bd' }}>
            G: <span style={{ color: riskColor, fontWeight: 600 }}>{G.toFixed(3)}</span>
          </span>
          <span style={{ fontSize: 11, color: '#4dabf7', fontWeight: 600 }}>
            {data?.parliament?.verdict ?? '--'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: connected ? '#22c55e' : '#ef4444',
              boxShadow: connected ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
            }} />
            <span style={{ fontSize: 10, color: '#adb5bd', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {connected ? 'Live' : 'Off'}
            </span>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5,11,20,0.7)',
          backdropFilter: 'blur(2px)',
          zIndex: 199,
        }} />
      )}

      {/* Drawer */}
      <div ref={drawerRef} style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 260,
        background: 'rgba(5,11,20,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        zIndex: 200,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>

        {/* Drawer header */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Link href="/landing" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: 18, fontWeight: 700,
              letterSpacing: '0.1em', color: '#f8f9fa',
              fontFamily: 'Inter, sans-serif',
            }}>
              ATLAS<span style={{ color: '#228be6' }}>.</span>
            </span>
          </Link>
        </div>

        {/* Nav sections */}
        <div style={{ padding: '8px 0', flex: 1 }}>
          {NAV.map(section => (
            <div key={section.key} style={{ marginBottom: 4 }}>

              {/* Section header — clickable to expand/collapse */}
              <button onClick={() => toggleSection(section.key)} style={{
                width: '100%', background: 'none', border: 'none',
                cursor: 'pointer', padding: '10px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{
                  fontSize: 9, fontWeight: 600,
                  letterSpacing: '0.12em', color: '#adb5bd',
                  textTransform: 'uppercase',
                  fontFamily: 'Inter, sans-serif',
                }}>{section.section}</span>
                <span style={{
                  fontSize: 10, color: '#adb5bd',
                  transition: 'transform 0.2s',
                  transform: expanded[section.key] ? 'rotate(180deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                }}>▾</span>
              </button>

              {/* Items — visible when expanded */}
              {expanded[section.key] && section.items.map(item => (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '9px 20px 9px 28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: isActive(item.href) ? 'rgba(34,139,230,0.1)' : 'transparent',
                    borderLeft: isActive(item.href) ? '2px solid #228be6' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                    onMouseEnter={e => {
                      if (!isActive(item.href))
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                    }}
                    onMouseLeave={e => {
                      if (!isActive(item.href))
                        (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <span style={{
                      fontSize: 12, fontWeight: isActive(item.href) ? 500 : 400,
                      color: isActive(item.href) ? '#f8f9fa' : '#adb5bd',
                      fontFamily: 'Inter, sans-serif',
                      letterSpacing: '0.02em',
                    }}>{item.label}</span>
                    {(item as any).external && (
                      <span style={{ fontSize: 9, color: '#adb5bd' }}>↗</span>
                    )}
                  </div>
                </Link>
              ))}

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 20px' }} />
            </div>
          ))}
        </div>

        {/* Drawer footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ fontSize: 10, color: '#adb5bd', marginBottom: 4 }}>
            Mode: <span style={{ color: '#f59e0b', fontWeight: 500 }}>PAPER</span>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(173,181,189,0.4)' }}>
            April 13 — IB goes live
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  )
}
