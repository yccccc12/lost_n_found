'use client'

import Link from 'next/link'
import { Bell, Search, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SiteHeader() {
  return (
    <header className="border-b-4 border-black bg-white/40 backdrop-blur-md px-4 sm:px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
        <Link
          href="/"
          className="order-1 text-xl sm:text-2xl font-black tracking-tight shrink-0 md:order-none md:min-w-[200px]"
        >
          Campus Lost &amp; Found
        </Link>

        <div className="order-2 flex flex-1 justify-center min-w-0 md:order-none">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
              aria-hidden
            />
            <Input
              placeholder="Search for items..."
              className="w-full rounded-full border-2 border-black pl-9 pr-4 py-2.5 bg-white font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              aria-label="Search for items"
            />
          </div>
        </div>

        <div className="order-3 flex flex-wrap items-center justify-end gap-2 sm:gap-3 shrink-0 md:order-none md:min-w-[200px]">
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
