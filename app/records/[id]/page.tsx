'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CampusShell } from '@/components/campus-shell'
import { BlockchainReceipt } from '@/components/blockchain-receipt'
import { ItemDetailHero } from '@/components/item-detail-hero'
import { ItemDetailsPageTitle } from '@/components/item-details-page-title'
import { toast } from '@/hooks/use-toast'

const toastBrutalist =
  'border-2 border-black bg-white text-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl'

type RecordDoc = {
  _id: string
  name?: string
  description?: string | null
  location?: string | null
  category?: string | null
  event_date?: string | null
  created_at?: string
  status?: string
  owner_email?: string | null
  finder_email?: string | null
  image_urls?: string[] | null
  tx_hash?: string | null
  claim_tx_hash?: string | null
  matched_tx_hash?: string | null
}

export default function RecordDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [record, setRecord] = useState<RecordDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [claimLoading, setClaimLoading] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [showBlockchainDetails, setShowBlockchainDetails] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setSessionEmail(data.email)
        }
      })
      .catch((err) => console.error('Session error:', err))
  }, [])

  useEffect(() => {
    if (!id || typeof id !== 'string') return

    fetch(`/api/items/detail/${encodeURIComponent(id)}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error && data._id) {
          setRecord(data as RecordDoc)
        } else {
          setRecord(null)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching record:', err)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    setShowBlockchainDetails(false)
  }, [id])

  async function handleFoundThisItem() {
    if (!record?._id) return
    if (!sessionEmail?.trim()) {
      const returnPath =
        typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : `/records/${record._id}`
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(returnPath)}`)
      return
    }
    setMatchLoading(true)
    try {
      const res = await fetch(`/api/items/${record._id}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'Could not record match',
          description:
            typeof data?.error === 'string' ? data.error : 'Could not record the match on-chain.',
        })
        return
      }
      const refreshed = await fetch(`/api/items/detail/${encodeURIComponent(record._id)}`, {
        credentials: 'include',
      }).then((r) => r.json())
      if (refreshed && !refreshed.error && refreshed._id) {
        setRecord(refreshed as RecordDoc)
      } else {
        setRecord({
          ...record,
          status: 'found',
          matched_tx_hash: typeof data.tx_hash === 'string' ? data.tx_hash : record.matched_tx_hash,
        })
      }
      toast({
        className: toastBrutalist,
        title: 'Match recorded',
        description:
          'A blockchain record was created and this listing is now marked as found.',
        duration: 6000,
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Connection error',
        description: 'Could not connect to the server. Try again.',
      })
    } finally {
      setMatchLoading(false)
    }
  }

  async function handleClaim() {
    if (!record?._id) return
    setClaimLoading(true)
    try {
      const res = await fetch(`/api/items/${record._id}/claim`, {
        method: 'PUT',
        credentials: 'include',
      })
      if (res.ok) {
        const refreshed = await fetch(`/api/items/detail/${encodeURIComponent(record._id)}`, {
          credentials: 'include',
        }).then((r) => r.json())
        if (refreshed && !refreshed.error && refreshed._id) {
          setRecord(refreshed as RecordDoc)
        } else {
          setRecord({ ...record, status: 'claimed' })
        }
        toast({
          className: toastBrutalist,
          title: 'Successfully claimed!',
          description: 'This listing is now marked as claimed on-chain.',
          duration: 6000,
        })
      } else {
        const data = await res.json().catch(() => ({}))
        toast({
          variant: 'destructive',
          title: 'Could not claim',
          description:
            typeof data?.error === 'string' ? data.error : 'Failed to claim item.',
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Could not claim',
        description: 'Something went wrong while claiming. Try again.',
      })
    } finally {
      setClaimLoading(false)
    }
  }

  const backHref =
    record?.status === 'found' || record?.status === 'claimed'
      ? '/browse?type=found'
      : '/browse?type=lost'

  if (loading) {
    return (
      <CampusShell title="Item Details" showBack backHref="/browse">
        <div className="flex items-center justify-center py-20">
          <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading…</p>
        </div>
      </CampusShell>
    )
  }

  if (!record) {
    return (
      <CampusShell showBack backHref="/records" titleSlot={<ItemDetailsPageTitle />}>
        <div className="space-y-4 py-10 text-center">
          <p className="text-lg font-medium text-destructive">We couldn&apos;t find this item.</p>
          <Button
            variant="outline"
            className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            onClick={() => router.push('/browse')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to browse
          </Button>
        </div>
      </CampusShell>
    )
  }

  const ownerEmailRaw = record.owner_email?.trim()
  const finderEmailRaw = record.finder_email?.trim()
  const isOwner = Boolean(
    sessionEmail && ownerEmailRaw && sessionEmail.trim().toLowerCase() === ownerEmailRaw.toLowerCase(),
  )
  const isFinder = Boolean(
    sessionEmail && finderEmailRaw && sessionEmail.trim().toLowerCase() === finderEmailRaw.toLowerCase(),
  )
  const canClaim = isOwner && record.status === 'found'
  const isLost = record.status === 'lost'

  const eventLabel = record.status === 'found' || record.status === 'claimed' ? 'Found date (approx.)' : 'Lost date (approx.)'

  const title = record.name?.trim() || 'Untitled item'

  let ownerDisplay: string | null = null
  if (ownerEmailRaw) {
    const session = sessionEmail?.trim()
    if (session && session.toLowerCase() === ownerEmailRaw.toLowerCase()) {
      ownerDisplay = 'you'
    } else {
      ownerDisplay = ownerEmailRaw
    }
  }

  let finderDisplay: string | null = null
  if (finderEmailRaw && (record.status === 'found' || record.status === 'claimed')) {
    const session = sessionEmail?.trim()
    if (session && session.toLowerCase() === finderEmailRaw.toLowerCase()) {
      finderDisplay = 'you'
    } else {
      finderDisplay = finderEmailRaw
    }
  }

  return (
    <CampusShell
      showBack
      backHref={backHref}
      titleSlot={<ItemDetailsPageTitle />}
    >
      <div className="mx-auto max-w-5xl space-y-10 px-0 sm:px-1">
        <div className="rounded-2xl border-4 border-black bg-gradient-to-br from-orange-50/50 via-white/95 to-sky-50/40 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:p-5">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Actions</p>
          <div className="flex flex-wrap items-center justify-start gap-3">
            {isLost && !isOwner ? (
              <Button
                type="button"
                onClick={handleFoundThisItem}
                disabled={matchLoading}
                className="h-11 rounded-xl border-2 border-black bg-amber-400 px-5 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:bg-amber-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-70"
              >
                {matchLoading ? 'Recording…' : 'I found this item'}
              </Button>
            ) : null}

            <Button
              type="button"
              variant={showBlockchainDetails ? 'default' : 'outline'}
              onClick={() => setShowBlockchainDetails((v) => !v)}
              className={`h-11 rounded-xl border-2 border-black px-5 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] ${
                showBlockchainDetails
                  ? 'bg-slate-900 text-white hover:bg-slate-900'
                  : 'bg-white/95 hover:bg-white'
              }`}
              aria-pressed={showBlockchainDetails}
            >
              {showBlockchainDetails ? (
                <>
                  <FileText className="mr-2 h-4 w-4" aria-hidden />
                  Item details
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" aria-hidden />
                  Blockchain details
                </>
              )}
            </Button>

            {canClaim ? (
              <Button
                onClick={handleClaim}
                disabled={claimLoading}
                variant="outline"
                className="h-11 rounded-xl border-2 border-emerald-800 bg-emerald-50 px-5 font-bold text-emerald-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:bg-emerald-100/90 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
              >
                {claimLoading ? 'Confirming…' : 'Mark as claimed'}
              </Button>
            ) : null}
          </div>
        </div>

        {showBlockchainDetails ? (
          <section aria-label="Blockchain verification" className="scroll-mt-24">
            <BlockchainReceipt
              txHash={record.tx_hash || null}
              matchTxHash={record.matched_tx_hash || null}
              itemId={record._id}
              itemName={record.name}
              reportType={(record.status as 'lost' | 'found' | 'claimed') || null}
              eventDate={record.event_date || null}
              reportedAt={record.created_at || null}
              category={record.category || null}
              description={record.description || null}
              location={record.location || null}
              imageUrls={record.image_urls?.length ? record.image_urls : null}
              closingTxHash={record.claim_tx_hash || null}
            />
          </section>
        ) : (
          <>
            <div className="rounded-xl border-2 border-dashed border-black/25 bg-muted/30 px-4 py-3.5 text-left sm:px-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-black uppercase tracking-wide text-foreground/70">Tip · </span>
                {isLost ? (
                  <>
                    If you found this item, use <span className="font-bold text-foreground">I found this item</span> to create an
                    on-chain match and mark this post as found (sign in required).
                  </>
                ) : (
                  <>
                    Use <span className="font-semibold text-foreground">Blockchain details</span> above to see on-chain
                    verification and transaction history for this listing.
                  </>
                )}
              </p>
            </div>

            <ItemDetailHero
              name={title}
              description={record.description ?? null}
              location={record.location ?? null}
              category={record.category ?? null}
              eventDate={record.event_date ?? null}
              reportedAt={record.created_at ?? null}
              status={record.status ?? '—'}
              imageUrls={record.image_urls ?? null}
              eventLabel={eventLabel}
              ownerDisplay={ownerDisplay}
              ownerEmailRaw={ownerEmailRaw}
              finderDisplay={finderDisplay}
              finderEmailRaw={finderEmailRaw}
            />
          </>
        )}
      </div>
    </CampusShell>
  )
}
