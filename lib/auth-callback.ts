/**
 * Only allow same-origin relative paths to prevent open redirects after login.
 */
export function getSafeCallbackPath(raw: string | null | undefined, fallback = '/'): string {
  if (raw == null || typeof raw !== 'string') return fallback
  const t = raw.trim()
  if (t === '') return fallback
  if (!t.startsWith('/') || t.startsWith('//')) return fallback
  return t
}
