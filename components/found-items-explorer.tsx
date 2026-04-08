'use client'

import { useCallback, useState } from 'react'
import { AlertCircle, Sparkles } from 'lucide-react'

import { ItemCard } from '@/components/item-card'
import { SemanticSearchBar } from '@/components/semantic-search-bar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { foundItems, type ItemEntry } from '@/lib/mock-items'
import { cn } from '@/lib/utils'

type AISearchResult = {
  item_id: string
  name: string
  score: number
  reason: string
}

type BackendItem = {
  _id: string
  name?: string
  description?: string | null
  location?: string | null
  event_date?: string | null
  created_at?: string
  image_urls?: string[]
}

function backendItemToEntry(item: BackendItem): ItemEntry {
  const urls = item.image_urls
  return {
    id: item._id,
    name: String(item.name ?? ''),
    description: String(item.description ?? ''),
    location: String(item.location ?? ''),
    date: String(item.event_date ?? item.created_at ?? ''),
    imageUrl:
      urls && urls.length > 0
        ? urls[0]
        : `https://picsum.photos/seed/${encodeURIComponent(item._id)}/400/280`,
  }
}

function aiOnlyEntry(r: AISearchResult): ItemEntry {
  return {
    id: r.item_id,
    name: r.name,
    description: 'Details will load when the item record is available.',
    location: '—',
    date: '—',
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(r.item_id)}/400/280`,
  }
}

/** Demo catalog uses ids like `f1`; live MongoDB ids are 24-char hex — detail page is mock-only for now. */
function detailHrefForFoundItem(id: string): string | undefined {
  const inDemoCatalog = foundItems.some((i) => i.id === id)
  return inDemoCatalog ? `/found/${id}` : undefined
}

export function FoundItemsExplorer() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'browse' | 'ai'>('browse')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiRows, setAiRows] = useState<{ entry: ItemEntry; ai: AISearchResult }[]>([])

  const runSearch = useCallback(async () => {
    const q = query.trim()
    if (!q) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Search failed')
      }

      const results = (data.results ?? []) as AISearchResult[]
      if (results.length === 0) {
        setMode('ai')
        setAiRows([])
        return
      }

      const rows = await Promise.all(
        results.map(async (ai) => {
          try {
            const dRes = await fetch(`/api/items/detail/${encodeURIComponent(ai.item_id)}`)
            if (!dRes.ok) {
              return { entry: aiOnlyEntry(ai), ai }
            }
            const raw = (await dRes.json()) as BackendItem
            return { entry: backendItemToEntry(raw), ai }
          } catch {
            return { entry: aiOnlyEntry(ai), ai }
          }
        }),
      )

      setAiRows(rows)
      setMode('ai')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [query])

  const clearAi = useCallback(() => {
    setMode('browse')
    setAiRows([])
    setError(null)
  }, [])

  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-4 rounded-2xl border-2 border-black/10 bg-muted/20 p-4 sm:p-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-white px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-black">
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
              AI match
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Describe what you lost in your own words. We rank found items by meaning, not only keywords.
          </p>
        </div>
        <SemanticSearchBar
          value={query}
          onChange={setQuery}
          onSubmit={runSearch}
          disabled={loading}
          className="max-w-none"
        />
        <p className="text-xs text-muted-foreground/80">
          Press{' '}
          <kbd className="rounded border border-black/20 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
            Enter
          </kbd>{' '}
          to search
        </p>
      </div>

      {error ? (
        <Alert variant="destructive" className="border-2 border-black">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Search unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-black/30 bg-muted/30 px-4 py-6">
          <Spinner className="h-5 w-5 text-foreground" />
          <p className="text-sm font-medium text-foreground">Matching your description to found items…</p>
        </div>
      ) : null}

      {mode === 'ai' && !loading ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-black">Results for your search</h2>
            <button
              type="button"
              onClick={clearAi}
              className="rounded-full border-2 border-black bg-white px-4 py-1.5 text-sm font-bold text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
            >
              Back to all items
            </button>
          </div>

          {aiRows.length === 0 ? (
            <p className="max-w-xl text-muted-foreground">
              No strong matches yet. Try a different description (e.g. the type of object, color, or where you think you lost it).
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {aiRows.map(({ entry, ai }) => (
                <li key={ai.item_id} className="flex flex-col gap-3">
                  <div className="flex justify-end">
                    <Badge
                      variant="outline"
                      className="border-2 border-black bg-amber-100 font-black text-black"
                    >
                      {Math.round(ai.score * 100)}% match
                    </Badge>
                  </div>
                  <ItemCard item={entry} href={detailHrefForFoundItem(entry.id)} />
                  <p
                    className={cn(
                      'rounded-xl border-2 border-black bg-white px-3 py-2.5 text-sm leading-snug text-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)]',
                    )}
                  >
                    <span className="font-bold text-black">Why this matched: </span>
                    {ai.reason}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {mode === 'browse' && !loading ? (
        <>
          <p className="max-w-2xl text-muted-foreground">
            Items turned in to campus staff or community members. Use AI match above to search by description;
            the grid below is demo inventory for browsing.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {foundItems.map((item) => (
              <ItemCard key={item.id} item={item} href={`/found/${item.id}`} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
