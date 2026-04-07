'use client'

import Link from 'next/link'
import { MapPin, Plus } from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useEffect, useState } from "react";

const btnOutline =
  'rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
const cardSurface =
  'border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden'
const chip =
  'rounded-full border-2 border-black text-xs font-bold px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border-4 border-black bg-white/40 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] backdrop-blur-xl">
        <SiteHeader />

        <div className="mx-auto max-w-6xl space-y-14 px-5 py-10 sm:px-8 sm:py-12 md:space-y-20 md:py-14">
          {/* Hero */}
          <section className="max-w-2xl space-y-5 text-left">
            <Badge className="rounded-full border-2 border-black bg-orange-200 px-3 py-1 font-black uppercase tracking-wide text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              Campus pulse live
            </Badge>
            <h1 className="text-balance text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
              <span className="text-slate-900">Recover your lost items,</span>{' '}
              <span className="text-orange-600">reconnect with campus.</span>
            </h1>
            <p className="text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
              The official university portal for tracking and reporting found belongings. Verified,
              secure, and student-first.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button asChild variant="outline" className={btnOutline}>
                <Link href="/found">Browse found items</Link>
              </Button>
              <Button
                asChild
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border-2 border-black bg-slate-900 px-4 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-900"
              >
                <Link href="/report">
                  <Plus className="h-4 w-4 shrink-0" aria-hidden />
                  Report Lost Item
                </Link>
              </Button>
            </div>
          </section>

          {/* Recent found */}
          <section className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Recent found items</h2>
              <div className="h-1 w-20 rounded-full bg-black" aria-hidden />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
              <Card className={`${cardSurface} flex flex-col lg:col-span-2`}>
                <div className="relative aspect-[16/10] border-b-4 border-black bg-muted">
                  <img
                    src="https://picsum.photos/seed/landing-mac/960/600"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className={`${chip} bg-slate-900 text-white`}>Electronics</span>
                    <span className={`${chip} bg-white text-black`}>Just Found</span>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-black">MacBook Pro</CardTitle>
                  <CardDescription className="space-y-1 text-sm font-medium text-foreground/80">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span>Oct 24, 2:15 PM</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                        Main Library, 3rd Floor East Wing
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="leading-relaxed text-muted-foreground">
                    Space gray 14&quot; laptop in a navy sleeve. Reported by library staff after closing
                    hours.
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-3 border-t-2 border-black/10 pt-6">
                  <Button
                    className={`${btnOutline} bg-slate-900 text-white hover:bg-slate-900`}
                    asChild
                  >
                    <Link href="/found/f3">Claim ownership</Link>
                  </Button>
                  <Button variant="outline" className={`${btnOutline} bg-white`} asChild>
                    <Link href="/found/f3">Details</Link>
                  </Button>
                </CardFooter>
              </Card>

              <div className="flex flex-col gap-5 lg:gap-6">
                <Card className={`${cardSurface} flex flex-1 flex-col`}>
                  <div className="relative h-36 border-b-4 border-black">
                    <img
                      src="https://picsum.photos/seed/landing-keys/400/200"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className={`absolute left-2 top-2 ${chip} bg-amber-100 px-2 py-0.5`}>
                      Essentials
                    </span>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-black">Keys with red lanyard</CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className={`w-full ${btnOutline}`} asChild>
                      <Link href="/found/f4">View item</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className={`${cardSurface} flex flex-1 flex-col`}>
                  <div className="relative h-36 border-b-4 border-black">
                    <img
                      src="https://picsum.photos/seed/landing-book/400/200"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className={`absolute left-2 top-2 ${chip} bg-blue-100 px-2 py-0.5`}>
                      Books
                    </span>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-black">Chemistry textbook</CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className={`w-full ${btnOutline}`} asChild>
                      <Link href="/found/f5">View item</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <Card className={`${cardSurface} flex flex-col gap-4 p-5 sm:flex-row sm:items-center`}>
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <img
                    src="https://picsum.photos/seed/landing-id/128/128"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-black">Student ID: James…</p>
                  <p className="text-sm text-muted-foreground">Found: Quad area</p>
                </div>
                <Badge className="shrink-0 rounded-full border-2 border-black bg-red-500 font-bold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  Immediate claim
                </Badge>
              </Card>
              <Card className={`${cardSurface} flex flex-col gap-4 p-5 sm:flex-row sm:items-center`}>
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <img
                    src="https://picsum.photos/seed/landing-pod/128/128"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-black">AirPod (right side)</p>
                  <p className="text-sm text-muted-foreground">Found: Gym locker room</p>
                </div>
                <Badge className="shrink-0 rounded-full border-2 border-black bg-blue-600 font-bold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  Pending
                </Badge>
              </Card>
            </div>
          </section>

          {/* Blockchain Section START */}
          <section className="mt-12">
            <div className="p-6 bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_black]">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  🔗 Blockchain Verification Log
                </h2>

                <Link
                  href="/records"
                  className="border-2 border-black px-3 py-1 rounded-md text-sm font-medium hover:bg-black hover:text-white transition duration-200"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-2">

                {/* Row 1 */}
                <div className="flex justify-between items-center border-b pb-2 hover:bg-gray-50 transition duration-200 px-2 rounded">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">0xA1B2C3</p>
                    <p className="text-sm">Lost & Found → Student ID: 12345</p>
                  </div>

                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                    Verified
                  </span>
                </div>

                {/* Row 2 */}
                <div className="flex justify-between items-center border-b pb-2 hover:bg-gray-50 transition duration-200 px-2 rounded">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">0xD4E5F6</p>
                    <p className="text-sm">Student → Lost & Found</p>
                  </div>

                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                    Pending
                  </span>
                </div>

              </div>
            </div>
          </section>
          {/*  Blockchain Section END */}

          {/* Activity stats */}
          <section className="rounded-2xl border-4 border-black bg-slate-900 p-8 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-10">
            <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
              <p className="text-3xl font-black tracking-tight sm:text-4xl">128 found today</p>
              <p className="text-3xl font-black tracking-tight sm:text-4xl">94% return rate</p>
            </div>
            <p className="mt-8 max-w-3xl border-t-2 border-white/20 pt-8 text-sm italic leading-relaxed text-white/90 sm:text-base">
              Verified accounts help us ensure lost items find their rightful owners faster. Check your
              student portal for updates.
            </p>
          </section>

          {/* Orange CTA */}
          <section className="rounded-2xl border-4 border-black bg-orange-500 p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-10">
            <div className="mx-auto max-w-2xl space-y-4">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Can&apos;t find your item?
              </h2>
              <p className="font-medium leading-relaxed text-slate-900/90">
                Submit a lost item report and we&apos;ll notify you the moment a matching item is turned in
                to any campus security post.
              </p>
              <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row sm:flex-wrap">
                <Button
                  asChild
                  className={`${btnOutline} bg-slate-900 text-white hover:bg-slate-900`}
                >
                  <Link href="/report">Submit lost report</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className={`${btnOutline} bg-white/90 text-slate-900 hover:bg-white`}
                >
                  <Link href="/map">View campus map</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>

        <SiteFooter className="mt-0" />
      </div>
    </div>
  )
}