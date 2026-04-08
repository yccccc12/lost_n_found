import { NextResponse } from 'next/server'
import { clearSessionEmailCookie } from '@/lib/auth-session'

export async function POST() {
  await clearSessionEmailCookie()
  return NextResponse.json({ message: 'Logged out' })
}
