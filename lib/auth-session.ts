import { cookies } from 'next/headers'
import { SESSION_EMAIL_COOKIE } from '@/lib/auth-constants'

export { SESSION_EMAIL_COOKIE }

const maxAgeSeconds = 60 * 60 * 24 * 30 // 30 days

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

export async function setSessionEmailCookie(email: string) {
  const trimmed = email.trim()
  if (!trimmed) return
  const store = await cookies()
  store.set(SESSION_EMAIL_COOKIE, trimmed, cookieOptions())
}

export async function getSessionEmailFromCookies(): Promise<string | null> {
  const store = await cookies()
  const v = store.get(SESSION_EMAIL_COOKIE)?.value
  return v?.trim() || null
}

export async function clearSessionEmailCookie() {
  const store = await cookies()
  store.delete(SESSION_EMAIL_COOKIE)
}
