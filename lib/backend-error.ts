/** Map FastAPI / backend JSON errors to a single message for the UI. */
export function backendErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback
  const d = data as { detail?: unknown; message?: unknown; error?: unknown }
  if (typeof d.error === 'string') return d.error
  if (typeof d.message === 'string') return d.message
  const detail = d.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0] && typeof detail[0] === 'object' && 'msg' in detail[0]) {
    return String((detail[0] as { msg: string }).msg)
  }
  return fallback
}
