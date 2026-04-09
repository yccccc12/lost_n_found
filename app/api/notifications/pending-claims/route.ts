import { NextResponse } from 'next/server'
import { getSessionEmailFromCookies } from '@/lib/auth-session'
import { backendErrorMessage } from '@/lib/backend-error'

export async function GET() {
  const backendEndpoint = process.env.BACKEND_ENDPOINT
  if (!backendEndpoint) {
    return NextResponse.json(
      { error: 'BACKEND_ENDPOINT is not configured on the server.', items: [], count: 0 },
      { status: 500 },
    )
  }

  const sessionEmail = await getSessionEmailFromCookies()
  if (!sessionEmail) {
    return NextResponse.json({ items: [], count: 0, authenticated: false })
  }

  const base = backendEndpoint.endsWith('/') ? backendEndpoint : `${backendEndpoint}/`
  const url = new URL('items/owner/pending-claims', base)
  url.searchParams.set('email', sessionEmail)

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        {
          error: backendErrorMessage(data, 'Could not load notifications.'),
          items: [],
          count: 0,
          authenticated: true,
        },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      )
    }

    const items = Array.isArray(data?.items) ? data.items : []
    const count = typeof data?.count === 'number' ? data.count : items.length

    return NextResponse.json({
      items,
      count,
      authenticated: true,
    })
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach the backend.', items: [], count: 0, authenticated: true },
      { status: 502 },
    )
  }
}
