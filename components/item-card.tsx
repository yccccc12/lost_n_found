import Link from 'next/link'
import type { ItemEntry } from '@/lib/mock-items'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Calendar, ImageOff, MapPin } from 'lucide-react'

function hasItemImage(url: string | undefined): boolean {
  return Boolean(url?.trim())
}

type ItemCardProps = {
  item: ItemEntry
  /** When set, the whole card links to this URL (e.g. `/found/[id]`) */
  href?: string
}

export function ItemCard({ item, href }: ItemCardProps) {
  const showImage = hasItemImage(item.imageUrl)

  const card = (
    <Card
      className={cn(
        'border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white/80 overflow-hidden flex flex-col h-full transition-shadow',
        href && 'hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden border-b-4 border-black bg-muted">
        {showImage ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,hsl(var(--muted))_0%,hsl(var(--muted)/0.72)_45%,hsl(var(--muted)/0.88)_100%)] px-6"
            role="img"
            aria-label="No image available for this item"
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-foreground/15 bg-background/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]"
              aria-hidden
            >
              <ImageOff className="h-7 w-7 text-foreground/25" strokeWidth={1.35} />
            </div>
            <p className="max-w-[12rem] text-center text-[11px] font-semibold uppercase leading-snug tracking-[0.18em] text-muted-foreground/80">
              No image available
            </p>
          </div>
        )}
      </div>
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-black leading-tight">{item.name}</CardTitle>
        <CardDescription className="text-sm leading-snug">{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 mt-auto space-y-2 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <span>{item.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" aria-hidden />
          <time dateTime={item.date}>{item.date}</time>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      >
        {card}
      </Link>
    )
  }

  return card
}
