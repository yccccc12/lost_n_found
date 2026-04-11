'use client'

import Link from 'next/link'
import { Search, Package, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const cardSurface =
  'border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden'

/** Stylized linked blocks + seal — decorative, matches neubrutalist strokes. */
function BlockchainChainGraphic({ className }: { className?: string }) {
  const blocks = [
    { x: 0, hash: '0x3…' },
    { x: 118, hash: '0x4…' },
    { x: 236, hash: '0x5…' },
  ] as const
  return (
    <svg
      className={className}
      viewBox="0 0 420 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern id="trust-block-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#94a3b8" />
        </pattern>
      </defs>
      {/* connectors between blocks */}
      <path
        d="M102 44H118 M220 44H236"
        stroke="#0f172a"
        strokeWidth="5"
        strokeLinecap="square"
      />
      {blocks.map((b, i) => (
        <g key={i} transform={`translate(${b.x} 8)`}>
          <rect width="102" height="72" rx="10" fill="white" stroke="#0f172a" strokeWidth="4" />
          <rect
            x="8"
            y="10"
            width="86"
            height="18"
            rx="4"
            fill="url(#trust-block-dots)"
            opacity="0.4"
          />
          <path
            d="M12 40h32M12 48h22M12 56h26"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="square"
            opacity="0.3"
          />
          <text
            x="92"
            y="54"
            textAnchor="end"
            fill="#0f172a"
            style={{ fontSize: '11px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
            fontWeight="800"
          >
            {b.hash}
          </text>
        </g>
      ))}
      {/* sealed / verified badge */}
      <g transform="translate(378 44)">
        <circle r="22" fill="#0f172a" stroke="black" strokeWidth="3" />
        <path
          d="M-6 0l5 5 12-14"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export function LandingPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch('/api/items/all')
        const data = await res.json()
        if (data && Array.isArray(data)) {
          setRecords(data.slice(0, 3))
        }
      } catch (err) {
        console.error('Error fetching records:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecords()
  }, [])

  const getStatusBadge = (initialEvent: string, status: string) => {
    const event = initialEvent?.toLowerCase()
    const st = status?.toLowerCase()
    
    if (st === 'lost') {
      return { border: 'border-rose-700/30', bg: 'bg-rose-100', text: 'text-rose-800', label: 'Lost - In search' }
    }
    if (st === 'found') {
      return { border: 'border-amber-700/30', bg: 'bg-amber-100', text: 'text-amber-800', label: 'Found - Ready for claim' }
    }
    if (st === 'claimed') {
      return { border: 'border-green-700/30', bg: 'bg-green-100', text: 'text-green-800', label: 'Found - Claimed' }
    }
    return { border: 'border-gray-300', bg: 'bg-gray-100', text: 'text-gray-600', label: st || 'Unknown' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border-4 border-black bg-white/40 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] backdrop-blur-xl">
        <SiteHeader />

        <div className="mx-auto max-w-6xl space-y-14 px-5 py-10 sm:px-8 sm:py-12 md:space-y-20 md:py-14">
          {/* Hero */}
          <section className="max-w-2xl space-y-5 text-left">
            <Badge className="rounded-full border-2 border-black bg-orange-200 px-3 py-1 font-black uppercase tracking-wide text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              Live campus network
            </Badge>
            <h1 className="text-balance text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
              <span className="text-slate-900">Recover your lost items,</span>{' '}
              <span className="text-orange-600">reconnect with campus.</span>
            </h1>
            <p className="text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
              The official university portal for tracking and reporting found belongings. Verified,
              secure, and student-first.
            </p>
            <p className="text-sm font-semibold text-slate-700">
              You are signed in — browse listings, file a report, or explore blockchain records from the header
              anytime.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Left: reported lost (dark) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group inline-flex h-10 items-center gap-2 rounded-xl border-2 border-black bg-slate-900 px-5 text-xs font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 ease-out hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-black hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
                    <span>I Lost Something</span>
                    <ChevronDown className="h-3.5 w-3.5 ml-1 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="min-w-[13rem] border-2 border-black rounded-xl p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/browse?type=found"
                      className="cursor-pointer rounded-lg px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 focus:bg-slate-100"
                    >
                      View Reported Found Item
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/report?type=lost"
                      className="cursor-pointer rounded-lg px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 focus:bg-slate-100"
                    >
                      Report a Lost Item
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Right: found — white surface + neutral menu hovers */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group inline-flex h-10 items-center gap-2 rounded-xl border-2 border-black bg-white px-5 text-xs font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 ease-out hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-slate-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Package className="h-3.5 w-3.5 shrink-0 text-emerald-800" aria-hidden />
                    <span>I Found Something</span>
                    <ChevronDown className="h-3.5 w-3.5 ml-1 shrink-0 text-black transition-transform group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="min-w-[13rem] border-2 border-black rounded-xl p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/browse?type=lost"
                      className="cursor-pointer rounded-lg px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 focus:bg-slate-100"
                    >
                      View Reported Lost item
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/report?type=found"
                      className="cursor-pointer rounded-lg px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 focus:bg-slate-100"
                    >
                      Report a Found Item
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>

          {/* Why blockchain — graphic strip + accordion */}
          <section className="space-y-4">
            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Trust &amp; verification</h2>
              <div className="h-1 w-20 rounded-full bg-black" aria-hidden />
            </div>
            <div
              className={`${cardSurface} relative bg-white/90`}
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgb(15 23 42 / 0.07) 1px, transparent 0)`,
                backgroundSize: '20px 20px',
              }}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border-4 border-black/10 bg-orange-200/30" aria-hidden />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rotate-12 border-4 border-dashed border-black/15" aria-hidden />

              <div className="relative border-b-4 border-black bg-gradient-to-br from-slate-50 via-emerald-50/50 to-slate-100 px-4 py-6 sm:px-8 sm:py-8">
                <div className="min-w-0 space-y-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">
                    DCAI · hashed receipts
                  </p>
                  <BlockchainChainGraphic className="h-auto w-full max-w-[440px] drop-shadow-[4px_4px_0_rgba(0,0,0,0.12)]" />
                  <p className="max-w-xl text-sm font-medium text-slate-600">
                    Each report is chained like a block: once sealed, the sequence—and your proof—stays
                    intact.
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible defaultValue="why-blockchain" className="w-full px-1 sm:px-2">
                <AccordionItem value="why-blockchain" className="border-b-0 px-4 sm:px-6">
                  <AccordionTrigger className="py-5 text-left text-lg font-black text-slate-900 hover:no-underline [&>svg]:text-slate-900">
                    Why do we use the blockchain?
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
                    <p>
                      Traditional databases can be edited or hacked. By stamping your report&apos;s hash on
                      the DCAI network, we create an{' '}
                      <strong className="font-black text-slate-900">immutable record</strong>. If there is
                      ever a dispute over who owns this item, this receipt is your{' '}
                      <strong className="font-black text-slate-900">absolute proof</strong> — no one can
                      alter the timestamp or the details after the fact.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Blockchain Section START */}
          <section>
            <div className={`${cardSurface} bg-white/90 p-6`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  🔗 Lost and Found Records
                </h2>

                <Link
                  href="/records"
                  className="border-2 border-black px-3 py-1 rounded-md text-sm font-medium hover:bg-black hover:text-white transition duration-200"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-2">
                {loading ? (
                  <p className="text-center text-sm text-gray-500 py-4">Loading records...</p>
                ) : records.length > 0 ? (
                  records.map((record, idx) => {
                    const badge = getStatusBadge(record.initial_event, record.status)
                    const recordId = record._id || '—'
                    return (
                      <Link
                        href={`/records/${record._id}`}
                        key={idx}
                        className="border-b pb-3 hover:bg-gray-50 transition duration-200 px-3 py-3 rounded cursor-pointer flex items-center gap-4 justify-between"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-mono shrink-0 break-all">{recordId}</p>
                          <p className="text-base font-semibold text-foreground">{record.name || 'Unnamed item'}</p>
                        </div>

                        <span className={`border-2 ${badge.border} ${badge.bg} ${badge.text} px-3 py-1 text-xs font-black rounded-lg whitespace-nowrap shrink-0 inline-flex items-center gap-1.5`}>
                          {badge.label}
                        </span>
                      </Link>
                    )
                  })
                ) : (
                  <p className="text-center text-sm text-gray-500 py-4">No records yet</p>
                )}
              </div>
            </div>
          </section>
          {/*  Blockchain Section END */}
        </div>

        <SiteFooter className="mt-0" />
      </div>
    </div>
  )
}