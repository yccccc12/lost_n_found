'use client'

import Link from 'next/link'
import { Bell, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
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

          <nav className="flex flex-wrap gap-6 text-sm font-medium">
            <Link href="/">Home</Link>
            <Link href="/found">Browse</Link>
            <Link href="/report">Report</Link>
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
        </div>
      </div>
    </header>
  )
}