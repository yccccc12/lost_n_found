'use client'

import dynamic from 'next/dynamic'

export const CampusMapLoader = dynamic(
  () => import('./campus-map-view').then((mod) => mod.CampusMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border-4 border-black bg-muted/50 font-bold text-muted-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        Loading map…
      </div>
    ),
  },
)
