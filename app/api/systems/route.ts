import { NextRequest, NextResponse } from 'next/server'

const SYSTEMS = {
  equities:    'https://atlas-scheduler-production-a62e.up.railway.app',
  macro:       'https://atlas-macro-production.up.railway.app',
  commodities: 'https://atlas-commodities-production.up.railway.app',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const system   = searchParams.get('system') as keyof typeof SYSTEMS
  const endpoint = searchParams.get('endpoint') || 'status'

  const baseUrl = SYSTEMS[system]
  if (!baseUrl) return NextResponse.json({ error: 'unknown system' }, { status: 400 })

  try {
    const res  = await fetch(`${baseUrl}/api/${endpoint}`, {
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
