import { NextResponse } from 'next/server'
import { getSessionEmailFromCookies } from '@/lib/auth-session'

export async function GET() {
  const email = await getSessionEmailFromCookies()
  if (!email) {
    return NextResponse.json({ authenticated: false })
  }
  return NextResponse.json({ authenticated: true, email })
}
