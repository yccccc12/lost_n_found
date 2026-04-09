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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const HOVER_CLOSE_DELAY_MS = 140

const dropdownPanelClass =
  'min-w-[12rem] rounded-xl border-2 border-black bg-white p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] origin-top duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'

const triggerClass =
  'inline-flex items-center gap-1 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-black rounded-sm data-[state=open]:underline underline-offset-4'

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

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setEmail(null)
    router.push('/')
    router.refresh()
  }

  const initial = email?.[0]?.toUpperCase() ?? ''

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
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {loading ? (
            <span className="text-xs font-medium text-muted-foreground tabular-nums">…</span>
          ) : email ? (
            <>
              <div className="hidden min-w-0 max-w-[200px] sm:flex flex-col items-end text-right">
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Signed in
                </span>
                <span className="truncate text-xs font-semibold text-slate-800" title={email}>
                  {email}
                </span>
              </div>
              <Avatar className="h-10 w-10 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <AvatarFallback className="bg-amber-100 font-black text-slate-900">
                  {initial ? (
                    initial
                  ) : (
                    <User className="h-5 w-5" aria-hidden />
                  )}
                </AvatarFallback>
              </Avatar>
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
