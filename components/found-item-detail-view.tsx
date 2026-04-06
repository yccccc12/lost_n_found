import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronRight,
  MapPin,
  MessageCircle,
  Shield,
} from 'lucide-react'
import type { FoundItemDetail } from '@/lib/mock-items'
import { FoundItemGallery } from '@/components/found-item-gallery'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type FoundItemDetailViewProps = {
  item: FoundItemDetail
}

function formatListingDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function FoundItemDetailView({ item }: FoundItemDetailViewProps) {
  const crumbs = item.breadcrumb
  const last = crumbs.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border-4 border-black bg-white/40 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] backdrop-blur-xl">
        <SiteHeader />

        <div className="border-b border-black/10 bg-gradient-to-br from-orange-50/40 via-white/50 to-blue-50/30 px-4 py-6 sm:px-6 md:px-8">
          <div className="mx-auto max-w-6xl space-y-5">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 w-fit gap-1.5 rounded-xl border-2 border-black bg-white/90 px-3 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-white"
            >
              <Link href="/found">
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                All found items
              </Link>
            </Button>

            <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
                <Badge className="w-fit rounded-full border-2 border-black bg-orange-200 px-2.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Live listing
                </Badge>
                <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
                  <ol className="flex flex-wrap items-center gap-y-1 text-sm">
                    {crumbs.map((segment, i) => (
                      <li key={`${segment}-${i}`} className="flex items-center">
                        {i > 0 ? (
                          <ChevronRight
                            className="mx-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
                            aria-hidden
                          />
                        ) : null}
                        <span
                          className={cn(
                            'max-w-[14rem] truncate sm:max-w-none',
                            i === last
                              ? 'font-semibold text-foreground'
                              : 'font-medium text-muted-foreground',
                          )}
                          {...(i === last ? { 'aria-current': 'page' as const } : {})}
                        >
                          {segment}
                        </span>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12 p-4 sm:p-6 md:p-8 md:px-8 lg:mx-auto lg:max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 lg:items-start">
            <FoundItemGallery
              alt={item.name}
              images={item.gallery}
              extraCount={item.extraImageCount}
            />

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Found {item.name}
                </h1>
                <p className="mt-3 text-muted-foreground font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white/90">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wide">
                      <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                      Location
                    </div>
                    <p className="font-bold">{item.building}</p>
                    <p className="text-sm text-muted-foreground">{item.area}</p>
                  </CardContent>
                </Card>
                <Card className="border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white/90">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wide">
                      <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                      Date &amp; time
                    </div>
                    <p className="font-bold">{formatListingDate(item.date)}</p>
                    <p className="text-sm text-muted-foreground">{item.timeLabel}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h2 className="font-black text-sm uppercase tracking-wide border-b-2 border-black pb-2 inline-block">
                  Description
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.longDescription}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full rounded-xl border-2 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-slate-900 hover:bg-slate-900 text-white py-6 text-base gap-2"
                  type="button"
                >
                  Claim this item
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white py-6 gap-2"
                  type="button"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  Ask a question
                </Button>
              </div>

              <Card className="border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-sky-50/90">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2 font-black">
                    <Shield className="h-5 w-5 shrink-0" aria-hidden />
                    Identity verification
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.verificationIntro}
                  </p>
                  <ul className="list-disc list-inside text-sm font-medium space-y-1 text-foreground/90">
                    {item.verificationBullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <section className="rounded-2xl border-4 border-black bg-white/80 p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-black text-xl sm:text-2xl tracking-tight border-b-4 border-black pb-3 mb-4">
              Recovery location
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              {item.recoveryLocation}
            </p>
          </section>

          <SiteFooter />
        </div>
      </div>
    </div>
  )
}
