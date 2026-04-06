import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ATLAS Terminal',
  description: 'Adaptive Trading & Learning Autonomous System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', background: 'var(--atlas-bg)' }}>
        {children}
      </body>
    </html>
  )
}
