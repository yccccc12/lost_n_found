import type { ItemEntry } from '@/lib/mock-items'

export type BackendItem = {
  _id: string
  name?: string
  description?: string | null
  location?: string | null
  event_date?: string | null
  created_at?: string
  image_urls?: string[]
}

function formatDisplayDate(raw: string | undefined | null): string {
  if (!raw) return '—'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toISOString().slice(0, 10)
}

/** Map a MongoDB item document to the card shape used across browse / search. */
export function backendItemToItemEntry(item: BackendItem): ItemEntry {
  const urls = item.image_urls
  const when = item.event_date ?? item.created_at ?? ''
  const firstUrl = urls?.find((u) => typeof u === 'string' && u.trim().length > 0)?.trim() ?? ''

  return {
    id: item._id,
    name: String(item.name ?? ''),
    description: String(item.description ?? ''),
    location: String(item.location ?? ''),
    date: formatDisplayDate(when),
    imageUrl: firstUrl,
  }
}

function sortEntriesNewestFirst(a: ItemEntry, b: ItemEntry): number {
  if (a.date === '—' && b.date === '—') return 0
  if (a.date === '—') return 1
  if (b.date === '—') return -1
  return b.date.localeCompare(a.date)
}

export type FetchItemsOutcome =
  | { ok: true; items: ItemEntry[] }
  | { ok: false; items: ItemEntry[]; message: string }

/** Server-only: load lost or found items from the FastAPI backend. */
export async function fetchItemsByStatus(
  status: 'lost' | 'found',
): Promise<FetchItemsOutcome> {
  const backendEndpoint = process.env.BACKEND_ENDPOINT?.trim()
  if (!backendEndpoint) {
    return {
      ok: false,
      items: [],
      message: 'BACKEND_ENDPOINT is not set. Add it to your environment to load live items.',
    }
  }

  const base = backendEndpoint.endsWith('/') ? backendEndpoint : `${backendEndpoint}/`
  const url = new URL(`items/${status}`, base).toString()

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data = (await res.json().catch(() => null)) as BackendItem[] | null

    if (!res.ok || !Array.isArray(data)) {
      return {
        ok: false,
        items: [],
        message: 'Could not load items from the server. Is the backend running?',
      }
    }

    const items = data.map(backendItemToItemEntry).sort(sortEntriesNewestFirst)
    return { ok: true, items }
  } catch {
    return {
      ok: false,
      items: [],
      message: 'Unable to reach the backend. Check the network and BACKEND_ENDPOINT.',
    }
  }
}

/** Detail page for a live record (MongoDB id). */
export function recordDetailHref(id: string): string {
  return `/records/${encodeURIComponent(id)}`
}
