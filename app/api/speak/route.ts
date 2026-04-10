import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

  if (!text || !OPENAI_API_KEY) {
    return NextResponse.json({ error: 'missing' }, { status: 400 })
  }

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'onyx',
        input: text,
        speed: 0.95,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('OpenAI TTS error:', err)
      return NextResponse.json({ error: err }, { status: 500 })
    }

    const audio = await res.arrayBuffer()
    return new NextResponse(audio, {
      headers: {
        'Content-Type':  'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (e) {
    console.error('speak route error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
