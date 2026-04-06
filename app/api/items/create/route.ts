import { NextResponse } from 'next/server'

function errorMessageFromBackend(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Failed to submit report.'
  const d = data as { detail?: unknown; message?: unknown; error?: unknown }
  if (typeof d.error === 'string') return d.error
  if (typeof d.message === 'string') return d.message
  const detail = d.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0] && typeof detail[0] === 'object' && 'msg' in detail[0]) {
    return String((detail[0] as { msg: string }).msg)
  }
  return 'Failed to submit report.'
}

export async function POST(request: Request) {
  const backendEndpoint = process.env.BACKEND_ENDPOINT
  if (!backendEndpoint) {
    return NextResponse.json(
      { error: 'BACKEND_ENDPOINT is not configured on the server.' },
      { status: 500 },
    )
  }

  const formData = await request.formData()
  const base = backendEndpoint.endsWith('/') ? backendEndpoint : `${backendEndpoint}/`
  const url = new URL('items/create', base).toString()

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        { error: errorMessageFromBackend(data) },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to the reporting service.' },
      { status: 502 },
    )
  }
}
