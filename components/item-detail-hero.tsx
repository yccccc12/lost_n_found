'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Calendar, FileText, ImageOff, MapPin, Package, Tag, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Electronics',
  essentials: 'Essentials & Keys',
  books: 'Books & Supplies',
  clothing: 'Clothing & Accessories',
  id: 'ID & Cards',
  other: 'Other',
}

function statusBadge(status: string) {
  const s = status?.toLowerCase()
  const base =
    'inline-flex items-center rounded-full border-2 border-black px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
  if (s === 'lost') {
    return <span className={`${base} bg-rose-100 text-rose-950`}>Lost — in search</span>
  }
  if (s === 'found') {
    return <span className={`${base} bg-amber-200 text-amber-950`}>Found — ready to claim</span>
  }
  if (s === 'claimed') {
    return <span className={`${base} bg-emerald-200 text-emerald-950`}>Returned</span>
  }
  return <span className={`${base} bg-muted text-foreground`}>{status}</span>
}

type DetailRowProps = {
  icon: ReactNode
  label: string
  value: string
  valueClassName?: string
  /** Long prose — lighter weight and relaxed leading, same row layout as other fields */
  multiline?: boolean
}

function DetailRow({ icon, label, value, valueClassName, multiline }: DetailRowProps) {
  return (
    <div className="flex gap-4 border-b border-dashed border-black/12 py-4 first:pt-0 last:border-b-0 last:pb-4">
      <span
        className={cn(
          'shrink-0 text-muted-foreground [&>svg]:h-5 [&>svg]:w-5',
          multiline ? 'mt-1' : 'mt-0.5',
        )}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <p
          className={cn(
            multiline
              ? 'whitespace-pre-wrap text-[15px] font-bold leading-[1.7] text-foreground sm:text-base'
              : 'text-[15px] font-semibold leading-snug text-foreground sm:text-base',
            valueClassName,
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

export type ItemDetailHeroProps = {
  name: string
  description: string | null
  location: string | null
  category: string | null
  eventDate: string | null
  reportedAt: string | null
  status: string
  imageUrls: string[] | null | undefined
  eventLabel: string
  reporterRole?: 'owner' | 'finder'
  /** When set, shown under Reporter — pass `"you"` when the viewer is the reporter (renders as a full sentence). */
  reporterDisplay?: string | null
  /** Reporter's raw email (used for display when reporterDisplay is 'you') */
  reporterEmailRaw?: string | null
  /** When set, shown under Finder */
  finderDisplay?: string | null
  /** Finder's raw email */
  finderEmailRaw?: string | null
  /** When set, shown under Claimer — pass `"you"` when the viewer is the claimer (renders as a full sentence). */
  claimerDisplay?: string | null
  /** Claimer's raw email (used for display when claimerDisplay is 'you') */
  claimerEmailRaw?: string | null
}

export function ItemDetailHero({
  name,
  description,
  location,
  category,
  eventDate,
  reportedAt,
  status,
  imageUrls,
  eventLabel,
  reporterRole = 'owner',
  reporterDisplay = null,
  reporterEmailRaw = null,
  finderDisplay = null,
  finderEmailRaw = null,
  claimerDisplay = null,
  claimerEmailRaw = null,
}: ItemDetailHeroProps) {
  const urls = imageUrls?.filter((u) => typeof u === 'string' && u.trim().length > 0) ?? []
  const hasImage = urls.length > 0
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  useEffect(() => {
    setActivePhotoIndex(0)
  }, [imageUrls])

  const mainPhotoUrl = hasImage ? urls[Math.min(activePhotoIndex, urls.length - 1)] : ''

  const formattedEvent = eventDate
    ? new Intl.DateTimeFormat('en-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        dateStyle: 'medium',
      }).format(new Date(eventDate))
    : null

  const formattedReported = reportedAt
    ? new Intl.DateTimeFormat('en-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(reportedAt))
    : null

  const statusLabel = status === 'claimed' ? 'Claimed' : 'Active'

  const hasMetaPanel = Boolean(
    category ||
      location ||
      formattedEvent ||
      formattedReported ||
      ownerDisplay ||
      finderDisplay ||
      description,
  )

  return (
    <article className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        {/* Media */}
        <div className="relative aspect-[4/3] w-full border-b-4 border-black bg-[#e8e8ea] lg:aspect-auto lg:min-h-[280px] lg:border-b-0 lg:border-r-4">
          {hasImage ? (
            <img
              src={mainPhotoUrl}
              alt={
                urls.length > 1
                  ? `${name} — photo ${activePhotoIndex + 1} of ${urls.length}`
                  : name
              }
              className="absolute inset-0 h-full w-full object-contain object-center"
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8"
              role="img"
              aria-label="No image available for this item"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)`,
                backgroundSize: '16px 16px',
                backgroundColor: 'hsl(var(--muted))',
              }}
            >
              <div
                className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border-2 border-black/80 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,0.85)]"
                aria-hidden
              >
                <ImageOff className="h-9 w-9 text-foreground/30" strokeWidth={1.25} />
              </div>
              <p className="max-w-[14rem] text-center text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/45">
                No image available
              </p>
            </div>
          )}
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-10 p-7 sm:p-9 lg:min-h-[280px] lg:justify-center">
          <header className="space-y-4">
            <div>{statusBadge(status)}</div>
            <h2 className="text-balance text-3xl font-black leading-[1.08] tracking-tight text-foreground sm:text-[2.15rem]">
              {name}
            </h2>
          </header>

          {hasMetaPanel ? (
            <div className="rounded-xl bg-muted/15 px-1 py-0 sm:px-2">
              {category ? (
                <DetailRow
                  icon={<Tag strokeWidth={2} />}
                  label="Category"
                  value={CATEGORY_LABELS[category] ?? category}
                />
              ) : null}
              {location ? (
                <DetailRow icon={<MapPin strokeWidth={2} />} label="Location" value={location} />
              ) : null}
              {formattedEvent ? (
                <DetailRow icon={<Calendar strokeWidth={2} />} label={eventLabel} value={formattedEvent} />
              ) : null}
              {formattedReported ? (
                <DetailRow
                  icon={<Package strokeWidth={2} />}
                  label="Report filed"
                  value={formattedReported}
                />
              ) : null}
              {reporterDisplay ? (
                <DetailRow
                  icon={<User strokeWidth={2} />}
                  label={reporterRole === 'owner' ? 'Owner' : 'Finder'}
                  value={
                    reporterDisplay === 'you' 
                      ? reporterRole === 'owner' 
                        ? `You lost this item (${reporterEmailRaw})`
                        : `You found this item (${reporterEmailRaw})`
                      : reporterDisplay
                  }
                  valueClassName={
                    reporterDisplay === 'you'
                      ? '!text-[15px] font-semibold normal-case leading-snug text-foreground sm:!text-base'
                      : 'break-all font-medium'
                  }
                />
              ) : null}
              {finderDisplay ? (
                <DetailRow
                  icon={<User strokeWidth={2} />}
                  label="Found by"
                  value={
                    finderDisplay === 'you'
                      ? `You found this item (${finderEmailRaw})`
                      : finderDisplay
                  }
                  valueClassName={
                    finderDisplay === 'you'
                      ? '!text-[15px] font-semibold normal-case leading-snug text-foreground sm:!text-base'
                      : 'break-all font-medium'
                  }
                />
              ) : null}
              {claimerDisplay ? (
                <DetailRow
                  icon={<User strokeWidth={2} />}
                  label="Claimer"
                  value={
                    claimerDisplay === 'you' 
                      ? `You claimed this item (${claimerEmailRaw})` 
                      : claimerDisplay
                  }
                  valueClassName={
                    claimerDisplay === 'you'
                      ? '!text-[15px] font-semibold normal-case leading-snug text-foreground sm:!text-base'
                      : 'break-all font-medium'
                  }
                />
              ) : null}
              {description ? (
                <DetailRow
                  icon={<FileText strokeWidth={2} />}
                  label="Description"
                  value={description}
                  multiline
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {urls.length > 1 ? (
        <div
          className="border-t-4 border-black bg-muted/25 px-5 py-6 sm:px-8"
          role="region"
          aria-label="Photo gallery"
        >
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Photos — tap to view
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
            {urls.map((url, i) => (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => setActivePhotoIndex(i)}
                aria-label={`Show photo ${i + 1} of ${urls.length}`}
                aria-pressed={activePhotoIndex === i}
                className={cn(
                  'group overflow-hidden rounded-xl border-2 bg-white text-left shadow-[3px_3px_0_0_rgba(0,0,0,0.75)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
                  activePhotoIndex === i
                    ? 'border-black ring-2 ring-black ring-offset-2'
                    : 'border-black/70 opacity-[0.92] hover:opacity-100',
                )}
              >
                <img
                  src={url}
                  alt=""
                  className="aspect-square w-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  )
}
