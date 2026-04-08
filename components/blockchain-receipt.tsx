'use client'

import { CheckCircle2, ExternalLink, Info, MapPin, Package, ShieldCheck, Tag } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Electronics',
  essentials: 'Essentials & Keys',
  books: 'Books & Supplies',
  clothing: 'Clothing & Accessories',
  id: 'ID & Cards',
  other: 'Other',
}

interface BlockchainReceiptProps {
  /** The real blockchain transaction hash (0x-prefixed) */
  txHash?: string | null
  /** The MongoDB document ID */
  itemId?: string | null
  /** Item name for extra context */
  itemName?: string | null
  /** Report type — lost, found, or claimed */
  reportType?: 'lost' | 'found' | 'claimed' | null
  /** Event date */
  eventDate?: string | null
  /** Real creation timestamp from database/system */
  reportedAt?: string | null
  /** Category slug from the form */
  category?: string | null
  /** Free-text description */
  description?: string | null
  /** Location where the item was lost/found */
  location?: string | null
  /** Uploaded image URLs */
  imageUrls?: string[] | null
  /** Optional children rendered below the receipt (e.g. buttons) */
  children?: React.ReactNode
}

export function BlockchainReceipt({
  txHash,
  itemId,
  itemName,
  reportType,
  eventDate,
  reportedAt,
  category,
  description,
  location,
  imageUrls,
  children,
}: BlockchainReceiptProps) {
  const displayHash = txHash
    ? `${txHash.slice(0, 10)}…${txHash.slice(-8)}`
    : null

  let statusLabel = 'Reported'
  let statusColor = 'border-amber-700/30 bg-amber-100 text-amber-800'
  
  if (reportType === 'found') {
    statusLabel = 'Found - Ready for claim'
    statusColor = 'border-amber-700/30 bg-amber-100 text-amber-800'
  } else if (reportType === 'claimed') {
    statusLabel = 'Found - Claimed'
    statusColor = 'border-green-700/30 bg-green-100 text-green-800'
  } else if (reportType === 'lost') {
    statusLabel = 'Lost - In search'
    statusColor = 'border-rose-700/30 bg-rose-100 text-rose-800'
  }

  const formattedReportDate = reportedAt
    ? new Intl.DateTimeFormat('en-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(reportedAt))
    : null

  const formattedEventDate = eventDate
    ? new Intl.DateTimeFormat('en-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        dateStyle: 'medium',
      }).format(new Date(eventDate))
    : null
    
  const eventLabel = reportType === 'found' ? 'Found date: (Approx)' : 'Lost date: (Approx)'

  return (
    <Card className="border-4 border-black rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white/95 to-sky-50/80 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Top accent bar */}
      <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

      <CardHeader className="pb-2 pt-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-3 border-black bg-emerald-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <ShieldCheck className="h-8 w-8 text-emerald-700" aria-hidden />
        </div>
        <CardTitle className="font-black text-xl sm:text-2xl tracking-tight">
          {itemName ? `"${itemName}" — ` : ''}Item Secured on the DCAI Network
        </CardTitle>
        <CardDescription className="text-sm font-medium text-foreground/70 mt-1 max-w-md mx-auto leading-relaxed">
          This report is cryptographically locked. You have undeniable proof of this item&apos;s details and timestamp
          {itemId ? (
            <>
              {' '}&mdash;{' '}
              <span className="font-semibold text-foreground/80">ref: {itemId}</span>
            </>
          ) : (
            ''
          )}
          .
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-2 pb-6">
        {/* Item Details */}
        {(itemName || category || location || description) ? (
          <div className="rounded-xl border-2 border-black bg-white/80 p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
              Item Details
            </h3>

            {itemName ? (
              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Item</p>
                  <p className="text-sm font-bold text-slate-800">{itemName}</p>
                </div>
              </div>
            ) : null}

            {category ? (
              <>
                <div className="h-px bg-black/10" />
                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Category</p>
                    <p className="text-sm font-bold text-slate-800">{CATEGORY_LABELS[category] ?? category}</p>
                  </div>
                </div>
              </>
            ) : null}

            {location ? (
              <>
                <div className="h-px bg-black/10" />
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Location</p>
                    <p className="text-sm font-bold text-slate-800">{location}</p>
                  </div>
                </div>
              </>
            ) : null}

            {description ? (
              <>
                <div className="h-px bg-black/10" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Description</p>
                  <p className="text-sm leading-relaxed text-slate-700">{description}</p>
                </div>
              </>
            ) : null}

            {imageUrls && imageUrls.length > 0 ? (
              <>
                <div className="h-px bg-black/10" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Photos</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {imageUrls.map((url, i) => (
                      <img
                        key={`${url}-${i}`}
                        src={url}
                        alt={`Uploaded photo ${i + 1}`}
                        className="aspect-square w-full rounded-lg border-2 border-black/15 object-cover"
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {/* Digital Receipt */}
        <div className="rounded-xl border-2 border-black bg-white/80 p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
            Digital Receipt
          </h3>

          {/* Status row */}
          <div className="flex items-center justify-between gap-3">
            <span
              className="inline-flex items-center gap-1 text-sm font-bold text-slate-700"
              title="The current lifecycle stage of this report on campus."
            >
              Status
              <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" aria-hidden />
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1 text-xs font-black ${statusColor}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              {statusLabel}
            </span>
          </div>

          <div className="h-px bg-black/10" />



          {/* Transaction ID row */}
          {displayHash ? (
            <div className="flex items-center justify-between gap-3">
              <span
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 cursor-help"
                title="A unique, permanent digital fingerprint. It proves exactly when this item was reported and guarantees the details cannot be tampered with."
              >
                Transaction ID
                <Info className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              </span>
              <code
                className="rounded-md border border-black/15 bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-800 select-all"
                title={txHash ?? undefined}
              >
                {displayHash}
              </code>
            </div>
          ) : null}

          {/* Event date row */}
          {formattedEventDate ? (
            <>
              <div className="h-px bg-black/10" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-700">{eventLabel}</span>
                <span className="text-xs font-bold text-slate-800">{formattedEventDate}</span>
              </div>
            </>
          ) : null}

          {/* Report date row */}
          {formattedReportDate ? (
            <>
              <div className="h-px bg-black/10" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-700">Report date:</span>
                <span className="text-xs font-bold text-slate-800">{formattedReportDate}</span>
              </div>
            </>
          ) : null}
        </div>

        {/* CTA: Verify on Explorer */}
        {txHash ? (
          <a
            href={`http://139.180.140.143/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-black bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-emerald-700 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Verify Proof on Blockchain Explorer
          </a>
        ) : null}

        {/* Slot for extra actions (e.g. "Submit another report", "Back" buttons) */}
        {children}
      </CardContent>
    </Card>
  )
}
