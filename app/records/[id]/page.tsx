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
  initial_event?: 'lost' | 'found'
  status?: 'lost' | 'found' | 'claimed'
  reporter_email?: string | null
  claimer_email?: string | null
  finder_email?: string | null
  image_urls?: string[] | null
  report_tx_hash?: string | null
  claim_tx_hash?: string | null
  found_at?: string | null
  found_tx_hash?: string | null
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
      }
      toast({
        className: toastBrutalist,
        title: 'Match recorded',
        description:
          'A blockchain record was created linking these items together.',
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
    record?.initial_event === 'found'
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

  const reporterEmailRaw = record?.reporter_email?.trim()
  const claimerEmailRaw = record?.claimer_email?.trim()
  const finderEmailRaw = record?.finder_email?.trim()
  
  const isReporter = Boolean(
    sessionEmail && reporterEmailRaw && sessionEmail.trim().toLowerCase() === reporterEmailRaw.toLowerCase(),
  )
  const isClaimer = Boolean(
    sessionEmail && claimerEmailRaw && sessionEmail.trim().toLowerCase() === claimerEmailRaw.toLowerCase(),
  )
  const isFinder = Boolean(
    sessionEmail && finderEmailRaw && sessionEmail.trim().toLowerCase() === finderEmailRaw.toLowerCase(),
  )
  
  // Claim logic:
  // - If initial_event="lost": ONLY the owner (reporter) can claim
  // - If initial_event="found": Anyone EXCEPT the reporter can claim (founder cannot claim their own found item)
  const canClaim = Boolean(
    sessionEmail && 
    record?.status === 'found' && 
    (
      (record?.initial_event === 'lost' && isReporter) ||  // Lost items: ONLY the owner
      (record?.initial_event === 'found' && !isReporter)  // Found items: NOT the founder
    )
  )
  const isLost = record?.initial_event === 'lost'
  
  // Display based on how the item was reported
  const eventLabel = record?.initial_event === 'found' ? 'Found date (approx.)' : 'Lost date (approx.)'

  const title = record?.name?.trim() || 'Untitled item'

  let reporterDisplay: string | null = null
  if (reporterEmailRaw) {
    const session = sessionEmail?.trim()
    if (session && session.toLowerCase() === reporterEmailRaw.toLowerCase()) {
      reporterDisplay = 'you'
    } else {
      reporterDisplay = reporterEmailRaw
    }
  }

  let claimerDisplay: string | null = null
  if (claimerEmailRaw && record.status === 'claimed') {
    const session = sessionEmail?.trim()
    if (session && session.toLowerCase() === claimerEmailRaw.toLowerCase()) {
      claimerDisplay = 'you'
    } else {
      claimerDisplay = claimerEmailRaw
    }
  }

  let finderDisplay: string | null = null
  if (finderEmailRaw) {
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
            {isLost && !isReporter && record.status === 'lost' ? (
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

          {canClaim && record?.initial_event === 'found' ? (
            <div className="mt-5 rounded-xl border-2 border-amber-800 bg-amber-50 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-950 shadow-[3px_3px_0px_0px_rgba(146,64,14,0.3)]">
              <span className="font-black text-amber-800 uppercase tracking-widest mr-1.5">Disclaimer:</span> 
              Please ensure you are the true owner. Falsely claiming this item will result in a permanent and immutable claiming record on the blockchain that authorities may track.
            </div>
          ) : null}
        </div>

        {showBlockchainDetails ? (
          <section aria-label="Blockchain verification" className="scroll-mt-24">
            <BlockchainReceipt
              txHash={record?.report_tx_hash || null}
              matchTxHash={record?.found_tx_hash || null}
              itemId={record?._id}
              itemName={record?.name}
              reportType={(record?.status as 'lost' | 'found' | 'claimed') || null}
              eventDate={record?.event_date || null}
              reportedAt={record?.created_at || null}
              category={record?.category || null}
              description={record?.description || null}
              location={record?.location || null}
              imageUrls={record?.image_urls?.length ? record.image_urls : null}
              closingTxHash={record?.claim_tx_hash || null}
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
              description={record?.description ?? null}
              location={record?.location ?? null}
              category={record?.category ?? null}
              eventDate={record?.event_date ?? null}
              reportedAt={record?.created_at ?? null}
              status={record?.status ?? '—'}
              imageUrls={record?.image_urls ?? null}
              eventLabel={eventLabel}
              reporterRole={record?.initial_event === 'lost' ? 'owner' : 'finder'}
              reporterDisplay={reporterDisplay}
              reporterEmailRaw={reporterEmailRaw}
              finderDisplay={finderDisplay}
              finderEmailRaw={finderEmailRaw}
              claimerDisplay={claimerDisplay}
              claimerEmailRaw={claimerEmailRaw}
            />
          </>
        )}
      </div>
    </CampusShell>
  )
}
