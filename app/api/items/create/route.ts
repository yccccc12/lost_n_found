import { NextResponse } from 'next/server'
import { backendErrorMessage } from '@/lib/backend-error'
import { getSessionEmailFromCookies } from '@/lib/auth-session'

export async function POST(request: Request) {
  const backendEndpoint = process.env.BACKEND_ENDPOINT
  if (!backendEndpoint) {
    return NextResponse.json(
      { error: 'BACKEND_ENDPOINT is not configured on the server.' },
      { status: 500 },
    )
  }

  const formData = await request.formData()
  // Do not trust client-supplied `email` for hashing; only the session cookie may set it.
  formData.delete('email')

  const sessionEmail = await getSessionEmailFromCookies()
  if (sessionEmail) {
    formData.set('email', sessionEmail)
  }

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
        { error: backendErrorMessage(data, 'Failed to submit report.') },
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
