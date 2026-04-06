import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'

type CampusShellProps = {
  children: React.ReactNode
  title?: string
  /** When set, replaces the default string title (e.g. custom typography). */
  titleSlot?: React.ReactNode
  showBack?: boolean
  backHref?: string
  /** Extra controls on the page bar (e.g. actions beside the title) */
  headerRight?: React.ReactNode
}

export function CampusShell({
  children,
  title,
  titleSlot,
  showBack,
  backHref = '/found',
  headerRight,
}: CampusShellProps) {
  const showPageBar =
    title != null || titleSlot != null || showBack || headerRight != null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border-4 border-black bg-white/40 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] backdrop-blur-xl">
        <SiteHeader />

        {showPageBar ? (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/40 px-4 py-4 backdrop-blur-md sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {showBack ? (
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Link href={backHref} aria-label="Back">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
              ) : null}
              {titleSlot != null ? (
                <div className="min-w-0 flex-1">{titleSlot}</div>
              ) : title ? (
                <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl md:text-3xl">
                  {title}
                </h1>
              ) : null}
            </div>
            {headerRight != null ? <div className="shrink-0">{headerRight}</div> : null}
          </div>
        ) : null}

        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 md:py-12">{children}</div>

        <SiteFooter className="mt-0" />
      </div>
    </div>
  )
}
