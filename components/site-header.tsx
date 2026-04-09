'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type PendingClaimItem = {
  _id: string
  name?: string
  matched_at?: string | null
}

const HOVER_CLOSE_DELAY_MS = 140
/** Slightly longer so the cursor can cross the gap to the portaled menu without closing. */
const NOTIF_HOVER_CLOSE_DELAY_MS = 280

const dropdownPanelClass =
  'min-w-[12rem] rounded-xl border-2 border-black bg-white p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] origin-top duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'

const triggerClass =
  'inline-flex items-center gap-1 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-black rounded-sm data-[state=open]:underline underline-offset-4'

/** Matches claim-card hover: lift, deeper shadow; bell wiggle; respects reduced motion. */
const notificationBellButtonClass =
  'relative shrink-0 rounded-full border-2 border-black bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-amber-50/50 hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] data-[state=open]:-translate-x-0.5 data-[state=open]:-translate-y-0.5 data-[state=open]:bg-amber-50/40 data-[state=open]:shadow-[5px_5px_0_0_rgba(0,0,0,1)] [&_svg]:!size-5 [&_svg]:origin-center [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:-rotate-[12deg] motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] motion-reduce:hover:[&_svg]:rotate-0'

function HeaderNavDropdown({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const handleOpen = useCallback(() => {
    clearCloseTimer()
    setOpen(true)
  }, [clearCloseTimer])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setOpen(false)
      closeTimerRef.current = null
    }, HOVER_CLOSE_DELAY_MS)
  }, [clearCloseTimer])

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        className={triggerClass}
        onPointerEnter={handleOpen}
        onPointerLeave={scheduleClose}
      >
        {label}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 opacity-70 transition-transform duration-200 ease-out',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={dropdownPanelClass}
        onPointerEnter={handleOpen}
        onPointerLeave={scheduleClose}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SiteHeader() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingClaims, setPendingClaims] = useState<PendingClaimItem[]>([])
  const [pendingPoll, setPendingPoll] = useState(0)

  const loadPendingClaims = useCallback(async () => {
    try {
      const r = await fetch('/api/notifications/pending-claims', {
        credentials: 'include',
        cache: 'no-store',
      })
      const d = (await r.json()) as {
        items?: PendingClaimItem[]
        count?: number
        authenticated?: boolean
      }
      if (!r.ok || !Array.isArray(d.items)) {
        setPendingClaims([])
        return
      }
      setPendingClaims(d.items)
    } catch {
      setPendingClaims([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/session', { credentials: 'include' })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; email?: string }) => {
        if (cancelled) return
        if (d.authenticated && typeof d.email === 'string' && d.email) {
          setEmail(d.email)
        } else {
          setEmail(null)
        }
      })
      .catch(() => {
        if (!cancelled) setEmail(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!email) {
      setPendingClaims([])
      return
    }
    void loadPendingClaims()
  }, [email, pendingPoll, loadPendingClaims])

  useEffect(() => {
    if (!email) return
    const id = window.setInterval(() => {
      setPendingPoll((n) => n + 1)
    }, 60_000)
    return () => window.clearInterval(id)
  }, [email])

  useEffect(() => {
    if (!email) return
    const onFocus = () => setPendingPoll((n) => n + 1)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [email])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setEmail(null)
    router.push('/')
    router.refresh()
  }

  const initial = email?.[0]?.toUpperCase() ?? ''
  const pendingCount = pendingClaims.length
  const badgeLabel =
    pendingCount > 9 ? '9+' : pendingCount > 0 ? String(pendingCount) : null

  const [notifOpen, setNotifOpen] = useState(false)
  const notifCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearNotifCloseTimer = useCallback(() => {
    if (notifCloseTimerRef.current != null) {
      clearTimeout(notifCloseTimerRef.current)
      notifCloseTimerRef.current = null
    }
  }, [])

  const handleNotifPointerEnter = useCallback(() => {
    clearNotifCloseTimer()
    setNotifOpen(true)
  }, [clearNotifCloseTimer])

  const scheduleNotifClose = useCallback(() => {
    clearNotifCloseTimer()
    notifCloseTimerRef.current = setTimeout(() => {
      setNotifOpen(false)
      notifCloseTimerRef.current = null
    }, NOTIF_HOVER_CLOSE_DELAY_MS)
  }, [clearNotifCloseTimer])

  useEffect(() => () => clearNotifCloseTimer(), [clearNotifCloseTimer])

  useEffect(() => {
    if (notifOpen) void loadPendingClaims()
  }, [notifOpen, loadPendingClaims])

  return (
    <header className="border-b-4 border-black bg-white/40 backdrop-blur-md px-4 sm:px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-black tracking-tight shrink-0"
          >
            Campus Lost &amp; Found
          </Link>

          <nav className="flex flex-wrap items-center gap-6 text-sm font-medium">
            <Link href="/">Home</Link>
            <HeaderNavDropdown label="Browse">
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg font-medium focus:bg-slate-100">
                <Link href="/browse?type=lost">Lost items</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg font-medium focus:bg-slate-100">
                <Link href="/browse?type=found">Found items</Link>
              </DropdownMenuItem>
            </HeaderNavDropdown>
            <HeaderNavDropdown label="Report">
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg font-medium focus:bg-slate-100">
                <Link href="/report?type=lost">Lost items</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg font-medium focus:bg-slate-100">
                <Link href="/report?type=found">Found items</Link>
              </DropdownMenuItem>
            </HeaderNavDropdown>
            <Link href="/records">Blockchain Records</Link>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 shrink-0">
          {loading ? (
            <span className="text-xs font-medium text-muted-foreground tabular-nums">…</span>
          ) : email ? (
            <>
              <div className="hidden min-w-0 max-w-[200px] sm:flex min-h-10 flex-col items-end justify-center text-right self-center">
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground leading-tight">
                  Signed in
                </span>
                <span className="truncate text-xs font-semibold text-slate-800 leading-tight" title={email}>
                  {email}
                </span>
              </div>
              <Avatar className="h-10 w-10 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] self-center">
                <AvatarFallback className="bg-amber-100 text-xl font-black text-slate-900">
                  {initial ? (
                    initial
                  ) : (
                    <User className="h-5 w-5" aria-hidden />
                  )}
                </AvatarFallback>
              </Avatar>
              <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={notificationBellButtonClass}
                    aria-label={
                      pendingCount > 0
                        ? `${pendingCount} item${pendingCount === 1 ? '' : 's'} ready to claim`
                        : 'Notifications'
                    }
                    onPointerEnter={handleNotifPointerEnter}
                    onPointerLeave={scheduleNotifClose}
                  >
                    <Bell aria-hidden />
                    {badgeLabel ? (
                      <span
                        className="absolute -top-0.5 -right-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black leading-none text-white ring-2 ring-white"
                        aria-hidden
                      >
                        {badgeLabel}
                      </span>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className={cn(dropdownPanelClass, 'min-w-[min(100vw-2rem,20rem)] max-w-[20rem]')}
                  onPointerEnter={handleNotifPointerEnter}
                  onPointerLeave={scheduleNotifClose}
                >
                  <DropdownMenuLabel className="font-black text-xs uppercase tracking-wide text-slate-600">
                    Claim alerts
                  </DropdownMenuLabel>
                  <p className="px-2 pb-2 text-xs text-muted-foreground leading-snug">
                    When someone finds your lost report, it appears here so you can confirm and claim it.
                  </p>
                  <DropdownMenuSeparator />
                  {pendingCount === 0 ? (
                    <div className="px-2 py-3 text-sm text-muted-foreground">
                      No items waiting — you&apos;re all caught up.
                    </div>
                  ) : (
                    <div className="max-h-[min(60vh,16rem)] space-y-2 overflow-y-auto px-1 py-0.5">
                      {pendingClaims.map((item) => (
                        <DropdownMenuItem
                          key={item._id}
                          asChild
                          className="w-full cursor-pointer p-0 focus:bg-transparent data-[highlighted]:bg-transparent"
                        >
                          <Link
                            href={`/records/${encodeURIComponent(item._id)}`}
                            className="group flex w-full flex-col gap-2 rounded-xl border-2 border-black bg-white px-3 py-2.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] outline-none transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out will-change-transform hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-amber-50 hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                          >
                            <span className="font-black leading-tight text-slate-900 line-clamp-2 transition-colors group-hover:text-slate-950">
                              {item.name || 'Your item'}
                            </span>
                            <span className="inline-flex w-fit rounded-full border border-amber-700/25 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 transition-[background-color,border-color,transform] duration-200 group-hover:border-amber-800/40 group-hover:bg-amber-200/90">
                              Found — pending your claim
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type="button"
                variant="outline"
                onClick={() => void logout()}
                className="rounded-full border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] gap-1.5 px-4"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Avatar className="h-10 w-10 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <AvatarFallback className="bg-slate-200 font-bold">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={notificationBellButtonClass}
                    aria-label="Notifications"
                    onPointerEnter={handleNotifPointerEnter}
                    onPointerLeave={scheduleNotifClose}
                  >
                    <Bell aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className={cn(dropdownPanelClass, 'min-w-[min(100vw-2rem,20rem)] max-w-[20rem]')}
                  onPointerEnter={handleNotifPointerEnter}
                  onPointerLeave={scheduleNotifClose}
                >
                  <DropdownMenuLabel className="font-black text-xs uppercase tracking-wide text-slate-600">
                    Claim alerts
                  </DropdownMenuLabel>
                  <p className="px-2 pb-2 text-xs text-muted-foreground leading-snug">
                    When someone finds your lost report, it appears here so you can confirm and claim it.
                  </p>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg font-medium focus:bg-slate-100">
                    <Link href="/auth/login">Sign in to see claim alerts</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                asChild
                variant="outline"
                className="rounded-full border border-black bg-white text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-black px-5"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
