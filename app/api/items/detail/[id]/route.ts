import { NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ error: 'Item id is required' }, { status: 400 })
  }

  const backendEndpoint = process.env.BACKEND_ENDPOINT
  if (!backendEndpoint) {
    return NextResponse.json(
      { error: 'BACKEND_ENDPOINT is not configured on the server.' },
      { status: 500 },
    )
  }

  const base = backendEndpoint.endsWith('/') ? backendEndpoint : `${backendEndpoint}/`
  const url = new URL(`items/detail/${encodeURIComponent(id)}`, base).toString()

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        { error: typeof data?.detail === 'string' ? data.detail : 'Item not found' },
        { status: res.status === 404 ? 404 : res.status >= 400 ? res.status : 502 },
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Unable to reach the backend.' }, { status: 502 })
  }
}
