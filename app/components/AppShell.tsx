'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useATLAS } from '@/app/hooks/useATLAS'

const NAV = [
  {
    section: 'ATLAS TERMINAL',
    items: [
      { label: 'Dashboard',      href: '/',          icon: '◈' },
      { label: 'Signals',        href: '/signals',   icon: '▲' },
      { label: 'Parliament',     href: '/parliament',icon: '⬡' },
      { label: 'Surfaces',       href: '/surfaces',  icon: '◉' },
      { label: 'Universe',       href: '/universe',  icon: '◎' },
      { label: 'Trades',         href: '/trades',    icon: '◆' },
      { label: 'History',        href: '/history',   icon: '▸' },
      { label: 'Brief',          href: '/brief',     icon: '◇' },
      { label: 'Briefs',         href: '/briefs',    icon: '≡' },
      { label: 'Chief of Staff', href: '/chat',      icon: '✦' },
    ]
  },
  {
    section: 'ANALYTICS',
    items: [
      { label: 'Compare',        href: '/compare',   icon: '⇄', external: true },
      { label: 'Research',       href: '/research',  icon: '◐', external: true },
      { label: 'Market',         href: '/market',    icon: '⊞', external: true },
    ]
  },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { data, connected } = useATLAS()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const G = data?.risk?.G ?? 0
  const riskColor = G > 0.85 ? 'var(--atlas-red)'
    : G > 0.6 ? 'var(--atlas-amber)'
    : 'var(--atlas-green)'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        height: 48,
        background: 'var(--atlas-bg)',
        borderBottom: '1px solid var(--atlas-border)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 12,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Hamburger */}
        <button onClick={() => setOpen(o => !o)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 6px', display: 'flex', flexDirection: 'column',
          gap: 4, borderRadius: 4,
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 18, height: 2,
              background: open ? 'var(--atlas-accent)' : 'var(--atlas-text)',
              borderRadius: 1,
              transition: 'all 0.2s',
              transform: open
                ? i === 0 ? 'rotate(45deg) translate(4px, 4px)'
                : i === 2 ? 'rotate(-45deg) translate(4px, -4px)'
                : 'scaleX(0)'
                : 'none',
            }} />
          ))}
        </button>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--atlas-accent)' }}>ATLAS</span>
          <span style={{ fontSize: 10, color: 'var(--atlas-muted)', letterSpacing: '0.06em' }}>
            {pathname === '/' ? 'TERMINAL'
              : pathname.startsWith('/compare') ? 'COMPARE'
              : pathname.startsWith('/research') ? 'RESEARCH'
              : pathname.startsWith('/market') ? 'MARKET'
              : pathname.startsWith('/chat') ? 'CHIEF OF STAFF'
              : pathname.replace('/', '').toUpperCase()}
          </span>
        </Link>

        {/* Right side status */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--atlas-muted)' }}>
            G: <span style={{ color: riskColor, fontWeight: 600 }}>{G.toFixed(3)}</span>
          </span>
          <span style={{ fontSize: 11, color: 'var(--atlas-muted)' }}>
            <span style={{ color: 'var(--atlas-accent)', fontWeight: 600 }}>{data?.parliament?.verdict ?? '--'}</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: connected ? 'var(--atlas-green)' : 'var(--atlas-red)',
            }} />
            <span style={{ fontSize: 10, color: 'var(--atlas-muted)' }}>{connected ? 'LIVE' : 'OFF'}</span>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 199, transition: 'opacity 0.2s',
        }} />
      )}

      {/* Drawer */}
      <div ref={drawerRef} style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 240,
        background: 'var(--atlas-bg)',
        borderRight: '1px solid var(--atlas-border)',
        zIndex: 200,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Drawer header */}
        <div style={{
          height: 48, display: 'flex', alignItems: 'center',
          padding: '0 16px', borderBottom: '1px solid var(--atlas-border)',
          gap: 8,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--atlas-accent)' }}>ATLAS</span>
          <span style={{ fontSize: 10, color: 'var(--atlas-muted)', letterSpacing: '0.06em' }}>NAVIGATION</span>
        </div>

        {/* Nav sections */}
        <div style={{ padding: '8px 0', flex: 1 }}>
          {NAV.map(section => (
            <div key={section.section} style={{ marginBottom: 8 }}>
              <div style={{
                padding: '8px 16px 4px',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                color: 'var(--atlas-muted)',
              }}>{section.section}</div>
              {section.items.map(item => (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '8px 16px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: isActive(item.href) ? 'rgba(99,102,241,0.12)' : 'transparent',
                    borderLeft: isActive(item.href) ? '2px solid var(--atlas-accent)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 12, color: isActive(item.href) ? 'var(--atlas-accent)' : 'var(--atlas-muted)', width: 16 }}>{item.icon}</span>
                    <span style={{
                      fontSize: 12, fontWeight: isActive(item.href) ? 600 : 400,
                      color: isActive(item.href) ? 'var(--atlas-text)' : 'var(--atlas-muted)',
                    }}>{item.label}</span>
                    {(item as any).external && (
                      <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--atlas-muted)' }}>↗</span>
                    )}
                  </div>
                </Link>
              ))}
              <div style={{ height: 1, background: 'var(--atlas-border)', margin: '4px 16px' }} />
            </div>
          ))}
        </div>

        {/* Drawer footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--atlas-border)',
          fontSize: 10, color: 'var(--atlas-muted)',
        }}>
          <div>Mode: <span style={{ color: 'var(--atlas-amber)' }}>PAPER</span></div>
          <div>April 13 — IB goes live</div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  )
}
