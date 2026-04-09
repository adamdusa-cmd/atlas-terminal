'use client'
import Link from 'next/link'
import { Mail, MapPin } from 'lucide-react'

export default function LandingFooter() {
  return (
    <footer style={{
      background: '#0a1324',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '5rem 0 2rem',
      position: 'relative',
      zIndex: 1,
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
          gap: '4rem',
          marginBottom: '4rem',
        }}>

          {/* Brand */}
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1rem', color: '#f8f9fa' }}>
              ATLAS<span style={{ color: '#228be6' }}>.</span>
            </h2>
            <p style={{ color: '#adb5bd', lineHeight: 1.6, fontSize: '0.95rem', maxWidth: 350 }}>
              The trading system that knows everything, understands everything, acts upon everything. Adaptive Trading & Learning Autonomous System.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', color: '#f8f9fa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Navigation</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Terminal', href: '/dashboard' },
                { label: 'Signals', href: '/signals' },
                { label: 'Parliament', href: '/parliament' },
                { label: 'Chief of Staff', href: '/chat' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} style={{ color: '#adb5bd', fontSize: '0.95rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#4dabf7')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#adb5bd')}
                  >{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', color: '#f8f9fa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Legal</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['Terms & Conditions', 'Privacy Policy', 'Cookie Policy', 'Regulatory Disclosures'].map(item => (
                <li key={item}>
                  <a href="#" style={{ color: '#adb5bd', fontSize: '0.95rem', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#4dabf7')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#adb5bd')}
                  >{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', color: '#f8f9fa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Contact Info</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#adb5bd', fontSize: '0.95rem' }}>
                <Mail size={16} color="#228be6" />
                <a href="mailto:adam.dusa@gmail.com" style={{ color: '#adb5bd', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4dabf7')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#adb5bd')}
                >adam.dusa@gmail.com</a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#adb5bd', fontSize: '0.95rem' }}>
                <MapPin size={16} color="#228be6" />
                <span>London, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '2rem',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center', gap: '1rem',
        }}>
          <p style={{ color: '#adb5bd', fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} ATLAS. All rights reserved.
          </p>
          <p style={{ color: '#adb5bd', fontSize: '0.8rem', opacity: 0.6, maxWidth: 600 }}>
            Information presented on this website is for conceptual research purposes only and does not constitute financial advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
