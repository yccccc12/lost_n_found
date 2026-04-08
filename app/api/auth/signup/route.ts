import { NextResponse } from 'next/server'
import { z } from 'zod'
import { backendErrorMessage } from '@/lib/backend-error'
import { setSessionEmailCookie } from '@/lib/auth-session'

const authSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: Request) {
  const parsedBody = authSchema.safeParse(await request.json())

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? 'Invalid request payload' },
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

  const signupUrl = new URL('auth/signup', backendEndpoint).toString()

  try {
    const backendResponse = await fetch(signupUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedBody.data),
      cache: 'no-store',
    })

    const responseJson = await backendResponse.json()

    if (!backendResponse.ok || responseJson?.error) {
      return NextResponse.json(
        { error: backendErrorMessage(responseJson, 'Sign up failed') },
        { status: backendResponse.ok ? 400 : backendResponse.status },
      )
    }

    await setSessionEmailCookie(parsedBody.data.email)
    return NextResponse.json(responseJson)
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to backend authentication service.' },
      { status: 502 },
    )
  }
}