import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_EMAIL_COOKIE } from '@/lib/auth-constants'

/**
 * Matched routes require `campus_session_email`. Unauthenticated users are sent to `/auth/login`
 * (including `/` — the marketing home is only shown after login).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(SESSION_EMAIL_COOKIE)?.value)

  if (pathname.startsWith('/auth/login')) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (!hasSession) {
    const login = new URL('/auth/login', request.url)
    login.searchParams.set('callbackUrl', pathname + request.nextUrl.search)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/found/:path*',
    '/lost/:path*',
    '/report/:path*',
    '/records/:path*',
    '/map/:path*',
    '/studio/:path*',
    '/auth/login',
  ],
}
