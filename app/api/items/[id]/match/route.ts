import { NextResponse } from 'next/server'
import { backendErrorMessage } from '@/lib/backend-error'
import { getSessionEmailFromCookies } from '@/lib/auth-session'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  
  const backendEndpoint = process.env.BACKEND_ENDPOINT
  if (!backendEndpoint) {
    return NextResponse.json(
      { error: 'BACKEND_ENDPOINT is not configured on the server.' },
      { status: 500 },
    )
  }

  const sessionEmail = await getSessionEmailFromCookies()

  const base = backendEndpoint.endsWith('/') ? backendEndpoint : `${backendEndpoint}/`
  const url = new URL(`items/match/${resolvedParams.id}`, base).toString()

  try {
    const body = await request.json().catch(() => ({}))
    
    // Attach the session email to the backend request securely
    if (sessionEmail) {
      body.finder_email = sessionEmail
    }
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        { error: backendErrorMessage(data, 'Failed to match item.') },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to the matching service.' },
      { status: 502 },
    )
  }
}
