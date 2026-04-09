import { NextResponse } from 'next/server'
import { backendErrorMessage } from '@/lib/backend-error'
import { getSessionEmailFromCookies } from '@/lib/auth-session'

export async function PUT(
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
  if (!sessionEmail) {
    return NextResponse.json(
      { error: 'You must be logged in to claim an item.' },
      { status: 401 }
    )
  }

  const base = backendEndpoint.endsWith('/') ? backendEndpoint : `${backendEndpoint}/`
  const url = new URL(`items/claim/${resolvedParams.id}`, base).toString()

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimer_email: sessionEmail }),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        { error: backendErrorMessage(data, 'Failed to claim item.') },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to the backend service.' },
      { status: 502 },
    )
  }
}
