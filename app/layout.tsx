import type { Metadata } from 'next'
import './globals.css'
import AppShell from './components/AppShell'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ATLAS Terminal',
  description: 'Adaptive Trading & Learning Autonomous System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
