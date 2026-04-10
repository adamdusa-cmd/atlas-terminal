import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res  = await fetch(
      'https://atlas-scheduler-production-a62e.up.railway.app/api/intelligence',
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
        signal:  AbortSignal.timeout(58000),
      }
    )
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Intelligence proxy error:', error)
    return NextResponse.json(
      { response: 'ATLAS is initialising — please try again in a moment.' },
      { status: 200 }
    )
  }
}
