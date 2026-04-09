import { NextResponse } from 'next/server'

export async function GET() {
  const backendEndpoint = process.env.BACKEND_ENDPOINT
  if (!backendEndpoint) {
    return NextResponse.json(
      { error: 'BACKEND_ENDPOINT is not configured.' },
      { status: 500 },
    )
  }

  const base = backendEndpoint.endsWith('/') ? backendEndpoint : `${backendEndpoint}/`
  const url = new URL(`items/`, base).toString()

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json().catch(() => [])

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch items from backend.' },
        { status: res.status || 502 },
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to the backend.' },
      { status: 502 },
    )
  }
}
