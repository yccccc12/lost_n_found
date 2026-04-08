import { NextResponse } from 'next/server'
import { z } from 'zod'

const bodySchema = z.object({
  query: z.string().min(1, 'Enter a search description'),
})

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 },
    )
  }

  const backendEndpoint = process.env.BACKEND_ENDPOINT
  if (!backendEndpoint) {
    return NextResponse.json(
      { error: 'BACKEND_ENDPOINT is not configured on the server.' },
      { status: 500 },
    )
  }

  const url = new URL('ai/search', backendEndpoint.endsWith('/') ? backendEndpoint : `${backendEndpoint}/`).toString()

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: parsed.data.query }),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        { error: typeof data?.detail === 'string' ? data.detail : typeof data?.error === 'string' ? data.error : 'AI search failed' },
        { status: res.status >= 400 ? res.status : 502 },
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach the backend AI service.' },
      { status: 502 },
    )
  }
}
